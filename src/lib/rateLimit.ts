import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const key = `ratelimit_${ip}`;
  const limit = 5; // Number of allowed requests per minute
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60);
  }

  if (current > limit) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  return null;
}
