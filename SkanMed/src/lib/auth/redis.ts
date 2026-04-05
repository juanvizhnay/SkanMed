import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

const REDIS_URL = process.env.REDIS_URL || import.meta.env.REDIS_URL;
const REDIS_TOKEN = process.env.REDIS_TOKEN || import.meta.env.REDIS_TOKEN;

if (REDIS_URL && REDIS_TOKEN) {
  redisClient = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
} else if (import.meta.env.DEV) {
  console.warn('Redis not configured (need REDIS_URL + REDIS_TOKEN from Upstash)');
}

export default redisClient;

export async function setEx(key: string, ttl: number, value: string) {
  if (!redisClient) return;
  return await redisClient.set(key, value, { ex: ttl });
}

export async function get(key: string) {
  if (!redisClient) return null;
  return await redisClient.get<string>(key);
}

export async function del(key: string) {
  if (!redisClient) return;
  return await redisClient.del(key);
}

export async function keys(pattern: string) {
  if (!redisClient) return [];
  const result = await redisClient.keys(pattern);
  return result;
}

export async function incr(key: string) {
  if (!redisClient) return 0;
  return await redisClient.incr(key);
}

export async function expire(key: string, seconds: number) {
  if (!redisClient) return;
  return await redisClient.expire(key, seconds);
}

export async function ttl(key: string) {
  if (!redisClient) return -2;
  return await redisClient.ttl(key);
}

export async function zAdd(key: string, members: Array<{ score: number; value: string }>) {
  if (!redisClient) return 0;
  const pipeline = redisClient.pipeline();
  for (const m of members) {
    pipeline.zadd(key, { score: m.score, member: m.value });
  }
  await pipeline.exec();
  return members.length;
}

export async function zCard(key: string) {
  if (!redisClient) return 0;
  return await redisClient.zcard(key);
}

export async function zRemRangeByScore(key: string, min: number, max: number) {
  if (!redisClient) return 0;
  return await redisClient.zremrangebyscore(key, min, max);
}

export { redisClient };
