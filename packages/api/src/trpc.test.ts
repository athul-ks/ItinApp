import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from './trpc';

// Mock Sentry to verify it gets called
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock Console Error to keep test output clean
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('tRPC Middleware & Error Handling', () => {
  it('should format Zod errors correctly', async () => {
    const testRouter = createTRPCRouter({
      testValidation: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .query(() => 'success'),
    });

    const caller = createCallerFactory(testRouter)({
      db: {} as any,
      session: null,
      headers: new Headers(),
    });

    try {
      await caller.testValidation({ email: 'not-an-email' });
    } catch (error: any) {
      expect(error.cause).toBeInstanceOf(z.ZodError);
    }
  });

  it('should block unauthorized users in protectedProcedures', async () => {
    const testRouter = createTRPCRouter({
      protectedTest: protectedProcedure.query(() => 'secret'),
    });

    const caller = createCallerFactory(testRouter)({
      db: {} as any,
      session: null,
      headers: new Headers(),
    });

    await expect(caller.protectedTest()).rejects.toThrow('UNAUTHORIZED');
  });

  it('should log errors to Console and Sentry in errorLoggingMiddleware', async () => {
    const testRouter = createTRPCRouter({
      fail: publicProcedure.query(() => {
        throw new Error('Kaboom');
      }),
    });

    const caller = createCallerFactory(testRouter)({
      db: {} as any,
      session: null,
      headers: new Headers(),
    });

    await expect(caller.fail()).rejects.toThrow('Kaboom');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tRPC failed on fail'));

    const Sentry = await import('@sentry/nextjs');
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
