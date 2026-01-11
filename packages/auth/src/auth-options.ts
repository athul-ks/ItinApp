import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { prisma as db } from '@itinapp/db';
import { env } from '@itinapp/env';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  session: {
    strategy: 'jwt',
  },

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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

  events: {
    createUser: async ({ user }) => {
      const webhookUrl = env.DISCORD_WEBHOOK_URL;
      // Send the message to Discord
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '🚀 **New User Signed Up!**',
          embeds: [
            {
              title: user.name || 'Unknown Name',
              description: `Email: ${user.email}`,
              color: 5814783,
              thumbnail: { url: user.image },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    },
  },
};
