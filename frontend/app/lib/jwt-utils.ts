import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SHARE_JWT_SECRET || "fallback-secret-change-in-production"
);

export interface SharePayload {
  roast: string;
  glow_up: string;
  ats_rewrite?: string;
  intensity: "mild" | "spicy";
  created_at: number;
}

/**
 * Creates a JWT token for sharing roast results
 * @param payload - The share payload containing roast data
 * @returns Promise resolving to the JWT token
 */
export async function createShareToken(payload: SharePayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  
  return token;
}

/**
 * Verifies a share token and returns the payload
 * @param token - The JWT token to verify
 * @returns Promise resolving to the share payload or null if invalid
 */
export async function verifyShareToken(token: string): Promise<SharePayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SharePayload;
  } catch (error) {
    console.error("Invalid share token:", error);
    return null;
  }
}
