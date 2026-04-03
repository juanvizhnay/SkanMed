import type { AstroCookies } from 'astro';
import { verifyToken } from './controller';
import { db } from '../db';
import { doctors } from '../schema';
import { eq } from 'drizzle-orm';
import redisClient from './redis';

const doctorCache = new Map<number, { data: any; timestamp: number }>();
const MEMORY_CACHE_TTL = 5000;
const REDIS_CACHE_TTL = 300;

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

  if (redisClient) {
    try {
      const cached = await redisClient.get<string>(`doctor:session:${doctorId}`);
      if (cached) {
        const doctor = typeof cached === 'string' ? JSON.parse(cached) : cached;
        doctorCache.set(doctorId, { data: doctor, timestamp: Date.now() });
        return doctor;
      }
    } catch { /* fall through */ }
  }

  const doctorResult = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  const doctor = doctorResult[0] || null;

  if (doctor) {
    doctorCache.set(doctorId, { data: doctor, timestamp: Date.now() });
    if (redisClient) {
      try {
        await redisClient.set(`doctor:session:${doctorId}`, JSON.stringify(doctor), { ex: REDIS_CACHE_TTL });
      } catch { /* ignore */ }
    }
  }

  return doctor;
}

export async function invalidateDoctorCache(doctorId: number) {
  doctorCache.delete(doctorId);
  if (redisClient) {
    try { await redisClient.del(`doctor:session:${doctorId}`); } catch { /* ignore */ }
  }
}

export async function requireAuth(cookies: AstroCookies, redirectTo: string = '/') {
  const doctor = await getCurrentDoctor(cookies);
  if (!doctor) return { authenticated: false, doctor: null, redirect: redirectTo };
  return { authenticated: true, doctor, redirect: null };
}
