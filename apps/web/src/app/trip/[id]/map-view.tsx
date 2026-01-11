'use client';

import { APIProvider, AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';

type Coordinate = {
  lat: number;
  lng: number;
};

type Activity = {
  name: string;
  lat: number;
  lng: number;
};

type MapViewProps = {
  center: Coordinate;
  activities: Activity[];
  hoveredActivityName?: string;
  onMarkerClick?: (activityName: string) => void;
};

export function MapView({ center, activities, hoveredActivityName, onMarkerClick }: MapViewProps) {
  // Use a unique key to force re-render if the destination changes drastically
  const mapKey = `${center.lat}-${center.lng}`;

  return (
    <div className="border-border h-full w-full overflow-hidden rounded-xl border shadow-sm">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          key={mapKey} // Forces map to reset center when city changes
          defaultCenter={center}
          defaultZoom={13}
          mapId="DEMO_MAP_ID" // Required for Advanced Markers
          className="h-full w-full"
          disableDefaultUI={true} // Cleaner look
          zoomControl={true} // Keep zoom buttons
        >
          {activities.map((activity, index) => {
            const isHovered = hoveredActivityName === activity.name;
            return (
              <AdvancedMarker
                key={`${activity.name}-${index}`}
                position={{ lat: activity.lat, lng: activity.lng }}
                title={activity.name}
                zIndex={isHovered ? 50 : 1}
                onClick={() => onMarkerClick?.(activity.name)}
              >
                <Pin
                  background={isHovered ? '#ef4444' : '#2563eb'}
                  borderColor={isHovered ? '#b91c1c' : '#1e40af'}
                  glyphColor={'white'}
                  scale={isHovered ? 1.2 : 1.0}
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}
