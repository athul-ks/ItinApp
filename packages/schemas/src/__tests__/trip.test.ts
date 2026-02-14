import { describe, expect, it } from 'vitest';

import { ItinerarySchema } from '../trip';

// --- MOCK DATA GENERATORS (Helpers to keep tests clean) ---

const createValidActivity = () => ({
  name: 'Eiffel Tower',
  description: 'Iron lady of Paris',
  startTime: '09:00',
  endTime: '11:00',
  cost: 25,
  travelTime: '15 mins',
  lat: 48.8584,
  lng: 2.2945,
});

const createValidRestaurant = () => ({
  name: 'Le Jules Verne',
  cuisine: 'French',
  cost: '£100',
  rating: '4.8/5',
  lat: 48.8584,
  lng: 2.2945,
});

const createValidDaySection = () => ({
  activities: [createValidActivity()],
  restaurantSuggestions: [createValidRestaurant(), createValidRestaurant()],
});

const createValidDayPlan = (dayNum = 1) => ({
  day: dayNum,
  theme: 'City Highlights',
  accommodation: {
    name: 'Hotel Paris',
    location: 'Central Paris',
    reason: 'Close to everything',
  },
  morning: createValidDaySection(),
  afternoon: createValidDaySection(),
  evening: createValidDaySection(),
  dailyFoodBudget: 50,
  dailyTransportBudget: 20,
});

const createValidItinerary = () => ({
  title: 'Paris Express',
  description: 'A quick tour',
  totalCostEstimate: '£500',
  vibe: 'Balanced',
  highlights: ['Eiffel Tower', 'Louvre'],
  days: [createValidDayPlan(1)],
});

// --- TESTS ---

describe('Trip Schemas', () => {
  describe('ItinerarySchema', () => {
    it('should validate a fully populated complex itinerary', () => {
      const data = createValidItinerary();
      const result = ItinerarySchema.safeParse(data);

      if (!result.success) {
        console.error(JSON.stringify(result.error.format(), null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should fail if vibe is invalid enum', () => {
      const data = createValidItinerary();
      (data as any).vibe = 'Super Lazy';
      const result = ItinerarySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail if a nested activity is missing required fields', () => {
      const data = createValidItinerary();
      // Remove 'lat' from the first morning activity
      // @ts-expect-error Testing runtime validation
      delete data.days[0].morning.activities[0].lat;

      const result = ItinerarySchema.safeParse(data);
      expect(result.success).toBe(false);
      // Path should point to itinerary -> 0 -> morning -> activities -> 0 -> lat
      expect(result.error?.issues[0].path).toContain('lat');
    });
  });
});
