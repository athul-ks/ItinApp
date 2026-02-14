'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

import { TripLoading } from './trip-loading';

interface TripPollerProps {
  tripId: string;
  destination: string;
}

export function TripPoller({ tripId, destination }: TripPollerProps) {
  const router = useRouter();

  const { data: trip } = api.trip.getById.useQuery(
    { id: tripId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === 'COMPLETED' || status === 'FAILED' ? false : 3000;
      },
    }
  );

  useEffect(() => {
    if (trip?.status === 'COMPLETED') {
      router.refresh();
    }
  }, [trip?.status, router]);

  if (trip?.status === 'FAILED') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-red-600">Generation Failed</h2>
        <p className="text-muted-foreground">We couldn&apos;t generate a trip for {destination}.</p>
        <button
          onClick={() => router.push('/plan')}
          className="rounded-lg bg-black px-6 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <TripLoading destination={destination} />;
}
