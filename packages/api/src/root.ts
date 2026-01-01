import { z } from "zod";
import { tripRouter } from "./router/trip";
import { createTRPCRouter, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
  // Health check endpoint
  hello: publicProcedure
    .input(z.object({ text: z.string() }).optional()) 
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),

  // Sub-routers
  trip: tripRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
