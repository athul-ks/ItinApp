import { notFound } from 'next/navigation';

import { getDestinationImage } from '@/lib/unsplash';
import { api } from '@/trpc/server';

import TripView from './trip-view';

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let trip;
  let image;

  try {
    trip = await api.trip.getById({ id });
    image = await getDestinationImage(trip.destination);
  } catch {
    // We treat both NOT_FOUND and FORBIDDEN as 404 to avoid leaking existence of trips.
    return notFound();
  }

  return <TripView trip={trip} image={image} />;
}
