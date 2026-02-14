'use client';

import { useState } from 'react';

import { List, Map as MapIcon } from 'lucide-react';

import { DayPlan, Itinerary } from '@itinapp/schemas';

import { MapView } from '@/app/trip/[id]/map-view';

import TripContent from './trip-content';
import TripHeader from './trip-header';

interface TripViewProps {
  itinerary: Itinerary;
  image: { url: string; alt: string; credit: { name: string; link: string } } | null;
  destinationLocation: { lat: number; lng: number };
}

export function TripView({ itinerary, image, destinationLocation }: TripViewProps) {
  const [hoveredActivity, setHoveredActivity] = useState<string>();
  const [activeDay, setActiveDay] = useState<string>(`day-${itinerary.days[0]?.day}`);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  const handleMarkerClick = (activityName: string) => {
    setMobileView('list');

    // Find the day
    const dayData = itinerary.days.find((day: DayPlan) => {
      const allDayActivities = [
        ...day.morning.activities,
        ...day.afternoon.activities,
        ...day.evening.activities,
      ];
      return allDayActivities.some((act) => act.name === activityName);
    });

    if (dayData) {
      setActiveDay(`day-${dayData.day}`);
    }

    // Scroll to element
    setTimeout(() => {
      const elementId = `activity-${activityName.replace(/\s+/g, '-').toLowerCase()}`;
      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHoveredActivity(activityName);
        setTimeout(() => setHoveredActivity(undefined), 2000);
      }
    }, 150);
  };

  // Flatten activities for the Map
  const allActivities = itinerary.days.flatMap((day: DayPlan) => [
    ...day.morning.activities,
    ...day.afternoon.activities,
    ...day.evening.activities,
  ]);

  const mapCenter = {
    lat: destinationLocation.lat ?? allActivities[0]?.lat ?? 0,
    lng: destinationLocation.lng ?? allActivities[0]?.lng ?? 0,
  };

  return (
    <div className="animate-in slide-in-from-right fixed inset-0 mt-12 flex h-screen bg-white duration-500">
      {/* --- LEFT COLUMN: SCROLLABLE LIST --- */}
      <div
        className={`flex h-full w-full flex-col border-r bg-white shadow-xl lg:w-[55%] ${mobileView === 'map' ? 'hidden' : 'flex'}`}
      >
        <div className="relative z-10 flex-none overflow-hidden border-b bg-gray-900 text-white shadow-md">
          <TripHeader itinerary={itinerary} image={image} />
        </div>
        <TripContent
          itinerary={itinerary}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          hoveredActivity={hoveredActivity}
          setHoveredActivity={setHoveredActivity}
        />
      </div>

      {/* --- RIGHT COLUMN: MAP --- */}
      <div
        className={`h-full w-full bg-slate-100 lg:block lg:w-[45%] ${mobileView === 'map' ? 'block' : 'hidden'}`}
      >
        <MapView
          center={mapCenter}
          activities={allActivities}
          hoveredActivityName={hoveredActivity}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* --- MOBILE TOGGLE BUTTON --- */}
      <div className="fixed right-6 bottom-6 z-50 lg:hidden">
        <button
          onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          {mobileView === 'list' ? (
            <>
              <MapIcon className="h-4 w-4" /> Map
            </>
          ) : (
            <>
              <List className="h-4 w-4" /> List
            </>
          )}
        </button>
      </div>
    </div>
  );
}
