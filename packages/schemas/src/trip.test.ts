import { describe, expect, it } from 'vitest';

import * as TripExports from './trip';
// View what is actually exported

import { TripOptionSchema } from './trip';

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
});
