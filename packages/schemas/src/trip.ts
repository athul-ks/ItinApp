import { z } from 'zod';

// --- ITINERARY COMPLEX JSON STRUCTURE ---

// A single place/activity
const ActivitySchema = z.object({
  name: z.string(),
  description: z.string().describe('Concise description of what to do'),
  startTime: z.string().describe("e.g., '09:00'"),
  endTime: z.string().describe("e.g., '10:30'"),
  cost: z.number().describe('Ticket price in currency. 0 if free.'),
  travelTime: z.string().describe('Time to get here from previous spot'),
  lat: z.number().describe('Latitude of the location'),
  lng: z.number().describe('Longitude of the location'),
});

// A restaurant option
const RestaurantSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  cost: z.string().describe("Approx cost (e.g. '£25')"),
  rating: z.string().describe("e.g. '4.5/5'"),
  lat: z.number().describe('Latitude of the restaurant'),
  lng: z.number().describe('Longitude of the restaurant'),
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

// The full Itinerary
export const ItinerarySchema = z.object({
  title: z.string(),
  description: z.string(),
  totalCostEstimate: z.string(),
  vibe: z.enum(['Fast Paced', 'Balanced', 'Relaxed']),
  highlights: z.array(z.string()),
  days: z.array(DayPlanSchema),
});

// --- API INPUT VALIDATION ---

export const TripInputSchema = z.object({
  destination: z
    .string()
    .trim()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must be under 100 characters')
    .refine((val) => !/\p{C}/u.test(val), {
      message: 'Destination cannot contain control characters (security restriction)',
    })
    .refine((val) => !val.includes('"""'), {
      message: 'Destination cannot contain triple quotes (security restriction)',
    }),
  dateRange: z.object({ from: z.date(), to: z.date() }).refine((data) => data.to >= data.from, {
    message: 'End date must be after start date',
    path: ['to'],
  }),
  budget: z.enum(['low', 'moderate', 'high']),
  vibe: z.enum(['packed', 'moderate', 'relaxed']),
});

// --- WORKER AND CACHE ---

const TripJobSchema = z.object({
  tripId: z.string(),
  userId: z.string(), // Helpful for refunding credits on total failure
  input: TripInputSchema,
});

// Used for trip response from AI and caching in Redis

export const TripResponseSchema = z.object({
  coordinates: z.object({
    lat: z.number().describe('Center latitude of the destination city'),
    lng: z.number().describe('Center longitude of the destination city'),
  }),
  itinerary: ItinerarySchema.describe('The complete detailed itinerary for the trip.'),
});

// Export Types derived from Zod
export type Activity = z.infer<typeof ActivitySchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type DaySection = z.infer<typeof DaySectionSchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
export type TripInput = z.infer<typeof TripInputSchema>;
export type TripJob = z.infer<typeof TripJobSchema>;
export type TripResponse = z.infer<typeof TripResponseSchema>;
