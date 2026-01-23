'use client';

import { useState } from 'react';

import { Armchair, Coffee, CreditCard, DollarSign, Loader2, Wallet, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';

import { TripLoading } from '@/app/plan/trip-loading';
import { UpgradeModal } from '@/app/plan/upgrade-modal';
import { DateRangePicker } from '@/components/date-range-picker';
import { api } from '@/trpc/react';

export function PlanContents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || 'Unknown Destination';

  const [dateRange, setDateRange] = useState<DateRange>();
  const [budget, setBudget] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [vibe, setVibe] = useState<'packed' | 'moderate' | 'relaxed'>('moderate');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const generateTrip = api.trip.generate.useMutation({
    onSuccess: (data) => {
      router.push(`/trip/${data.tripId}`);
    },
    onError: (error) => {
      if (error.message.includes('INSUFFICIENT_CREDITS')) {
        setShowUpgradeModal(true);
      } else {
        alert('Something went wrong: ' + error.message);
      }
    },
  });

  const handleGenerate = () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('Please select a date range first!');
      return;
    }

    generateTrip.mutate({
      destination,
      dateRange: { from: dateRange.from, to: dateRange.to },
      budget,
      vibe,
    });
  };

  if (generateTrip.isPending) {
    return <TripLoading destination={destination} />;
  }

  return (
    <div className="w-full max-w-2xl">
      {/* 1. Context Header */}
      <div className="mb-8 text-center">
        <span className="text-primary text-sm font-bold tracking-widest uppercase">
          Step 2 of 3
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Trip to {destination}</h1>
        <p className="text-muted-foreground mt-2">
          Tell us a bit more so we can curate the perfect vibe.
        </p>
      </div>

      {/* 2. The "Card" Container */}
      <div className="bg-card rounded-2xl border p-8 shadow-xl">
        <div className="space-y-8 text-center">
          <div className="mx-auto max-w-sm space-y-3">
            <label className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              When are you going?
            </label>
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>
          <div className="space-y-3">
            <label className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              What is your budget?
            </label>
            <div className="mt-1 grid grid-cols-3 gap-3">
              <OptionButton
                label="Economy"
                value="low"
                current={budget}
                onClick={setBudget}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <OptionButton
                label="Standard"
                value="moderate"
                current={budget}
                onClick={setBudget}
                icon={<Wallet className="h-4 w-4" />}
              />
              <OptionButton
                label="Luxury"
                value="high"
                current={budget}
                onClick={setBudget}
                icon={<CreditCard className="h-4 w-4" />}
              />
            </div>
            <div className="space-y-3">
              <label className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                What&apos;s your pace?
              </label>
              <div className="mt-1 grid grid-cols-3 gap-3">
                <OptionButton
                  label="Packed"
                  value="packed"
                  current={vibe}
                  onClick={setVibe}
                  icon={<Zap className="h-4 w-4" />}
                />
                <OptionButton
                  label="Balanced"
                  value="moderate"
                  current={vibe}
                  onClick={setVibe}
                  icon={<Coffee className="h-4 w-4" />}
                />
                <OptionButton
                  label="Relaxed"
                  value="relaxed"
                  current={vibe}
                  onClick={setVibe}
                  icon={<Armchair className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generateTrip.isPending}
            className="group bg-primary text-primary-foreground relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-lg font-bold shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:opacity-70"
          >
            {generateTrip.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Crafting your plan...
              </>
            ) : (
              'Generate My Itinerary'
            )}
          </button>
        </div>
      </div>

      {/* 3. Social Proof / Trust (Optional filler) */}
      <p className="text-muted-foreground mt-8 text-center text-sm">
        Powered by AI • Curated by Locals • Loved by Travelers
      </p>
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}

function OptionButton<T extends string>({
  label,
  value,
  current,
  onClick,
  icon,
}: {
  label: string;
  value: T;
  current: T;
  onClick: (val: T) => void;
  icon: React.ReactNode;
}) {
  const isSelected = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      aria-pressed={isSelected}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-all ${
        isSelected
          ? 'border-primary bg-primary text-primary-foreground shadow-md'
          : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50'
      }`}
    >
      {icon} {label}
    </button>
  );
}
