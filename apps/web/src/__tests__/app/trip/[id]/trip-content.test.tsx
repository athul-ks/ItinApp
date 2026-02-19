import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Activity, DaySection, Itinerary, Restaurant } from '@itinapp/schemas';
import TripContent from '@/app/trip/[id]/trip-content';

// Mock dependencies
vi.mock('lucide-react', () => ({
  Bed: () => <div data-testid="bed-icon" />,
  Bus: () => <div data-testid="bus-icon" />,
  Coffee: () => <div data-testid="coffee-icon" />,
  Moon: () => <div data-testid="moon-icon" />,
  Utensils: () => <div data-testid="utensils-icon" />,
}));

// Mock child components
vi.mock('@/app/trip/[id]/day-section-block', () => ({
  default: ({ title, data }: { title: string; data: DaySection }) => (
    <div data-testid={`day-section-${title.toLowerCase()}`}>
      {title} - {data.activities.length} activities
    </div>
  ),
}));

// Mock UI components
vi.mock('@itinapp/ui/components/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('@itinapp/ui/components/tabs', () => ({
  // Mock Tabs to render children and provide a way to trigger value change
  Tabs: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (val: string) => void }) => (
    <div data-testid="tabs" data-value={value}>
      {/* Hidden button to simulate tab switching for testing prop passing */}
      <button
        data-testid="mock-tabs-trigger-change"
        onClick={() => onValueChange('day-2')}
        style={{ display: 'none' }}
      >
        Trigger Change
      </button>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-trigger-${value}`}>{children}</div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
}));

describe('TripContent', () => {
  const mockActivity: Activity = {
    name: 'Activity',
    description: 'Description',
    startTime: '09:00',
    endTime: '10:00',
    cost: 10,
    travelTime: '10 mins',
    lat: 10,
    lng: 10,
  };

  const mockRestaurant: Restaurant = {
    name: 'Restaurant',
    cuisine: 'Cuisine',
    cost: '$',
    rating: '4.5', // String in schema
    lat: 10,
    lng: 10,
  };

  const mockDaySection: DaySection = {
    activities: [mockActivity],
    restaurantSuggestions: [mockRestaurant],
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
        theme: 'Romantic Stroll',
        dailyFoodBudget: 50,
        dailyTransportBudget: 20,
        morning: mockDaySection,
        afternoon: mockDaySection,
        evening: mockDaySection,
        accommodation: {
          name: 'Hotel Paris',
          location: 'Central Paris',
          reason: 'Good view',
        },
      },
      {
        day: 2,
        theme: 'Art & Culture',
        dailyFoodBudget: 60,
        dailyTransportBudget: 30,
        morning: mockDaySection,
        afternoon: mockDaySection,
        evening: mockDaySection,
        accommodation: {
          name: 'Hotel Art',
          location: 'Left Bank',
          reason: 'Close to museums',
        },
      },
    ],
  };

  const defaultProps = {
    itinerary: mockItinerary,
    activeDay: 'day-1',
    setActiveDay: vi.fn(),
    hoveredActivity: undefined,
    setHoveredActivity: vi.fn(),
  };

  it('renders correctly with tabs and content', () => {
    render(<TripContent {...defaultProps} />);

    const tabs = screen.getByTestId('tabs');
    expect(tabs).toHaveAttribute('data-value', 'day-1');

    expect(screen.getByText('Romantic Stroll')).toBeInTheDocument();
    expect(screen.getByText('Hotel Paris')).toBeInTheDocument();
    expect(screen.getByText('Art & Culture')).toBeInTheDocument();
    expect(screen.getByText('Hotel Art')).toBeInTheDocument();

    expect(screen.getAllByTestId('day-section-morning')).toHaveLength(2);
  });

  it('calls setActiveDay when a tab is clicked', () => {
    render(<TripContent {...defaultProps} />);

    // Simulate clicking a tab by triggering the mock's change handler
    const mockTrigger = screen.getByTestId('mock-tabs-trigger-change');
    fireEvent.click(mockTrigger);

    expect(defaultProps.setActiveDay).toHaveBeenCalledWith('day-2');
  });
});
