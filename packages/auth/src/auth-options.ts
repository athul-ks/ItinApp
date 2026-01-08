import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma as db } from "@itinapp/db";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        
        // Fetch fresh credits from DB every time session is checked
        // (This ensures the UI updates after a page reload)
        const user = await db.user.findUnique({ where: { id: token.id as string } });
        session.user.credits = user?.credits ?? 0;
      }
      return session;
    },
  },
};
