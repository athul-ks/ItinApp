import * as Sentry from '@sentry/nextjs';
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { getServerAuthSession } from '@itinapp/auth';
import { prisma as db } from '@itinapp/db';

// 1. Context: Updated to accept 'headers' (Standard for App Router)
// This works for both Client Requests (API Route) and Server Requests (RSC)
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();
  return {
    db,
    session,
    ...opts,
  };
};

// 2. Initialization
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// 3. Auth Middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const errorLoggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const result = await next();
  if (!result.ok) {
    console.error(`tRPC failed on ${path}: ${result.error.message}`);
    Sentry.captureException(result.error, {
      extra: { path, type },
    });
  }
  return result;
});

// 4. Exports
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(errorLoggingMiddleware);
export const protectedProcedure = t.procedure.use(errorLoggingMiddleware).use(enforceUserIsAuthed);
export const createCallerFactory = t.createCallerFactory;
