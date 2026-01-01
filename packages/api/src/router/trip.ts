import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Define the schema for the Trip Plan so we can reuse it if needed
export const TripPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  totalCostEstimate: z.string(),
  vibe: z.enum(["Fast Paced", "Balanced", "Relaxed"]),
  highlights: z.array(z.string()),
});

export const tripRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        destination: z.string(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
        budget: z.enum(["low", "moderate", "high"]),
      })
    )
    .mutation(async ({ input }) => {
      // Simulate AI Delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const days = Math.ceil(
        (input.dateRange.to.getTime() - input.dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Return the mock data (Type-safe!)
      return [
        {
          id: "opt_1",
          title: "The Budget Explorer",
          description: `Experience the best of ${input.destination} without breaking the bank. Focuses on walking tours and free landmarks.`,
          totalCostEstimate: "$450 - $600",
          vibe: "Fast Paced",
          highlights: ["City Walking Tour", "Local Street Food", "Public Parks"],
        },
        {
          id: "opt_2",
          title: "The Balanced Classic",
          description: `The perfect mix of must-see tourist spots and hidden gems. Optimized for ${days} days.`,
          totalCostEstimate: "$900 - $1,200",
          vibe: "Balanced",
          highlights: ["Top Museum Entry", "River Cruise", "Famous Cafe"],
        },
        {
          id: "opt_3",
          title: "The Luxury Indulgence",
          description: "Treat yourself to the finest experiences, private transfers, and top-tier dining.",
          totalCostEstimate: "$2,500+",
          vibe: "Relaxed",
          highlights: ["Private Guide", "Fine Dining", "Exclusive Access"],
        },
      ] satisfies z.infer<typeof TripPlanSchema>[];
    }),
});
