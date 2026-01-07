import { getServerAuthSession } from "@itinapp/auth";
import { prisma as db } from "@itinapp/db";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

// 1. Context: Receives the Request object from Next.js
export const createTRPCContext = async (opts: { req: Request }) => {
  const session = await getServerAuthSession();
  return {
    db,
    session,
    token: opts.req.headers.get("authorization"), // Example: Access headers easily
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
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// 3. Auth Middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// 4. Exports
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
