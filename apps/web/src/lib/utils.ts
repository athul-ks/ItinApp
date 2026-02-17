import { Itinerary } from '@itinapp/schemas';

export function isValidItinerary(itinerary: unknown): itinerary is Itinerary {
  return !!itinerary && typeof itinerary === 'object' && 'days' in itinerary;
}
