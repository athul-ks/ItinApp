import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- 1. SCHEMAS ---

// A single place/activity
const ActivitySchema = z.object({
  name: z.string(),
  description: z.string().describe("Concise description of what to do"),
  startTime: z.string().describe("e.g., '09:00'"),
  endTime: z.string().describe("e.g., '10:30'"),
  cost: z.number().describe("Ticket price in currency. 0 if free."),
  travelTime: z.string().describe("Time to get here from previous spot"),
});

// A restaurant option
const RestaurantSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  cost: z.string().describe("Approx cost (e.g. '£25')"),
  rating: z.string().describe("e.g. '4.5/5'"),
});

// A section of the day
const DaySectionSchema = z.object({
  activities: z.array(ActivitySchema),
  restaurantSuggestions: z.array(RestaurantSchema).describe("Sugest 2-3 options"),
});

// A full single day
const DayPlanSchema = z.object({
  day: z.number(),
  theme: z.string(),
  accommodation: z.object({
    name: z.string(),
    location: z.string(),
    reason: z.string(),
  }),
  morning: DaySectionSchema,
  afternoon: DaySectionSchema,
  evening: DaySectionSchema,
  dailyFoodBudget: z.number(),
  dailyTransportBudget: z.number(),
});

// The full Trip Option
const TripOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  totalCostEstimate: z.string(),
  vibe: z.enum(["Fast Paced", "Balanced", "Relaxed"]),
  highlights: z.array(z.string()),
  itinerary: z.array(DayPlanSchema),
});

// FORCE EXACTLY 3 OPTIONS
const TripResponseSchema = z.object({
  options: z.array(TripOptionSchema).length(3, "You must generate exactly 3 options: Fast Paced, Balanced, and Relaxed."),
});

// --- 2. ROUTER ---

export const tripRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        destination: z.string(),
        dateRange: z.object({ from: z.date(), to: z.date() }),
        budget: z.enum(["low", "moderate", "high"]),
      })
    )
    .mutation(async ({ input }) => {
      let duration = Math.ceil(
        (input.dateRange.to.getTime() - input.dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

      // SAFETY: Cap duration at 5 days for this detailed mode to prevent timeout/token limits
      // If we need > 5 days, we would need to switch to "Lazy Loading" architecture.
      if (duration > 5) duration = 5; 

      const budgetMap = {
        low: "Economy (Hostels, street food, public transport)",
        moderate: "Standard (3-4 star hotels, casual dining, mix of transit)",
        high: "Luxury (5-star hotels, fine dining, private transfers)",
      };

      const systemPrompt = `
        You are an expert travel planner. Create exactly 3 distinct itineraries for ${input.destination}.
        Duration: ${duration} Days.
        Budget: ${budgetMap[input.budget]}.
        
        CRITICAL: YOU MUST GENERATE ALL 3 OPTIONS. DO NOT STOP AFTER THE FIRST ONE.
        
        1. **Option 1: Fast Paced** - High energy, maximum sights. Pack the schedule.
        2. **Option 2: Balanced** - Moderate pace.
        3. **Option 3: Relaxed** - Low stress, leisure focus.
        
        For each option, provide a HIGHLY DETAILED day-by-day itinerary including:
        - Specific times (Morning/Afternoon/Evening).
        - Travel times between locations.
        - 2-3 Restaurant suggestions per meal slot matching the budget.
        - Accommodation suggestion for the night.
        
        Note: Keep descriptions concise to ensure you have space to generate ALL 3 distinct plans.
      `;

      try {
        const response = await openai.responses.parse({
          model: "gpt-4o-2024-08-06",
          input: [
            { role: "system", content: "You are a helpful travel assistant. You ALWAYS generate 3 options." },
            { role: "user", content: systemPrompt },
          ],
          text: {
            format: zodTextFormat(TripResponseSchema, "trip_options"),
          },
        });

        const parsedData = response.output_parsed;
        
        if (!parsedData?.options || parsedData.options.length !== 3) {
           console.error(`Only received ${parsedData?.options?.length} options.`);
           throw new Error("AI failed to generate all 3 options. Please try again.");
        }

        return parsedData.options;
      } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Failed to generate trip options. Please try again.");
      }
    }),
});
