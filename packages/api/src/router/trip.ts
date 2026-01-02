import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
      // Simulate AI Processing Delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const days = Math.ceil(
        (input.dateRange.to.getTime() - input.dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const getBudgetPlans = () => {
        switch (input.budget) {
          case "low":
            return [
              {
                id: "low_1",
                title: "The Shoestring Backpacker",
                description: `Maximize your time in ${input.destination} with zero wasted funds. Focuses on free walking tours, public transit, and street food.`,
                totalCostEstimate: "$400 - $600",
                vibe: "Fast Paced",
                highlights: ["Free Museums", "Hostel Socials", "Public Parks"],
              },
              {
                id: "low_2",
                title: "Local Culture Dive",
                description: "Skip the tourist traps and live like a local. Affordable, authentic experiences off the beaten path.",
                totalCostEstimate: "$500 - $700",
                vibe: "Balanced",
                highlights: ["Local Markets", "Hidden Cafes", "Self-guided Tours"],
              },
              {
                id: "low_3",
                title: "Nature & City Mix",
                description: "Balance city sightseeing with free nature escapes. Perfect for keeping costs low while seeing it all.",
                totalCostEstimate: "$450 - $650",
                vibe: "Relaxed",
                highlights: ["Hiking Trails", "Picnic Spots", "Scenic Viewpoints"],
              },
            ];

          case "moderate":
            return [
              {
                id: "mod_1",
                title: "The Essential Explorer",
                description: `The perfect mix of must-see tourist spots and hidden gems in ${input.destination}. Great value for money.`,
                totalCostEstimate: "$1,200 - $1,500",
                vibe: "Balanced",
                highlights: ["City Pass Entry", "River Cruise", "Boutique Hotels"],
              },
              {
                id: "mod_2",
                title: "Foodie Adventure",
                description: "A culinary-focused itinerary that allocates budget towards mid-range dining and food tours.",
                totalCostEstimate: "$1,300 - $1,600",
                vibe: "Relaxed",
                highlights: ["Food Walking Tour", "Wine Tasting", "Cooking Class"],
              },
              {
                id: "mod_3",
                title: "Action Packed",
                description: "Squeeze every drop out of your trip with pre-booked tickets and efficient transport.",
                totalCostEstimate: "$1,400 - $1,700",
                vibe: "Fast Paced",
                highlights: ["Skip-the-line Tickets", "Nightlife", "Day Trips"],
              },
            ];

          case "high":
            return [
              {
                id: "high_1",
                title: "The Luxury Indulgence",
                description: "Experience the finest side of ${input.destination} with private transfers, 5-star dining, and exclusive access.",
                totalCostEstimate: "$3,500 - $5,000",
                vibe: "Relaxed",
                highlights: ["Private Chauffeur", "Michelin Dining", "Spa Day"],
              },
              {
                id: "high_2",
                title: "VIP Cultural Access",
                description: "Private after-hours tours of major landmarks and exclusive meet-and-greets.",
                totalCostEstimate: "$4,000+",
                vibe: "Balanced",
                highlights: ["Private Museum Tour", "Helicopter Ride", "Concierge Service"],
              },
              {
                id: "high_3",
                title: "High-End Adventure",
                description: "Combine luxury stays with premium active experiences like private yacht charters.",
                totalCostEstimate: "$3,800+",
                vibe: "Fast Paced",
                highlights: ["Private Yacht", "First Class Rail", "Exclusive Events"],
              },
            ];
        }
      };

      const plans = getBudgetPlans();
      
      // We manually cast here because TS might infer the specific strings too narrowly
      return plans as z.infer<typeof TripPlanSchema>[];
    }),
});
