import { db } from '../db';
import { rateLimits } from '../schema';
import { eq, and, gt } from 'drizzle-orm';
import { getRequestIp } from './rateLimit';

interface LoginProtectionResult {
  allowed: boolean;
  reason?: string;
}

async function getOrCreateCounter(key: string, windowSeconds: number): Promise<number> {
  const existing = await db.select()
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.expires_at, new Date())))
    .limit(1);

  if (existing[0]) {
    const newHits = existing[0].hits + 1;
    await db.update(rateLimits)
      .set({ hits: newHits })
      .where(eq(rateLimits.id, existing[0].id));
    return newHits;
  }

  const expiresAt = new Date(Date.now() + windowSeconds * 1000);
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
  await db.insert(rateLimits).values({ key, hits: 1, expires_at: expiresAt });
  return 1;
}

export async function protectLogin(
  request: Request,
  email: string,
  options: { perIpPerHourLimit?: number; perEmailPerHourLimit?: number } = {}
): Promise<LoginProtectionResult> {
  const { perIpPerHourLimit = 50, perEmailPerHourLimit = 15 } = options;

  try {
    const ip = getRequestIp(request);

    // Check IP attempts (don't increment yet, just check)
    const ipKey = `login_ip:${ip}`;
    const ipRow = await db.select()
      .from(rateLimits)
      .where(and(eq(rateLimits.key, ipKey), gt(rateLimits.expires_at, new Date())))
      .limit(1);

    if (ipRow[0] && ipRow[0].hits >= perIpPerHourLimit) {
      return {
        allowed: false,
        reason: 'Demasiados intentos de inicio de sesión desde esta IP. Intenta de nuevo en 1 hora.',
      };
    }

    // Check email attempts
    const emailKey = `login_email:${email}`;
    const emailRow = await db.select()
      .from(rateLimits)
      .where(and(eq(rateLimits.key, emailKey), gt(rateLimits.expires_at, new Date())))
      .limit(1);

    if (emailRow[0] && emailRow[0].hits >= perEmailPerHourLimit) {
      return {
        allowed: false,
        reason: 'Demasiados intentos de inicio de sesión para esta cuenta. Intenta de nuevo en 1 hora o recupera tu contraseña.',
      };
    }

    // Increment both counters
    await getOrCreateCounter(ipKey, 3600);
    await getOrCreateCounter(emailKey, 3600);

    return { allowed: true };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Login protection error:', error);
    return { allowed: true };
  }
}

export async function clearLoginAttempts(request: Request, email: string): Promise<void> {
  try {
    const ip = getRequestIp(request);
    await db.delete(rateLimits).where(eq(rateLimits.key, `login_ip:${ip}`));
    await db.delete(rateLimits).where(eq(rateLimits.key, `login_email:${email}`));
  } catch (error) {
    if (import.meta.env.DEV) console.error('Clear attempts error:', error);
  }
}

export async function recordLoginFailure(request: Request, email: string): Promise<void> {
  if (import.meta.env.DEV) console.log(`Failed login: ${email}`);
}
