import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Activity, DaySection, Itinerary } from '@itinapp/schemas';
import { TripView } from '@/app/trip/[id]/trip-view';

// Mock dependencies
vi.mock('lucide-react', () => ({
  List: () => <div data-testid="icon-list" />,
  Map: () => <div data-testid="icon-map" />,
}));

// Mock child components
vi.mock('@/app/trip/[id]/map-view', () => ({
  MapView: ({ onMarkerClick }: { onMarkerClick: (name: string) => void }) => (
    <div data-testid="map-view">
      <button onClick={() => onMarkerClick('Activity 1')} data-testid="map-marker-activity-1">
        Marker 1
      </button>
    </div>
  ),
}));

vi.mock('@/app/trip/[id]/trip-header', () => ({
  default: () => <div data-testid="trip-header">Trip Header</div>,
}));

vi.mock('@/app/trip/[id]/trip-content', () => ({
  default: ({ activeDay, setActiveDay }: { activeDay: string; setActiveDay: (d: string) => void }) => (
    <div data-testid="trip-content">
      Active Day: {activeDay}
      <button onClick={() => setActiveDay('day-2')} data-testid="switch-day-btn">Switch to Day 2</button>
    </div>
  ),
}));

describe('TripView', () => {
  const mockActivity1: Activity = {
    name: 'Activity 1',
    description: 'Desc 1',
    startTime: '09:00',
    endTime: '10:00',
    cost: 10,
    travelTime: '10 mins',
    lat: 10,
    lng: 10,
  };

  const mockActivity2: Activity = {
    name: 'Activity 2',
    description: 'Desc 2',
    startTime: '10:00',
    endTime: '11:00',
    cost: 20,
    travelTime: '20 mins',
    lat: 20,
    lng: 20,
  };

  const mockDaySection1: DaySection = {
    activities: [mockActivity1],
    restaurantSuggestions: [],
  };

  const mockDaySection2: DaySection = {
    activities: [mockActivity2],
    restaurantSuggestions: [],
  };

  const mockItinerary: Itinerary = {
    title: 'Trip to Paris',
    description: 'A wonderful trip',
    totalCostEstimate: '1000',
    vibe: 'Balanced',
    highlights: ['Eiffel Tower'],
    days: [
      {
        day: 1,
        theme: 'Day 1 Theme',
        dailyFoodBudget: 50,
        dailyTransportBudget: 20,
        morning: mockDaySection1,
        afternoon: { activities: [], restaurantSuggestions: [] },
        evening: { activities: [], restaurantSuggestions: [] },
        accommodation: {
          name: 'Hotel 1',
          location: 'Loc 1',
          reason: 'Reason 1',
        },
      },
      {
        day: 2,
        theme: 'Day 2 Theme',
        dailyFoodBudget: 60,
        dailyTransportBudget: 30,
        morning: mockDaySection2,
        afternoon: { activities: [], restaurantSuggestions: [] },
        evening: { activities: [], restaurantSuggestions: [] },
        accommodation: {
          name: 'Hotel 2',
          location: 'Loc 2',
          reason: 'Reason 2',
        },
      },
    ],
  };

  const defaultProps = {
    itinerary: mockItinerary,
    image: {
      url: 'http://example.com/image.jpg',
      alt: 'Image Alt',
      credit: { name: 'Credit', link: 'http://example.com' },
    },
    destinationLocation: { lat: 10, lng: 10 },
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<TripView {...defaultProps} />);

    expect(screen.getByTestId('trip-header')).toBeInTheDocument();
    expect(screen.getByTestId('trip-content')).toBeInTheDocument();
    expect(screen.getByTestId('map-view')).toBeInTheDocument();
  });

  it('toggles mobile view', () => {
    render(<TripView {...defaultProps} />);

    const toggleButton = screen.getByText('Map'); // Initial state is list, so button says Map
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByText('List')).toBeInTheDocument(); // Button text changes to List

    fireEvent.click(screen.getByText('List'));

    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  it('handles marker click: switches to list view, sets active day, scrolls to element', async () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const elementId = 'activity-activity-1';
    const dummyElement = document.createElement('div');
    dummyElement.id = elementId;
    document.body.appendChild(dummyElement);

    render(<TripView {...defaultProps} />);

    // Switch to map view first
    fireEvent.click(screen.getByText('Map'));

    // Click marker
    const markerButton = screen.getByTestId('map-marker-activity-1');
    fireEvent.click(markerButton);

    // Should switch back to list view
    expect(screen.getByText('Map')).toBeInTheDocument();

    // Active day should be day-1
    expect(screen.getByText('Active Day: day-1')).toBeInTheDocument();

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });

    document.body.removeChild(dummyElement);
  });
});
