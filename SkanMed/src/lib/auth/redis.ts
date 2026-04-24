import { db } from '../db';
import { rateLimits } from '../schema';
import { eq, and, gt, sql } from 'drizzle-orm';

/**
 * PostgreSQL-backed key-value store that replaces Redis.
 * Uses the rate_limits table with automatic expiration.
 */

export async function setEx(key: string, ttlSeconds: number, value: string) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
  await db.insert(rateLimits).values({ key, hits: 0, expires_at: expiresAt });
}

export async function get(key: string): Promise<string | null> {
  const result = await db.select()
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.expires_at, new Date())))
    .limit(1);
  if (!result[0]) return null;
  return String(result[0].hits);
}

export async function del(key: string) {
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}

export async function incr(key: string): Promise<number> {
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

  // If no row or expired, create new with 1 hour default TTL
  const expiresAt = new Date(Date.now() + 3600 * 1000);
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
  await db.insert(rateLimits).values({ key, hits: 1, expires_at: expiresAt });
  return 1;
}

export async function expire(key: string, seconds: number) {
  const expiresAt = new Date(Date.now() + seconds * 1000);
  await db.update(rateLimits)
    .set({ expires_at: expiresAt })
    .where(eq(rateLimits.key, key));
}

export async function ttl(key: string): Promise<number> {
  const result = await db.select()
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.expires_at, new Date())))
    .limit(1);
  if (!result[0]) return -2;
  return Math.ceil((result[0].expires_at.getTime() - Date.now()) / 1000);
}

export async function keys(_pattern: string): Promise<string[]> {
  return [];
}

export async function zAdd(_key: string, _members: Array<{ score: number; value: string }>): Promise<number> {
  return 0;
}

export async function zCard(_key: string): Promise<number> {
  return 0;
}

export async function zRemRangeByScore(_key: string, _min: number, _max: number): Promise<number> {
  return 0;
}

/**
 * Clean up expired rows periodically.
 * Call this occasionally (e.g. on login/register requests) to keep the table small.
 */
export async function cleanupExpired() {
  try {
    await db.delete(rateLimits).where(gt(new Date(), rateLimits.expires_at));
  } catch { /* ignore */ }
}

const redisClient = null;
export default redisClient;
export { redisClient };
