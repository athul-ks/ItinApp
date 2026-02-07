import { TripOption } from './trip';

export const E2E_CONSTANTS = {
  USER_ID: 'e2e-test-user-id',
  TRIP_ID: 'e2e-test-trip-id',
  EMAIL: 'e2e@test.com',
};

export const MOCK_TRIP_DATA: TripOption[] = [
  {
    id: 'option-1',
    title: 'Balanced Paris Adventure',
    vibe: 'Balanced',
    totalCostEstimate: '£1200',
    description: 'A perfect mix of sightseeing and relaxation.',
    highlights: ['Eiffel Tower', 'Louvre Museum'],
    itinerary: [
      {
        day: 1,
        theme: 'Iconic Paris',
        dailyFoodBudget: 50,
        dailyTransportBudget: 20,
        accommodation: {
          name: 'Hotel Le M',
          location: 'Montparnasse',
          reason: 'Central and affordable',
        },
        morning: {
          activities: [
            {
              name: 'Visit Eiffel Tower',
              description: 'The iron lady awaits.',
              cost: 25,
              travelTime: '15 mins',
              lat: 48.8584,
              lng: 2.2945,
              startTime: '09:00',
              endTime: '11:00',
            },
          ],
          restaurantSuggestions: [
            {
              name: 'Cafe Central',
              cuisine: 'French',
              cost: '£20',
              rating: '4.5/5',
              lat: 48.859,
              lng: 2.295,
            },
          ],
        },
        afternoon: {
          activities: [],
          restaurantSuggestions: [],
        },
        evening: {
          activities: [],
          restaurantSuggestions: [],
        },
      },
    ],
  },
];
