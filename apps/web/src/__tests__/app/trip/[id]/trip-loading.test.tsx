import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TripLoading } from '@/app/trip/[id]/trip-loading';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  BedDouble: () => <div data-testid="icon-bed-double" />,
  CalendarCheck: () => <div data-testid="icon-calendar-check" />,
  Map: () => <div data-testid="icon-map" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Utensils: () => <div data-testid="icon-utensils" />,
}));

describe('TripLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial state correctly', () => {
    render(<TripLoading destination="Paris" />);

    expect(screen.getByText('Curating Paris')).toBeInTheDocument();
    expect(screen.getByText('Analyzing destination vibe...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-map')).toBeInTheDocument();
  });

  it('updates progress over time but caps at 90%', () => {
    render(<TripLoading destination="Paris" />);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    const progressText = screen.getByText(/90%/); // Should be exactly 90%
    expect(progressText).toBeInTheDocument();

    // Advance more to ensure it doesn't go over
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.queryByText(/91%/)).not.toBeInTheDocument();
    expect(screen.getByText(/90%/)).toBeInTheDocument();
  });

  it('cycles through messages correctly', () => {
    render(<TripLoading destination="Paris" />);

    expect(screen.getByText('Analyzing destination vibe...')).toBeInTheDocument();

    // Step interval is 5000ms
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Scouting top-rated restaurants...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Checking accommodation prices...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Optimizing travel routes...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Finalizing your 3 options...')).toBeInTheDocument();

    // Should stay on last step
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Finalizing your 3 options...')).toBeInTheDocument();
  });

  it('clears intervals on unmount', () => {
    const { unmount } = render(<TripLoading destination="Paris" />);

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(2); // One for progress, one for steps
  });
});
