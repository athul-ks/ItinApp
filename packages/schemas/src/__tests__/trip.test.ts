import { describe, expect, it } from 'vitest';

import { TripOptionSchema, TripSchema } from '../trip';

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

const createValidTripOption = () => ({
  id: 'opt_1',
  title: 'Paris Express',
  description: 'A quick tour',
  totalCostEstimate: '£500',
  vibe: 'Balanced',
  highlights: ['Eiffel Tower', 'Louvre'],
  itinerary: [createValidDayPlan(1)],
});

// --- TESTS ---

describe('Trip Schemas', () => {
  describe('TripOptionSchema', () => {
    it('should validate a fully populated complex trip option', () => {
      const data = createValidTripOption();
      const result = TripOptionSchema.safeParse(data);

      if (!result.success) {
        console.error(JSON.stringify(result.error.format(), null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should fail if vibe is invalid enum', () => {
      const data = createValidTripOption();
      (data as any).vibe = 'Super Lazy';
      const result = TripOptionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail if a nested activity is missing required fields', () => {
      const data = createValidTripOption();
      // Remove 'lat' from the first morning activity
      // @ts-expect-error Testing runtime validation
      delete data.itinerary[0].morning.activities[0].lat;

      const result = TripOptionSchema.safeParse(data);
      expect(result.success).toBe(false);
      // Path should point to itinerary -> 0 -> morning -> activities -> 0 -> lat
      expect(result.error?.issues[0].path).toContain('lat');
    });
  });

  describe('TripSchema', () => {
    it('should validate a full Trip object with date coercion', () => {
      const validTrip = {
        id: 'trip_root_1',
        userId: 'user_123',
        destination: 'Paris',
        destinationLat: 48.8566,
        destinationLng: 2.3522,
        startDate: '2024-05-01', // String input (Simulating API JSON)
        endDate: '2024-05-07', // String input
        budget: 'moderate',
        tripData: [createValidTripOption()],
        createdAt: new Date().toISOString(),
      };

      const result = TripSchema.safeParse(validTrip);

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify coercion worked (String -> Date object)
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });

    it('should fail on invalid budget enum', () => {
      const invalidTrip = {
        id: 'trip_root_2',
        userId: 'user_123',
        destination: 'London',
        destinationLat: 51.5,
        destinationLng: -0.1,
        startDate: new Date(),
        endDate: new Date(),
        budget: 'unlimited', // Invalid: must be low, moderate, high
        tripData: [],
        createdAt: new Date(),
      };

      const result = TripSchema.safeParse(invalidTrip);
      expect(result.success).toBe(false);
    });

    it('should fail if tripData is not an array', () => {
      const invalidTrip = {
        id: 'trip_root_3',
        userId: 'user_123',
        destination: 'Rome',
        destinationLat: 12,
        destinationLng: 12,
        startDate: new Date(),
        endDate: new Date(),
        budget: 'low',
        tripData: { ...createValidTripOption() }, // Object instead of Array
        createdAt: new Date(),
      };

      const result = TripSchema.safeParse(invalidTrip);
      expect(result.success).toBe(false);
    });
  });
});
