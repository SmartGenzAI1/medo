import { Redis } from "@upstash/redis";

// Validate required environment variables
if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error("Missing Upstash Redis environment variables");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export type UserTier = "free" | "pro";

/**
 * Gets the user's subscription tier from Redis
 * @param userId - The user ID to look up
 * @returns Promise resolving to the user's tier
 */
export async function getUserTier(userId: string): Promise<UserTier> {
  const tier = await redis.get<UserTier>(`user:${userId}:tier`);
  return tier === "pro" ? "pro" : "free";
}

/**
 * Sets the user's subscription tier in Redis
 * @param userId - The user ID to update
 * @param tier - The tier to set
 */
export async function setUserTier(userId: string, tier: UserTier) {
  await redis.set(`user:${userId}:tier`, tier);
}

/**
 * Checks and updates daily usage for rate limiting
 * @param userId - The user ID to check
 * @returns True if within limit, false if limit reached
 */
export async function checkDailyUsage(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const key = `usage:${userId}:${today}`;
  const count = await redis.get<number>(key);
  
  // Free users limited to 1 roast per day
  if (count && count >= 1) {
    return false;
  }
  
  await redis.set(key, (count || 0) + 1, { ex: 86400 }); // 24 hours
  return true;
}
