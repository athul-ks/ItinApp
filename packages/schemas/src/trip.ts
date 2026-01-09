import { z } from 'zod';

// A single place/activity
const ActivitySchema = z.object({
  name: z.string(),
  description: z.string().describe('Concise description of what to do'),
  startTime: z.string().describe("e.g., '09:00'"),
  endTime: z.string().describe("e.g., '10:30'"),
  cost: z.number().describe('Ticket price in currency. 0 if free.'),
  travelTime: z.string().describe('Time to get here from previous spot'),
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
  restaurantSuggestions: z.array(RestaurantSchema).describe('Sugest 2-3 options'),
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
  vibe: z.enum(['Fast Paced', 'Balanced', 'Relaxed']),
  highlights: z.array(z.string()),
  itinerary: z.array(DayPlanSchema),
});

export const TripOptionsSchema = z.array(TripOptionSchema);

export const TripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  destination: z.string(),
  // Dates are strings when coming from JSON API, but Date objects in DB.
  // z.coerce.date() handles both nicely.
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  budget: z.enum(['low', 'moderate', 'high']),
  tripData: TripOptionsSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

// Export Types derived from Zod
export type TripOption = z.infer<typeof TripOptionSchema>;
export type Trip = z.infer<typeof TripSchema>;
