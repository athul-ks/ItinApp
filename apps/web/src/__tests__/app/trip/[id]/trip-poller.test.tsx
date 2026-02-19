import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Mock next/navigation before importing it
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { TripPoller } from '@/app/trip/[id]/trip-poller';

// Mock api
vi.mock('@/trpc/react', () => ({
  api: {
    trip: {
      getById: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Mock TripLoading
vi.mock('@/app/trip/[id]/trip-loading', () => ({
  TripLoading: ({ destination }: { destination: string }) => (
    <div data-testid="trip-loading">Loading trip for {destination}...</div>
  ),
}));

describe('TripPoller', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as AppRouterInstance;

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    tripId: 'trip-123',
    destination: 'Paris',
  };

  it('renders TripLoading when status is PENDING', () => {
    vi.mocked(api.trip.getById.useQuery).mockReturnValue({
      data: { status: 'PENDING' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof api.trip.getById.useQuery>);

    render(<TripPoller {...defaultProps} />);

    expect(screen.getByTestId('trip-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading trip for Paris...')).toBeInTheDocument();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('renders TripLoading when status is GENERATING (same as pending usually)', () => {
    vi.mocked(api.trip.getById.useQuery).mockReturnValue({
        data: { status: 'GENERATING' },
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof api.trip.getById.useQuery>);

      render(<TripPoller {...defaultProps} />);

      expect(screen.getByTestId('trip-loading')).toBeInTheDocument();
  });

  it('calls router.refresh() when status is COMPLETED', async () => {
    vi.mocked(api.trip.getById.useQuery).mockReturnValue({
      data: { status: 'COMPLETED' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof api.trip.getById.useQuery>);

    render(<TripPoller {...defaultProps} />);

    await waitFor(() => {
      expect(mockRouter.refresh).toHaveBeenCalled();
    });

    expect(screen.getByTestId('trip-loading')).toBeInTheDocument();
  });

  it('renders error UI when status is FAILED', () => {
    vi.mocked(api.trip.getById.useQuery).mockReturnValue({
      data: { status: 'FAILED' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof api.trip.getById.useQuery>);

    render(<TripPoller {...defaultProps} />);

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText("We couldn't generate a trip for Paris.")).toBeInTheDocument();
    expect(screen.queryByTestId('trip-loading')).not.toBeInTheDocument();
  });

  it('handles "Try Again" click correctly', () => {
    vi.mocked(api.trip.getById.useQuery).mockReturnValue({
      data: { status: 'FAILED' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof api.trip.getById.useQuery>);

    render(<TripPoller {...defaultProps} />);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/plan');
  });
});
