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
};

export function MapView({ center, activities }: MapViewProps) {
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
          {activities.map((activity, index) => (
            <AdvancedMarker
              key={`${activity.name}-${index}`}
              position={{ lat: activity.lat, lng: activity.lng }}
              title={activity.name}
            >
              <Pin background={'#2563eb'} borderColor={'#1e40af'} glyphColor={'white'} />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
