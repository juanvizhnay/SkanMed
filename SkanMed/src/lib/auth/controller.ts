import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { db } from '../db';
import { doctors } from '../schema';
import { eq } from 'drizzle-orm';
import * as redis from './redis';
import { sendVerificationEmail, sendPasswordResetEmail } from './email';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || import.meta.env.JWT_SECRET || 'skanmed_default_secret'
);

interface PendingUser {
  email: string;
  hashedPassword: string;
  full_name: string;
  specialty: string;
  license_number?: string;
}

function generateRandomToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function registerUser(data: {
  email: string;
  password: string;
  full_name: string;
  specialty: string;
  license_number?: string;
}) {
  const { email, password, full_name, specialty, license_number } = data;

  if (!email || !password || !full_name || !specialty) {
    throw new Error('Email, contrasena, nombre completo y especialidad son requeridos.');
  }
  if (password.length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres.');
  }
  const hasUpperOrSymbol = /[A-Z!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
  if (!hasUpperOrSymbol) {
    throw new Error('La contrasena debe contener al menos una mayuscula o simbolo especial.');
  }

  const existing = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Este correo ya esta registrado. Por favor inicia sesion.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = generateRandomToken();

  const pendingData: PendingUser = {
    email, hashedPassword, full_name, specialty,
    license_number: license_number || undefined
  };

  await redis.setEx(`verify:${verificationToken}`, 86400, JSON.stringify(pendingData));
  await sendVerificationEmail(email, verificationToken);

  return {
    success: true,
    message: 'Cuenta creada. Por favor verifica tu correo electronico.',
    email,
    verificationToken
  };
}

export async function verifyEmail(token: string) {
  const data = await redis.get(`verify:${token}`);
  if (!data) throw new Error('Token invalido o expirado.');

  const pending: PendingUser = typeof data === 'string' ? JSON.parse(data) : data;

  const existing = await db.select().from(doctors).where(eq(doctors.email, pending.email)).limit(1);
  if (existing.length > 0) {
    await redis.del(`verify:${token}`);
    throw new Error('Este usuario ya fue verificado.');
  }

  const slug = generateSlug(pending.full_name);

  const result = await db.insert(doctors).values({
    email: pending.email,
    password_hash: pending.hashedPassword,
    full_name: pending.full_name,
    specialty: pending.specialty,
    license_number: pending.license_number || null,
    slug
  }).returning();

  const newUser = result[0];
  await redis.del(`verify:${token}`);

  const jwtToken = await new SignJWT({ id: newUser.id, email: newUser.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1825d')
    .sign(JWT_SECRET);

  return {
    success: true,
    message: 'Correo verificado exitosamente.',
    token: jwtToken,
    user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name, specialty: newUser.specialty, slug: newUser.slug }
  };
}

export async function loginUser(email: string, password: string) {
  if (!email || !password) throw new Error('Email y contrasena son requeridos.');

  if (redis.default) {
    const loginKey = `login_attempts:${email}`;
    const attempts = parseInt(String(await redis.get(loginKey) || '0'), 10);
    if (attempts >= 15) {
      throw new Error('Demasiados intentos de inicio de sesion. Intenta de nuevo en 1 hora.');
    }
    await redis.incr(loginKey);
    await redis.expire(loginKey, 3600);
  }

  const userResult = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1);
  const user = userResult[0];
  if (!user) throw new Error('Credenciales invalidas.');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Credenciales invalidas.');

  const token = await new SignJWT({ id: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1825d')
    .sign(JWT_SECRET);

  return {
    success: true, token,
    user: { id: user.id, email: user.email, full_name: user.full_name, specialty: user.specialty, slug: user.slug }
  };
}

export async function forgotPassword(email: string) {
  if (!email) throw new Error('Email requerido.');

  const userResult = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1);
  const user = userResult[0];

  if (user) {
    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(doctors)
      .set({ password_reset_token: resetToken, password_reset_expires: expires })
      .where(eq(doctors.id, user.id));

    await sendPasswordResetEmail(email, resetToken);
  }

  return { success: true, message: 'Si el correo esta registrado, recibiras un enlace para restablecer tu contrasena.' };
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) throw new Error('Token y nueva contrasena son requeridos.');
  if (newPassword.length < 8) throw new Error('La contrasena debe tener al menos 8 caracteres.');

  const hasUpperOrSymbol = /[A-Z!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(newPassword);
  if (!hasUpperOrSymbol) throw new Error('La contrasena debe contener al menos una mayuscula o simbolo especial.');

  const userResult = await db.select().from(doctors).where(eq(doctors.password_reset_token, token)).limit(1);
  const user = userResult[0];

  if (!user || !user.password_reset_expires) throw new Error('Token invalido o expirado.');
  if (new Date() > user.password_reset_expires) throw new Error('Token expirado.');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.update(doctors)
    .set({ password_hash: hashedPassword, password_reset_token: null, password_reset_expires: null })
    .where(eq(doctors.id, user.id));

  return { success: true, message: 'Contrasena actualizada exitosamente.' };
}

export async function verifyToken(token: string): Promise<{ id: number; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as { id: number; email: string };
  } catch {
    return null;
  }
}

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 30);
  const random = Math.random().toString(36).substring(2, 6);
  return `dr-${base}-${random}`;
}
