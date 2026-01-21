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
      const userId = (token.id as string) || (token.sub as string);
      if (token && session.user && userId) {
        session.user.id = userId;

        // Fetch fresh credits from DB every time session is checked
        // (This ensures the UI updates after a page reload)
        const user = await db.user.findUnique({ where: { id: userId } });
        session.user.credits = user?.credits ?? 0;
      }
      return session;
    },
  },

  events: {
    createUser: async () => {
      const webhookUrl = env.DISCORD_WEBHOOK_URL;
      // Send the message to Discord
      // SAFETY: We strictly avoid sending PII (name, email, image) to external webhooks
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '🚀 **New User Signed Up!**',
          embeds: [
            {
              title: 'New Registration',
              description: 'A new user has joined the platform.',
              color: 5814783,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    },
  },
};
