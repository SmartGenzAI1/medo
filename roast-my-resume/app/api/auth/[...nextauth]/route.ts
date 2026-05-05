import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        
        // Check if user exists in Redis, if not set to free
        const existingTier = await redis.get<string>(`user:${user.id}:tier`);
        if (!existingTier) {
          await redis.set(`user:${user.id}:tier`, "free");
          token.tier = "free";
        } else {
          token.tier = existingTier;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        
        // Re-fetch tier from Redis on every session call
        const tier = await redis.get<string>(`user:${token.sub}:tier`);
        (session.user as any).tier = tier || "free";
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
