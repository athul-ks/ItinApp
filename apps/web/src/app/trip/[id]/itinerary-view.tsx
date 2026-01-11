'use client';

import { useState } from 'react';

import { ArrowLeft, Bed, Bus, Clock, Coffee, Moon, Utensils } from 'lucide-react';

import { ScrollArea } from '@itinapp/ui/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@itinapp/ui/components/tabs';

import { MapView } from '@/app/trip/[id]/map-view';
import type { RouterOutputs } from '@/trpc/react';

type TripOption = RouterOutputs['trip']['generate']['tripData'][number];
type DayPlan = TripOption['itinerary'][number];
type DaySection = DayPlan['morning'];

interface ItineraryViewProps {
  plan: TripOption;
  destinationLocation: { lat: number; lng: number };
  onBack: () => void;
}

export function ItineraryView({ plan, destinationLocation, onBack }: ItineraryViewProps) {
  const [hoveredActivity, setHoveredActivity] = useState<string>();
  const [activeDay, setActiveDay] = useState<string>(`day-${plan.itinerary[0]?.day}`);

  const findDayForActivity = (activityName: string) => {
    return plan.itinerary.find((day) => {
      const allDayActivities = [
        ...day.morning.activities,
        ...day.afternoon.activities,
        ...day.evening.activities,
      ];
      return allDayActivities.some((act) => act.name === activityName);
    });
  };

  const handleMarkerClick = (activityName: string) => {
    const dayData = findDayForActivity(activityName);
    if (dayData) {
      setActiveDay(`day-${dayData.day}`);
    }

    // Wait a tiny bit for the Tab to render, then scroll
    setTimeout(() => {
      // Create a safe ID from the name (matches what we set in the list below)
      const elementId = `activity-${activityName.replace(/\s+/g, '-').toLowerCase()}`;
      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight it briefly to show user where they jumped to
        setHoveredActivity(activityName);
      }
    }, 100);
  };

  // Flatten activities for the Map
  const allActivities = plan.itinerary.flatMap((day) => [
    ...day.morning.activities,
    ...day.afternoon.activities,
    ...day.evening.activities,
    // ...day.morning.restaurantSuggestions,
    // ...day.afternoon.restaurantSuggestions,
    // ...day.evening.restaurantSuggestions,
  ]);

  // Determine Map Center (Database City Center -> First Activity -> Fallback)
  const mapCenter = {
    lat: destinationLocation.lat ?? allActivities[0]?.lat ?? 0,
    lng: destinationLocation.lng ?? allActivities[0]?.lng ?? 0,
  };

  return (
    <div className="animate-in slide-in-from-right fixed inset-0 mt-12 flex h-screen bg-white duration-500">
      {/* --- LEFT COLUMN: SCROLLABLE LIST --- */}
      <div className="z-20 flex h-full w-full flex-col border-r bg-white shadow-xl lg:w-[55%]">
        {/* Fixed Header inside the column */}
        <div className="z-10 flex-none space-y-4 border-b bg-white/80 p-6 backdrop-blur-md">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to options
          </button>
          <div>
            <h1 className="text-2xl font-bold">{plan.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {plan.vibe}
              </span>
              <span className="font-medium text-green-700">{plan.totalCostEstimate}</span>
            </div>
          </div>
        </div>

        {/* 3. Tabbed Content Area */}
        <Tabs
          value={activeDay}
          onValueChange={setActiveDay}
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* Scrollable Tab List (Horizontal) */}
          <div className="border-b bg-gray-50/50 px-6 py-2">
            <div className="w-full overflow-x-auto scroll-smooth whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="h-auto bg-transparent p-0">
                {plan.itinerary.map((day) => (
                  <TabsTrigger
                    key={day.day}
                    value={`day-${day.day}`}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-gray-200 data-[state=active]:shadow-md"
                  >
                    Day {day.day}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Scrollable Day Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 pb-24">
              {plan.itinerary.map((day) => (
                <TabsContent
                  key={day.day}
                  value={`day-${day.day}`}
                  className="animate-in fade-in-50 slide-in-from-bottom-2 m-0 space-y-8 duration-300"
                >
                  {/* Day Header */}
                  <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <h2 className="text-xl font-bold text-slate-900">{day.theme}</h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" /> Food: ${day.dailyFoodBudget}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bus className="h-3 w-3" /> Transport: ${day.dailyTransportBudget}
                      </span>
                    </div>
                  </div>

                  <div className="ml-2 space-y-8 border-l-2 border-gray-100 pl-4">
                    <DaySectionBlock
                      title="Morning"
                      icon={<Coffee className="h-5 w-5 text-orange-500" />}
                      data={day.morning}
                      mealLabel="Breakfast Spots"
                      onHover={setHoveredActivity}
                      highlightedActivity={hoveredActivity}
                    />
                    <DaySectionBlock
                      title="Afternoon"
                      icon={<Utensils className="h-5 w-5 text-blue-500" />}
                      data={day.afternoon}
                      mealLabel="Lunch Spots"
                      onHover={setHoveredActivity}
                      highlightedActivity={hoveredActivity}
                    />
                    <DaySectionBlock
                      title="Evening"
                      icon={<Moon className="h-5 w-5 text-indigo-500" />}
                      data={day.evening}
                      mealLabel="Dinner Options"
                      onHover={setHoveredActivity}
                      highlightedActivity={hoveredActivity}
                    />

                    {/* Accommodation */}
                    <div className="relative mt-8">
                      <div className="absolute top-0 -left-8.5 rounded-full border-2 border-gray-200 bg-white p-1.5 shadow-sm">
                        <Bed className="h-5 w-5 text-slate-700" />
                      </div>
                      <div className="ml-4 rounded-xl border bg-slate-50 p-4">
                        <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Rest your head
                        </h4>
                        <p className="text-base font-bold">{day.accommodation.name}</p>
                        <p className="mb-1 text-sm text-slate-600">{day.accommodation.location}</p>
                        <p className="text-xs text-slate-500 italic">
                          &quot;{day.accommodation.reason}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* --- RIGHT COLUMN: MAP --- */}
      <div className="hidden h-full w-[45%] bg-slate-100 lg:block">
        <MapView
          center={mapCenter}
          activities={allActivities}
          hoveredActivityName={hoveredActivity}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
}

function DaySectionBlock({
  title,
  icon,
  data,
  mealLabel,
  highlightedActivity,
  onHover,
}: {
  title: string;
  icon: React.ReactNode;
  data: DaySection;
  mealLabel: string;
  highlightedActivity?: string;
  onHover: (name: string | undefined) => void;
}) {
  if (data.activities.length === 0) return null;

  return (
    <div className="relative mb-8">
      <div className="absolute top-0 -left-8.5 rounded-full border-2 border-gray-200 bg-white p-1.5 shadow-sm">
        {icon}
      </div>

      <h3 className="mb-4 ml-4 text-lg font-bold">{title}</h3>

      {/* Activities List */}
      <div className="ml-2 space-y-4">
        {data.activities.map((act, i) => {
          const isHighlighted = highlightedActivity === act.name;
          return (
            <div
              key={i}
              id={`activity-${act.name.replace(/\s+/g, '-').toLowerCase()}`}
              onMouseEnter={() => onHover(act.name)}
              onMouseLeave={() => onHover(undefined)}
              className={`group relative cursor-pointer rounded-xl border p-4 shadow-sm transition-all ${
                isHighlighted
                  ? 'border-primary ring-primary bg-blue-50/30 shadow-md ring-1'
                  : 'hover:border-primary/50 bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold text-blue-600">
                    <Clock className="h-3 w-3" /> {act.startTime} - {act.endTime}
                  </div>
                  <h4 className="font-bold">{act.name}</h4>
                  <p className="mt-1 text-sm leading-snug text-slate-600">{act.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold">
                    {act.cost === 0 ? 'Free' : `$${act.cost}`}
                  </div>
                </div>
              </div>
              {act.travelTime && (
                <div className="mt-3 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs tracking-wide text-slate-500 uppercase">
                  <Bus className="h-3 w-3" /> {act.travelTime}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Restaurant Suggestions Carousel/Grid */}
      <div className="mt-4 ml-2 border-t border-dashed pt-4">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
          {mealLabel}
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.restaurantSuggestions.map((resto, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="truncate text-sm font-bold" title={resto.name}>
                  {resto.name}
                </span>
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                  {resto.rating}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{resto.cuisine}</span>
                <span className="font-medium text-slate-700">{resto.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
