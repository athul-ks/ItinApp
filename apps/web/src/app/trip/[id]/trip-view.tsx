'use client';

import { useState } from 'react';

import Image from 'next/image';

import type { RouterOutputs } from '@/trpc/react';

import { ItineraryView } from './itinerary-view';

type Trip = RouterOutputs['trip']['getById'];
type TripOption = RouterOutputs['trip']['generate']['tripData'][number];

type TripViewProps = {
  trip: NonNullable<Trip>;
  image: { url: string; alt: string; credit: { name: string; link: string } } | null;
};

export default function TripView({ trip, image }: TripViewProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>();
  const tripOptions = trip.tripData as TripOption[];
  const selectedPlan = tripOptions.find((t) => t.id === selectedOptionId);

  if (selectedPlan) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <ItineraryView
          plan={selectedPlan}
          destinationLocation={{
            lat: trip.destinationLat ?? 0,
            lng: trip.destinationLng ?? 0,
          }}
          onBack={() => setSelectedOptionId(undefined)}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* === HERO SECTION (Full Width) === */}
      <div className="relative h-[55vh] min-h-125 w-full overflow-hidden bg-gray-900">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover opacity-80 blur-[1px]"
              priority
              sizes="100vw"
            />
            {/* stronger gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/50 to-gray-900/20" />

            <div className="absolute right-6 bottom-4 z-20 text-xs text-white/60">
              Photo by{' '}
              <a
                href={image.credit.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                {image.credit.name}
              </a>{' '}
              / Unsplash
            </div>
          </>
        ) : (
          // Fallback gradient
          <div className="absolute inset-0 bg-linear-to-br from-blue-950 to-purple-950" />
        )}

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pb-20 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
            Your Adventure Awaits
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-7xl">
            Trip to {trip.destination}
          </h1>
          <p className="mt-6 max-w-xl text-xl font-medium text-white/90 drop-shadow-sm">
            We&apos;ve curated {tripOptions.length} distinct itineraries for your {trip.budget}{' '}
            budget.
          </p>
        </div>
      </div>

      {/* === CARDS SECTION (Overlapping) === */}
      {/* Negative margin (-mt-24) pulls this section up over the image */}
      <div className="relative z-20 container mx-auto -mt-24 max-w-6xl px-4 pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          {tripOptions.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedOptionId(plan.id)}
              className="group bg-card hover:border-primary relative flex cursor-pointer flex-col justify-between rounded-2xl border p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
                    {plan.vibe}
                  </span>
                  <span className="text-lg font-bold">{plan.totalCostEstimate}</span>
                </div>
                <h3 className="group-hover:text-primary mb-3 text-2xl font-bold transition-colors">
                  {plan.title}
                </h3>
                <p className="text-muted-foreground mb-8 line-clamp-3 text-sm leading-relaxed">
                  {plan.description}
                </p>
                <div className="mb-8 space-y-3">
                  {plan.highlights.slice(0, 3).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="bg-primary/60 mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                      <span className="line-clamp-1 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="bg-primary/5 text-primary group-hover:bg-primary w-full rounded-xl py-3 text-sm font-bold transition-all group-hover:text-white group-hover:shadow-md">
                View Itinerary
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
