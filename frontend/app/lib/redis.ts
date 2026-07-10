import { sql } from "./db";

export type UserTier = "free" | "pro";

/**
 * Gets the user's subscription tier from Neon DB
 * @param userId - The user ID to look up
 * @returns Promise resolving to the user's tier
 */
export async function getUserTier(userId: string): Promise<UserTier> {
  try {
    const rows = await sql`SELECT tier FROM users WHERE id = ${userId}`;
    if (rows.length === 0) {
      return "free";
    }
    return rows[0].tier === "pro" ? "pro" : "free";
  } catch (error) {
    console.error("Error getting user tier from DB:", error);
    return "free";
  }
}

/**
 * Sets the user's subscription tier in Neon DB
 * @param userId - The user ID to update
 * @param tier - The tier to set
 */
export async function setUserTier(userId: string, tier: UserTier) {
  try {
    const tempEmail = `${userId}@temp.com`;
    await sql`
      INSERT INTO users (id, email, name, tier)
      VALUES (${userId}, ${tempEmail}, ${userId}, ${tier})
      ON CONFLICT (id) 
      DO UPDATE SET tier = EXCLUDED.tier
    `;
  } catch (error) {
    console.error("Error setting user tier in DB:", error);
    throw error;
  }
}

/**
 * Checks and updates daily usage for rate limiting in Neon DB
 * @param userId - The user ID to check
 * @returns True if within limit, false if limit reached
 */
export async function checkDailyUsage(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Check if user is Pro. Pro users have unlimited usage.
    const tier = await getUserTier(userId);
    if (tier === "pro") {
      return true;
    }

    const rows = await sql`
      SELECT count FROM usage_limits WHERE user_id = ${userId} AND date = ${today}
    `;

    const count = rows.length > 0 ? rows[0].count : 0;

    // Free users limited to 1 roast per day
    if (count >= 1) {
      return false;
    }

    if (rows.length > 0) {
      await sql`
        UPDATE usage_limits SET count = count + 1 WHERE user_id = ${userId} AND date = ${today}
      `;
    } else {
      await sql`
        INSERT INTO usage_limits (user_id, date, count) VALUES (${userId}, ${today}, 1)
      `;
    }
    return true;
  } catch (error) {
    console.error("Error checking daily usage in DB:", error);
    return false; // Fail closed for safety
  }
}
