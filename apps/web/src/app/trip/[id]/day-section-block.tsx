import { Bus, Clock } from 'lucide-react';

import { Activity, DaySection, Restaurant } from '@itinapp/schemas';

type DaySectionBlockProps = {
  title: string;
  icon: React.ReactNode;
  data: DaySection;
  mealLabel: string;
  highlightedActivity?: string;
  onHover: (name: string | undefined) => void;
};

export default function DaySectionBlock({
  title,
  icon,
  data,
  mealLabel,
  highlightedActivity,
  onHover,
}: DaySectionBlockProps) {
  if (data.activities.length === 0) return null;

  return (
    <div className="relative mb-8">
      <div className="absolute top-0 -left-8.5 rounded-full border-2 border-gray-200 bg-white p-1.5 shadow-sm">
        {icon}
      </div>

      <h3 className="mb-4 ml-4 text-lg font-bold">{title}</h3>

      {/* Activities List */}
      <div className="ml-2 space-y-4">
        {data.activities.map((act: Activity) => {
          const isHighlighted = highlightedActivity === act.name;
          return (
            <button
              key={act.name}
              type="button"
              id={`activity-${act.name.replace(/\s+/g, '-').toLowerCase()}`}
              onMouseEnter={() => onHover(act.name)}
              onMouseLeave={() => onHover(undefined)}
              onFocus={() => onHover(act.name)}
              onBlur={() => onHover(undefined)}
              className={`group relative w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition-all ${
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
                  <h4 className="group-hover:text-primary font-bold text-gray-900">{act.name}</h4>
                  <p className="mt-1 text-sm leading-snug text-slate-600">{act.description}</p>
                </div>
                {act.cost > 0 && (
                  <div className="shrink-0 rounded-md bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700">
                    ${act.cost}
                  </div>
                )}
              </div>
              {act.travelTime && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                  <Bus className="h-3 w-3" />
                  <span>Travel: {act.travelTime}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Restaurant Suggestions */}
      <div className="mt-4 ml-2 border-t border-dashed pt-4">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
          {mealLabel}
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.restaurantSuggestions.map((resto: Restaurant) => (
            <a
              key={resto.name}
              href={`https://www.google.com/maps/search/?api=1&query=${resto.lat},${resto.lng}`}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="group-hover:text-primary truncate text-sm font-bold text-gray-800">
                  {resto.name}
                </span>
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                  {resto.rating}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{resto.cuisine}</span>
                <span className="font-medium text-gray-700">{resto.cost}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
