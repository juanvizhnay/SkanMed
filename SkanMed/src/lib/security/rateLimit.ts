import { redisClient } from '../auth/redis';

/**
 * Sliding window rate limiter using Redis sorted sets
 * @param key - Unique key for this rate limit check
 * @param nowMs - Current timestamp in milliseconds
 * @param windowMs - Size of the sliding window in milliseconds
 * @param limit - Maximum number of events allowed in the window
 * @param ttlSeconds - TTL for the Redis key (defaults to 2x window)
 * @returns Object with limited status and current count
 */
export async function isRateLimited(
  key: string,
  nowMs: number,
  windowMs: number,
  limit: number,
  ttlSeconds: number = Math.ceil(windowMs / 1000) * 2
): Promise<{ limited: boolean; count: number }> {
  const windowStart = nowMs - windowMs;
  const zkey = `sw:${key}`;

  try {
    // Remove old entries outside the window
    await redisClient.zRemRangeByScore(zkey, 0, windowStart);

    // Add current event with score = timestamp
    await redisClient.zAdd(zkey, [{ score: nowMs, value: `${nowMs}` }]);

    // Count events in the current window
    const count = await redisClient.zCard(zkey);

    // Set TTL to auto-cleanup
    await redisClient.expire(zkey, ttlSeconds);

    return { limited: count > limit, count };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Rate limit error:', error);
    // Fail open - don't block on Redis errors
    return { limited: false, count: 0 };
  }
}

/**
 * Fixed window rate limiter using Redis INCR
 * @param key - Unique key for this rate limit check
 * @param windowSeconds - Duration of the fixed window in seconds
 * @param limit - Maximum number of events allowed in the window
 * @returns Object with limited status and current count
 */
export async function hitFixedWindow(
  key: string,
  windowSeconds: number,
  limit: number
): Promise<{ limited: boolean; count: number }> {
  const redisKey = `fw:${key}`;

  try {
    const current = await redisClient.incr(redisKey);

    // Set expiration only on first hit
    if (current === 1) {
      await redisClient.expire(redisKey, windowSeconds);
    }

    return { limited: current > limit, count: current };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Fixed window error:', error);
    // Fail open
    return { limited: false, count: 0 };
  }
}

/**
 * Set a cooldown period for a key
 * @param key - Unique key for the cooldown
 * @param seconds - Duration of the cooldown in seconds
 */
export async function setCooldown(key: string, seconds: number): Promise<void> {
  const redisKey = `cd:${key}`;
  try {
    await redisClient.setEx(redisKey, seconds, '1');
  } catch (error) {
    if (import.meta.env.DEV) console.error('Cooldown set error:', error);
  }
}

/**
 * Check if a key is in cooldown
 * @param key - Unique key to check
 * @returns Object with active status and remaining TTL
 */
export async function inCooldown(key: string): Promise<{ active: boolean; ttl: number }> {
  const redisKey = `cd:${key}`;
  try {
    const ttl = await redisClient.ttl(redisKey);
    return { active: ttl > 0, ttl };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Cooldown check error:', error);
    return { active: false, ttl: 0 };
  }
}

/**
 * Get client IP address from request
 * Handles proxies and different header formats
 */
export function getRequestIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // Fallback (won't work in most production scenarios)
  return 'unknown';
}

/**
 * Build a lightweight device fingerprint from request headers
 * @param request - The incoming request
 * @param explicitDeviceId - Optional device ID from client-side fingerprinting
 * @returns Device fingerprint hash
 */
export function buildDeviceId(request: Request, explicitDeviceId?: string): string {
  if (explicitDeviceId) {
    return explicitDeviceId;
  }

  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const timezone = request.headers.get('x-timezone') || '';

  const raw = `${userAgent}|${acceptLang}|${timezone}`;

  // Use Web Crypto API to create hash
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);

  // Simple hash using string manipulation (for server-side)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
