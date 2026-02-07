import { describe, expect, it } from 'vitest';

import * as TripExports from './trip';
// View what is actually exported

import { TripListSchema, TripOptionSchema } from './trip';

// Import everything

console.log('Debug Exports:', TripExports);

describe('Trip Schemas', () => {
  it('should validate a correct trip option', () => {
    const validOption = {
      id: 'trip_123',
      title: 'Fun Trip',
      description: 'A great time',
      totalCostEstimate: '$500',
      vibe: 'Relaxed',
      highlights: ['Beach', 'Bar'],
      itinerary: [],
    };

    const result = TripOptionSchema.safeParse(validOption);
    expect(result.success).toBe(true);
  });

  it('should fail if vibe is invalid', () => {
    const invalidOption = {
      id: 'trip_123',
      title: 'Fun Trip',
      description: 'A great time',
      totalCostEstimate: '$500',
      vibe: 'Super Chaotic',
      highlights: [],
      itinerary: [],
    };

    const result = TripOptionSchema.safeParse(invalidOption);
    expect(result.success).toBe(false);
  });

  describe('TripListSchema', () => {
    const baseTrip = {
      id: 'trip_list_1',
      userId: 'user_1',
      destination: 'Paris',
      destinationLat: 48.85,
      destinationLng: 2.35,
      startDate: new Date(),
      endDate: new Date(),
      budget: 'moderate',
      createdAt: new Date(),
    };

    it('should validate a trip with minimal tripData for lists', () => {
      const validListTrip = {
        ...baseTrip,
        tripData: [
          {
            description: 'A nice trip to Paris',
            // Other fields might be missing or partial, which is fine for List View
            extraField: 'Should be passed through',
          },
        ],
      };

      const result = TripListSchema.safeParse(validListTrip);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tripData[0]).toHaveProperty('extraField');
      }
    });

    it('should validate even if deep itinerary structures are invalid/missing', () => {
      // This is the key "DoS Protection" feature - we don't look deep
      const robustListTrip = {
        ...baseTrip,
        tripData: [
          {
            description: 'Valid Description',
            itinerary: 'This is not an array, which would fail strict validation but passes list validation',
          },
        ],
      };

      const result = TripListSchema.safeParse(robustListTrip);
      expect(result.success).toBe(true);
    });

    it('should fail if description is missing in tripData items', () => {
      const invalidListTrip = {
        ...baseTrip,
        tripData: [
          {
            // Missing description
            title: 'Only Title',
          },
        ],
      };

      const result = TripListSchema.safeParse(invalidListTrip);
      expect(result.success).toBe(false);
    });
  });
});
