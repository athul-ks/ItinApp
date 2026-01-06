'use client';

import { useState } from 'react';

import { CreditCard, DollarSign, Loader2, Wallet } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';

import { DateRangePicker } from '@/components/date-range-picker';
import { type RouterOutputs, api } from '@/trpc/react';

import { ItineraryView } from './itinerary-view';

// Type Inference will automatically pick up the NEW complex schema from trip.ts
type TripPlan = RouterOutputs['trip']['generate'][number];

export function PlanContents() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || 'Unknown Destination';

  const [selectedPlan, setSelectedPlan] = useState<TripPlan>();
  const [dateRange, setDateRange] = useState<DateRange>();
  const [budget, setBudget] = useState<'low' | 'moderate' | 'high'>('moderate');

  const generateTrip = api.trip.generate.useMutation();

  const handleGenerate = () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('Please select a date range first!');
      return;
    }

    setSelectedPlan(undefined);

    generateTrip.mutate({
      destination,
      dateRange: { from: dateRange.from, to: dateRange.to },
      budget,
    });
  };

  if (selectedPlan) {
    return (
      <div className="mx-auto max-w-4xl pb-20">
        <ItineraryView plan={selectedPlan} onBack={() => setSelectedPlan(undefined)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold">Trip to {destination}</h1>
        <p className="text-muted-foreground">
          Let&apos;s finalize the details to generate your perfect itinerary.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">When are you going?</label>
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">What is your budget?</label>
          <div className="grid grid-cols-3 gap-2">
            <BudgetOption
              label="Economy"
              value="low"
              current={budget}
              onClick={setBudget}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <BudgetOption
              label="Standard"
              value="moderate"
              current={budget}
              onClick={setBudget}
              icon={<Wallet className="h-4 w-4" />}
            />
            <BudgetOption
              label="Luxury"
              value="high"
              current={budget}
              onClick={setBudget}
              icon={<CreditCard className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generateTrip.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generateTrip.isPending ? (
          <>
            <Loader2 className="animate-spin" /> Generating Itineraries...
          </>
        ) : (
          'Generate My Trip Options'
        )}
      </button>

      {/* Results Section */}
      {generateTrip.isSuccess && generateTrip.data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
          <h2 className="border-b pb-2 text-xl font-semibold">Select your travel style</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {generateTrip.data.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="group relative flex cursor-pointer flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-black hover:shadow-md"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {plan.vibe}
                    </span>
                    <span className="text-sm font-bold">{plan.totalCostEstimate}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold group-hover:underline">{plan.title}</h3>
                  <p className="mb-4 text-sm text-gray-500">{plan.description}</p>
                  <div className="mb-6 space-y-2">
                    {plan.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-black" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full rounded-lg border border-black bg-transparent py-2 text-sm font-semibold transition-colors hover:bg-black hover:text-white">
                  Select This Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {generateTrip.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Something went wrong: {generateTrip.error.message}
        </div>
      )}
    </div>
  );
}

function BudgetOption({
  label,
  value,
  current,
  onClick,
  icon,
}: {
  label: string;
  value: 'low' | 'moderate' | 'high';
  current: string;
  onClick: (val: 'low' | 'moderate' | 'high') => void;
  icon: React.ReactNode;
}) {
  const isSelected = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-all ${
        isSelected
          ? 'border-black bg-black text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}
