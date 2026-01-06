import { ArrowLeft, Bed, Bus, Clock, Coffee, Moon, Utensils } from 'lucide-react';

import type { RouterOutputs } from '@/trpc/react';

type TripPlan = RouterOutputs['trip']['generate'][number];
type DayPlan = TripPlan['itinerary'][number];
type DaySection = DayPlan['morning'];

interface ItineraryViewProps {
  plan: TripPlan;
  onBack: () => void;
}

export function ItineraryView({ plan, onBack }: ItineraryViewProps) {
  return (
    <div className="animate-in slide-in-from-right space-y-8 duration-500">
      {/* --- HEADER --- */}
      <div className="space-y-4 border-b pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to options
        </button>

        <div>
          <h1 className="text-3xl font-bold">{plan.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              {plan.vibe}
            </span>
            <span className="flex items-center gap-1 font-medium text-green-700">
              {plan.totalCostEstimate}
            </span>
          </div>
          <p className="mt-4 text-gray-600">{plan.description}</p>
        </div>
      </div>

      {/* --- DAYS LOOP --- */}
      <div className="space-y-16">
        {plan.itinerary.map((day) => (
          <div key={day.day} className="relative">
            {/* Sticky Date Header */}
            <div className="bg-primary/90 sticky top-4 z-10 mb-6 rounded-lg border-b p-2 backdrop-blur">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm text-white">
                  {day.day}
                </span>
                {day.theme}
              </h2>
              <div className="text-primary-foreground mt-2 flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" /> Food Budget: ${day.dailyFoodBudget}
                </span>
                <span className="flex items-center gap-1">
                  <Bus className="h-3 w-3" /> Transport: ${day.dailyTransportBudget}
                </span>
              </div>
            </div>

            <div className="space-y-8 border-l-2 border-gray-100 pl-4">
              <DaySectionBlock
                title="Morning"
                icon={<Coffee className="h-5 w-5 text-orange-500" />}
                data={day.morning}
                mealLabel="Breakfast Spots"
              />
              <DaySectionBlock
                title="Afternoon"
                icon={<Utensils className="h-5 w-5 text-blue-500" />}
                data={day.afternoon}
                mealLabel="Lunch Spots"
              />
              <DaySectionBlock
                title="Evening"
                icon={<Moon className="h-5 w-5 text-indigo-500" />}
                data={day.evening}
                mealLabel="Dinner Options"
              />

              {/* Accommodation For the Night */}
              <div className="mt-8 flex items-start gap-4 rounded-xl border bg-slate-50 p-4">
                <div className="rounded-full border bg-white p-2 shadow-sm">
                  <Bed className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold tracking-wider text-slate-500 uppercase">
                    Rest your head
                  </h4>
                  <p className="text-lg font-bold">{day.accommodation.name}</p>
                  <p className="text-sm text-slate-600">{day.accommodation.location}</p>
                  <p className="mt-1 text-xs text-slate-400 italic">
                    &quot;{day.accommodation.reason}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DaySectionBlock({
  title,
  icon,
  data,
  mealLabel,
}: {
  title: string;
  icon: React.ReactNode;
  data: DaySection;
  mealLabel: string;
}) {
  if (data.activities.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute top-0 -left-6.25 rounded-full border-2 border-gray-200 bg-white p-1">
        {icon}
      </div>

      <h3 className="mb-4 ml-4 flex items-center gap-2 text-lg font-bold">{title}</h3>

      {/* Activities List */}
      <div className="space-y-6">
        {data.activities.map((act, i) => (
          <div
            key={i}
            className="group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <Clock className="h-3 w-3" /> {act.startTime} - {act.endTime}
                </div>
                <h4 className="text-lg font-bold">{act.name}</h4>
                <p className="mt-1 text-sm text-gray-600">{act.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold">{act.cost === 0 ? 'Free' : `$${act.cost}`}</div>
              </div>
            </div>
            {act.travelTime && (
              <div className="mt-3 inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-500">
                <Bus className="h-3 w-3" /> {act.travelTime}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Restaurant Suggestions Carousel/Grid */}
      <div className="mt-4 border-t border-dashed pt-4">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">
          {mealLabel}
        </h4>
        <div className="grid gap-3 md:grid-cols-3">
          {data.restaurantSuggestions.map((resto, i) => (
            <div
              key={i}
              className="rounded-lg border bg-gray-50 p-3 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="truncate text-sm font-bold">{resto.name}</span>
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                  {resto.rating}
                </span>
              </div>
              <div className="mb-1 text-xs text-gray-500">{resto.cuisine}</div>
              <div className="text-xs font-semibold text-gray-900">{resto.cost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
