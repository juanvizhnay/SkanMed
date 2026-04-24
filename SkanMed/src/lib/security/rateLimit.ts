import { db } from '../db';
import { rateLimits } from '../schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Sliding window rate limiter using PostgreSQL
 */
export async function isRateLimited(
  key: string,
  nowMs: number,
  windowMs: number,
  limit: number
): Promise<{ limited: boolean; count: number }> {
  const windowStart = new Date(nowMs - windowMs);
  const zkey = `sw:${key}`;

  try {
    const result = await db.select()
      .from(rateLimits)
      .where(and(eq(rateLimits.key, zkey), gt(rateLimits.expires_at, windowStart)))
      .limit(1);

    if (result[0]) {
      const newHits = result[0].hits + 1;
      await db.update(rateLimits)
        .set({ hits: newHits, expires_at: new Date(nowMs + windowMs) })
        .where(eq(rateLimits.id, result[0].id));
      return { limited: newHits > limit, count: newHits };
    }

    const expiresAt = new Date(nowMs + windowMs);
    await db.insert(rateLimits).values({ key: zkey, hits: 1, expires_at: expiresAt });
    return { limited: 1 > limit, count: 1 };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Rate limit error:', error);
    return { limited: false, count: 0 };
  }
}

/**
 * Fixed window rate limiter using PostgreSQL
 */
export async function hitFixedWindow(
  key: string,
  windowSeconds: number,
  limit: number
): Promise<{ limited: boolean; count: number }> {
  const fwKey = `fw:${key}`;

  try {
    const existing = await db.select()
      .from(rateLimits)
      .where(and(eq(rateLimits.key, fwKey), gt(rateLimits.expires_at, new Date())))
      .limit(1);

    if (existing[0]) {
      const newHits = existing[0].hits + 1;
      await db.update(rateLimits)
        .set({ hits: newHits })
        .where(eq(rateLimits.id, existing[0].id));
      return { limited: newHits > limit, count: newHits };
    }

    const expiresAt = new Date(Date.now() + windowSeconds * 1000);
    await db.insert(rateLimits).values({ key: fwKey, hits: 1, expires_at: expiresAt });
    return { limited: 1 > limit, count: 1 };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Fixed window error:', error);
    return { limited: false, count: 0 };
  }
}

/**
 * Set a cooldown period for a key
 */
export async function setCooldown(key: string, seconds: number): Promise<void> {
  const cdKey = `cd:${key}`;
  const expiresAt = new Date(Date.now() + seconds * 1000);
  try {
    await db.delete(rateLimits).where(eq(rateLimits.key, cdKey));
    await db.insert(rateLimits).values({ key: cdKey, hits: 1, expires_at: expiresAt });
  } catch (error) {
    if (import.meta.env.DEV) console.error('Cooldown set error:', error);
  }
}

/**
 * Check if a key is in cooldown
 */
export async function inCooldown(key: string): Promise<{ active: boolean; ttl: number }> {
  const cdKey = `cd:${key}`;
  try {
    const result = await db.select()
      .from(rateLimits)
      .where(and(eq(rateLimits.key, cdKey), gt(rateLimits.expires_at, new Date())))
      .limit(1);
    if (!result[0]) return { active: false, ttl: 0 };
    const remaining = Math.ceil((result[0].expires_at.getTime() - Date.now()) / 1000);
    return { active: true, ttl: remaining };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Cooldown check error:', error);
    return { active: false, ttl: 0 };
  }
}

/**
 * Get client IP address from request
 */
export function getRequestIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Build a lightweight device fingerprint from request headers
 */
export function buildDeviceId(request: Request, explicitDeviceId?: string): string {
  if (explicitDeviceId) return explicitDeviceId;

  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const timezone = request.headers.get('x-timezone') || '';

  const raw = `${userAgent}|${acceptLang}|${timezone}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}
