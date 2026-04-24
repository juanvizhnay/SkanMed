import type { AstroCookies } from 'astro';
import { verifyToken } from './controller';
import { db } from '../db';
import { doctors } from '../schema';
import { eq } from 'drizzle-orm';

const doctorCache = new Map<number, { data: any; timestamp: number }>();
const MEMORY_CACHE_TTL = 5000;

export async function getCurrentDoctor(cookies: AstroCookies) {
  const sessionToken = cookies.get('session_token')?.value;
  if (!sessionToken) return null;

  const decoded = await verifyToken(sessionToken);
  if (!decoded) return null;

  const doctorId = decoded.id;

  const memCached = doctorCache.get(doctorId);
  if (memCached && Date.now() - memCached.timestamp < MEMORY_CACHE_TTL) {
    return memCached.data;
  }

  const doctorResult = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  const doctor = doctorResult[0] || null;

  if (doctor) {
    doctorCache.set(doctorId, { data: doctor, timestamp: Date.now() });
  }

  return doctor;
}

export async function invalidateDoctorCache(doctorId: number) {
  doctorCache.delete(doctorId);
}

export async function requireAuth(cookies: AstroCookies, redirectTo: string = '/login') {
  const doctor = await getCurrentDoctor(cookies);
  if (!doctor) return { authenticated: false, doctor: null, redirect: redirectTo };
  return { authenticated: true, doctor, redirect: null };
}
