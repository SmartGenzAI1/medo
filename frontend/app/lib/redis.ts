import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error("Missing Upstash Redis environment variables");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function getUserTier(userId: string): Promise<"free" | "pro"> {
  const tier = await redis.get<string>(`user:${userId}:tier`);
  return tier === "pro" ? "pro" : "free";
}

export async function setUserTier(userId: string, tier: "free" | "pro") {
  await redis.set(`user:${userId}:tier`, tier);
}

export async function checkDailyUsage(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const key = `usage:${userId}:${today}`;
  const count = await redis.get<number>(key);
  
  if (count && count >= 1) {
    return false; // Limit reached
  }
  
  await redis.set(key, (count || 0) + 1, { ex: 86400 }); // 24 hours
  return true;
}
