import { prisma as db } from "@itinapp/db";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

// 1. Context: Receives the Request object from Next.js
export const createTRPCContext = async (opts: { req: Request }) => {
  return {
    db,
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

// 3. Exports
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
