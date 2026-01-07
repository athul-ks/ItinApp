'use client';

import { use, useState } from 'react';

import { Loader2 } from 'lucide-react';

import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';

import { ItineraryView } from './itinerary-view';

type TripPlan = RouterOutputs['trip']['generate']['tripData'][number];

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() (Next.js 15 pattern)
  const resolvedParams = use(params);

  const {
    data: trip,
    isLoading,
    error,
  } = api.trip.getById.useQuery({
    id: resolvedParams.id,
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string>();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        Error loading trip: {error?.message || 'Trip not found'}
      </div>
    );
  }

  const tripOptions = trip.tripData as unknown as TripPlan[];
  const selectedPlan = tripOptions.find((t) => t.id === selectedOptionId);

  if (selectedPlan) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <ItineraryView plan={selectedPlan} onBack={() => setSelectedOptionId(undefined)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Your Trip to {trip.destination}</h1>
        <p className="text-muted-foreground mt-2">
          We generated 3 options based on your {trip.budget} budget.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tripOptions.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedOptionId(plan.id)}
            className="group bg-card hover:border-primary relative flex cursor-pointer flex-col justify-between rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium capitalize">
                  {plan.vibe}
                </span>
                <span className="text-sm font-bold">{plan.totalCostEstimate}</span>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-xl font-bold transition-colors">
                {plan.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{plan.description}</p>
              <div className="mb-6 space-y-2">
                {plan.highlights.slice(0, 3).map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                    <span className="line-clamp-1">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="border-primary text-primary group-hover:bg-primary w-full cursor-pointer rounded-lg border bg-transparent py-2 text-sm font-semibold transition-colors group-hover:text-white">
              View Itinerary
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
