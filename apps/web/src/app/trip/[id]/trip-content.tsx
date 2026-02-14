import { Bed, Bus, Coffee, Moon, Utensils } from 'lucide-react';

import { Itinerary } from '@itinapp/schemas';
import { ScrollArea } from '@itinapp/ui/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@itinapp/ui/components/tabs';

import DaySectionBlock from './day-section-block';

type TripContentProps = {
  itinerary: Itinerary;
  activeDay: string;
  setActiveDay: (day: string) => void;
  hoveredActivity: string | undefined;
  setHoveredActivity: (name: string | undefined) => void;
};

export default function TripContent({
  itinerary,
  activeDay,
  setActiveDay,
  hoveredActivity,
  setHoveredActivity,
}: TripContentProps) {
  return (
    <Tabs
      value={activeDay}
      onValueChange={setActiveDay}
      className="flex flex-1 flex-col overflow-hidden bg-gray-50/30"
    >
      {/* Scrollable Tab List */}
      <div className="z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="w-full overflow-x-auto scroll-smooth pb-1 whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="h-auto gap-2 bg-transparent p-0">
            {itinerary.days.map((day) => (
              <TabsTrigger
                key={day.day}
                value={`day-${day.day}`}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Day {day.day}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl p-6 pb-24">
          {itinerary.days.map((day) => (
            <TabsContent
              key={day.day}
              value={`day-${day.day}`}
              className="animate-in fade-in-50 slide-in-from-bottom-2 m-0 space-y-8 duration-300"
            >
              {/* Day Header */}
              <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <h2 className="text-xl font-bold text-slate-900">{day.theme}</h2>
                <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5 rounded-md border border-gray-100 bg-white px-2 py-1 shadow-sm">
                    <Utensils className="h-3.5 w-3.5 text-indigo-500" /> Food: $
                    {day.dailyFoodBudget}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-md border border-gray-100 bg-white px-2 py-1 shadow-sm">
                    <Bus className="h-3.5 w-3.5 text-indigo-500" /> Transport: $
                    {day.dailyTransportBudget}
                  </span>
                </div>
              </div>

              <div className="ml-2 space-y-8 border-l-2 border-dashed border-gray-200 pl-4">
                <DaySectionBlock
                  title="Morning"
                  icon={<Coffee className="h-5 w-5 text-orange-500" />}
                  data={day.morning}
                  mealLabel="Breakfast Recommendations"
                  onHover={setHoveredActivity}
                  highlightedActivity={hoveredActivity}
                />
                <DaySectionBlock
                  title="Afternoon"
                  icon={<Utensils className="h-5 w-5 text-blue-500" />}
                  data={day.afternoon}
                  mealLabel="Lunch Recommendations"
                  onHover={setHoveredActivity}
                  highlightedActivity={hoveredActivity}
                />
                <DaySectionBlock
                  title="Evening"
                  icon={<Moon className="h-5 w-5 text-indigo-500" />}
                  data={day.evening}
                  mealLabel="Dinner Recommendations"
                  onHover={setHoveredActivity}
                  highlightedActivity={hoveredActivity}
                />

                {/* Accommodation Card */}
                <div className="relative mt-8">
                  <div className="absolute top-0 -left-8.5 rounded-full border-2 border-gray-200 bg-white p-1.5 shadow-sm">
                    <Bed className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="ml-2 rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-slate-300 hover:shadow-md">
                    <h4 className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Rest your head
                    </h4>
                    <p className="text-lg font-bold text-slate-800">{day.accommodation.name}</p>
                    <p className="mb-2 text-sm font-medium text-slate-600">
                      {day.accommodation.location}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500 italic">
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
  );
}
