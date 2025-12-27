import { createTRPCRouter, publicProcedure } from "./src/trpc";
import { z } from "zod";

export const appRouter = createTRPCRouter({
  // A simple "hello" endpoint
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text} from tRPC!`,
      };
    }),

  // A generic "getUsers" endpoint to test the DB
  getUsers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany();
  }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
