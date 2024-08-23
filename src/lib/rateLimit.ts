import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 60; // Number of allowed requests per minute

  const entry = rateLimitMap.get(ip) || { count: 0, timestamp: now };

  if (now - entry.timestamp > windowMs) {
    entry.count = 0;
    entry.timestamp = now;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  if (entry.count > limit) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  return null;
}
