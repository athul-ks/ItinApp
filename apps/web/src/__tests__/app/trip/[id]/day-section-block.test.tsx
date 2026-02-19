import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Activity, DaySection } from '@itinapp/schemas';
import DaySectionBlock from '@/app/trip/[id]/day-section-block';

// Mock Lucide icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon" />,
  Bus: () => <div data-testid="bus-icon" />,
}));

describe('DaySectionBlock', () => {
  const mockActivity1: Activity = {
    name: 'Morning Walk',
    description: 'A nice walk in the park',
    startTime: '08:00',
    endTime: '09:00',
    cost: 0,
    travelTime: '10 mins',
    lat: 0,
    lng: 0,
  };

  const mockActivity2: Activity = {
    name: 'Museum Visit',
    description: 'See some art',
    startTime: '10:00',
    endTime: '12:00',
    cost: 20,
    travelTime: '15 mins',
    lat: 0,
    lng: 0,
  };

  const mockData: DaySection = {
    activities: [mockActivity1, mockActivity2],
    restaurantSuggestions: [
      {
        name: 'Tasty Cafe',
        cuisine: 'Coffee',
        cost: '$',
        rating: '4.5', // String
        lat: 0,
        lng: 0,
      },
    ],
  };

  const defaultProps = {
    title: 'Morning',
    icon: <div data-testid="section-icon">Icon</div>,
    data: mockData,
    mealLabel: 'Breakfast Suggestions',
    onHover: vi.fn(),
  };

  it('renders correctly with activities and restaurant suggestions', () => {
    render(<DaySectionBlock {...defaultProps} />);

    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByTestId('section-icon')).toBeInTheDocument();

    // Check activities
    expect(screen.getByText('Morning Walk')).toBeInTheDocument();
    expect(screen.getByText('Museum Visit')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 09:00')).toBeInTheDocument();

    // Check restaurant
    expect(screen.getByText('Tasty Cafe')).toBeInTheDocument();
    expect(screen.getByText('Breakfast Suggestions')).toBeInTheDocument();
  });

  it('calls onHover with activity name on mouse enter', () => {
    render(<DaySectionBlock {...defaultProps} />);

    const activityButton = screen.getByText('Morning Walk').closest('button');
    expect(activityButton).toBeInTheDocument();

    if (activityButton) {
        fireEvent.mouseEnter(activityButton);
        expect(defaultProps.onHover).toHaveBeenCalledWith('Morning Walk');
    }
  });

  it('calls onHover with undefined on mouse leave', () => {
    render(<DaySectionBlock {...defaultProps} />);

    const activityButton = screen.getByText('Morning Walk').closest('button');
    expect(activityButton).toBeInTheDocument();

    if (activityButton) {
        fireEvent.mouseLeave(activityButton);
        expect(defaultProps.onHover).toHaveBeenCalledWith(undefined);
    }
  });

  it('applies highlighted styles when highlightedActivity matches', () => {
    render(<DaySectionBlock {...defaultProps} highlightedActivity="Morning Walk" />);

    const activityButton = screen.getByText('Morning Walk').closest('button');
    const otherActivityButton = screen.getByText('Museum Visit').closest('button');

    expect(activityButton).toHaveClass('border-primary');
    expect(activityButton).toHaveClass('ring-primary');

    expect(otherActivityButton).not.toHaveClass('border-primary');
    expect(otherActivityButton).not.toHaveClass('ring-primary');
  });

  it('renders nothing if data.activities is empty', () => {
    const emptyData: DaySection = { ...mockData, activities: [] };
    const { container } = render(<DaySectionBlock {...defaultProps} data={emptyData} />);

    expect(container).toBeEmptyDOMElement();
  });
});
