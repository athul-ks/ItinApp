import { notFound } from 'next/navigation';

import { getDestinationImage } from '@/lib/unsplash';
import { isValidItinerary } from '@/lib/utils';
import { api } from '@/trpc/server';
import { Trip } from '@/types/trpc';

import { TripPoller } from './trip-poller';
import { TripView } from './trip-view';

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let trip: Trip;

  try {
    trip = await api.trip.getById({ id });
  } catch {
    // We treat both NOT_FOUND and FORBIDDEN as 404 to avoid leaking existence of trips.
    return notFound();
  }

  if (trip.status === 'PENDING' || trip.status === 'PROCESSING') {
    return <TripPoller tripId={id} destination={trip.destination} />;
  }

  if (trip.status === 'COMPLETED' && isValidItinerary(trip.itinerary)) {
    const image = await getDestinationImage(trip.destination);
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <TripView
          itinerary={trip.itinerary}
          image={image}
          destinationLocation={{
            lat: trip.destinationLat ?? 0,
            lng: trip.destinationLng ?? 0,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-muted-foreground">No itinerary found for this trip.</p>
    </div>
  );
}
