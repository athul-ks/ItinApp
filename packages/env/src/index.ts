import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side Environment Variables
   * These are NOT available on the client.
   */
  server: {
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    OPENAI_API_KEY: z.string().min(1),
    UNSPLASH_ACCESS_KEY: z.string().min(1),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.preprocess(
      (str) =>
        process.env.NEXTAUTH_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : str),
      z.url().optional()
    ),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    DISCORD_WEBHOOK_URL: z.url(),
    ENABLE_E2E_MOCKS: z.enum(['true', 'false']).optional(),
  },

  /**
   * Client-side Environment Variables
   * These must be prefixed with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  },

  /**
   * Runtime Env Support
   * This is required for Next.js 13+ to detect the vars correctly
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    ENABLE_E2E_MOCKS: process.env.ENABLE_E2E_MOCKS,
  },

  /**
   * Skip validation for CI/CD environments if needed
   */
  skipValidation: !!process.env.CI,
});
