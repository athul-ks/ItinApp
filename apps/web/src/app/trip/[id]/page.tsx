import { notFound } from 'next/navigation';

import { prisma } from '@itinapp/db';
import { TripSchema } from '@itinapp/schemas';

import { getDestinationImage } from '@/lib/unsplash';

import TripView from './trip-view';

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
  });

  if (!trip) {
    return notFound();
  }

  const parsedTrip = TripSchema.parse(trip);
  const image = await getDestinationImage(parsedTrip.destination);

  return <TripView trip={parsedTrip} image={image} />;
}
