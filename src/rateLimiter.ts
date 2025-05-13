import Redis from "ioredis";

const redis = new Redis(); // Default Redis connection

export async function rateLimit(userId: string, limit: number, duration: number): Promise<boolean> {
  const key = `rate_limit:${userId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    // Set expiration for the key on the first increment
    await redis.expire(key, duration);
  }

  if (current > limit) {
    return false; // Rate limit exceeded
  }

  return true; // Within rate limit
}