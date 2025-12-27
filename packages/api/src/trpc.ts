import { db } from "@itenapp/db";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// 1. Context: What every request has access to (e.g., the DB)
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

// 2. Initialization
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson, // Allows sending Dates/Maps automatically
  errorFormatter({ shape }) {
    return shape;
  },
});

// 3. Exports
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
