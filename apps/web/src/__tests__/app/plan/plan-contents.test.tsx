import { act, fireEvent, render, screen } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { type ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { vi } from 'vitest';

import { PlanContents } from '@/app/plan/plan-contents';
import { api } from '@/trpc/react';

// NOTE: falling back to fireEvent due to missing dependency (@testing-library/user-event) and restricted environment.

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/trpc/react', () => ({
  api: {
    trip: {
      generate: {
        useMutation: vi.fn(),
      },
    },
  },
}));

vi.mock('@/app/plan/upgrade-modal', () => ({
  UpgradeModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="upgrade-modal" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={() => onOpenChange(false)}>Close Modal</button>
    </div>
  ),
}));

vi.mock('@/components/date-range-picker', () => ({
  DateRangePicker: ({ setDate }: { date: DateRange | undefined; setDate: (date: DateRange | undefined) => void }) => (
    <input
      data-testid="date-range-picker"
      onChange={(e) => {
        // Simple mock to trigger setDate with a valid range
        if (e.target.value === 'valid-range') {
          setDate({ from: new Date('2024-01-01'), to: new Date('2024-01-05') });
        } else {
          setDate(undefined);
        }
      }}
    />
  ),
}));

// Helper to create a complete mock for useMutation result
const createMockMutationResult = (overrides: Record<string, unknown> = {}) => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  isIdle: true,
  status: 'idle',
  data: undefined,
  error: null,
  reset: vi.fn(),
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  submittedAt: 0,
  variables: undefined,
  ...overrides,
});

describe('PlanContents', () => {
  const mockPush = vi.fn();
  const mockRouter: AppRouterInstance = {
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };

  const mockGet = vi.fn();
  // Mock ReadonlyURLSearchParams completely
  const mockSearchParams = {
    get: mockGet,
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(),
    size: 0,
    [Symbol.iterator]: vi.fn(),
  } as unknown as ReadonlyURLSearchParams;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);
    // Default mock for useMutation to prevent crashes in render tests
    vi.mocked(api.trip.generate.useMutation).mockReturnValue(
      createMockMutationResult() as unknown as ReturnType<typeof api.trip.generate.useMutation>
    );
  });

  it('renders correctly with destination from search params', () => {
    mockGet.mockReturnValue('Paris');
    render(<PlanContents />);
    expect(screen.getByText(/Trip to Paris/i)).toBeInTheDocument();
  });

  it('renders correctly with default destination if not provided', () => {
    mockGet.mockReturnValue(null);
    render(<PlanContents />);
    expect(screen.getByText(/Trip to Unknown Destination/i)).toBeInTheDocument();
  });

  it('updates budget when clicking option buttons', () => {
    render(<PlanContents />);

    const economyBtn = screen.getByRole('button', { name: /Economy/i });
    const standardBtn = screen.getByRole('button', { name: /Standard/i });

    // Initially standard is selected (default)
    expect(standardBtn).toHaveAttribute('aria-pressed', 'true');
    expect(economyBtn).toHaveAttribute('aria-pressed', 'false');

    // Click Economy
    fireEvent.click(economyBtn);
    expect(economyBtn).toHaveAttribute('aria-pressed', 'true');
    expect(standardBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates vibe when clicking option buttons', () => {
    render(<PlanContents />);

    const packedBtn = screen.getByRole('button', { name: /Packed/i });
    const balancedBtn = screen.getByRole('button', { name: /Balanced/i });

    // Initially balanced is selected (default)
    expect(balancedBtn).toHaveAttribute('aria-pressed', 'true');
    expect(packedBtn).toHaveAttribute('aria-pressed', 'false');

    // Click Packed
    fireEvent.click(packedBtn);
    expect(packedBtn).toHaveAttribute('aria-pressed', 'true');
    expect(balancedBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows alert if date range is missing when generating', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Mock useMutation return value
    vi.mocked(api.trip.generate.useMutation).mockReturnValue(
      createMockMutationResult() as unknown as ReturnType<typeof api.trip.generate.useMutation>
    );

    render(<PlanContents />);

    const generateBtn = screen.getByRole('button', { name: /Generate My Itinerary/i });
    fireEvent.click(generateBtn);

    expect(alertSpy).toHaveBeenCalledWith('Please select a date range first!');
    alertSpy.mockRestore();
  });

  it('calls mutation and redirects on success', () => {
    const mutateMock = vi.fn();
    // We need to capture the callbacks passed to useMutation
    let capturedOptions: { onSuccess: (data: { tripId: string }) => void; onError: (error: Error) => void };
    vi.mocked(api.trip.generate.useMutation).mockImplementation((options) => {
      // @ts-expect-error - options is untyped in mock implementation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      capturedOptions = options as any;
      return createMockMutationResult({
        mutate: mutateMock,
      }) as unknown as ReturnType<typeof api.trip.generate.useMutation>;
    });

    render(<PlanContents />);

    // Select date
    const datePicker = screen.getByTestId('date-range-picker');
    fireEvent.change(datePicker, { target: { value: 'valid-range' } });

    // Click Generate
    const generateBtn = screen.getByRole('button', { name: /Generate My Itinerary/i });
    fireEvent.click(generateBtn);

    expect(mutateMock).toHaveBeenCalled();

    // Verify successful generation triggers redirect
    const mockData = { tripId: '123' };
    act(() => {
      capturedOptions.onSuccess(mockData);
    });

    expect(mockPush).toHaveBeenCalledWith('/trip/123');
  });

  it('shows upgrade modal on INSUFFICIENT_CREDITS error', () => {
    const mutateMock = vi.fn();
    let capturedOptions: { onSuccess: (data: { tripId: string }) => void; onError: (error: Error) => void };
    vi.mocked(api.trip.generate.useMutation).mockImplementation((options) => {
      // @ts-expect-error - options is untyped in mock implementation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      capturedOptions = options as any;
      return createMockMutationResult({
        mutate: mutateMock,
      }) as unknown as ReturnType<typeof api.trip.generate.useMutation>;
    });

    render(<PlanContents />);

    // Select date
    const datePicker = screen.getByTestId('date-range-picker');
    fireEvent.change(datePicker, { target: { value: 'valid-range' } });

    // Click Generate
    const generateBtn = screen.getByRole('button', { name: /Generate My Itinerary/i });
    fireEvent.click(generateBtn);

    expect(mutateMock).toHaveBeenCalled();

    // Verify error handling
    const mockError = { message: 'INSUFFICIENT_CREDITS: You need more credits' };
    act(() => {
      capturedOptions.onError(mockError);
    });

    const modal = screen.getByTestId('upgrade-modal');
    expect(modal).toHaveStyle('display: block');
  });

  it('shows alert on other errors', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mutateMock = vi.fn();
    let capturedOptions: { onSuccess: (data: { tripId: string }) => void; onError: (error: Error) => void };
    vi.mocked(api.trip.generate.useMutation).mockImplementation((options) => {
      // @ts-expect-error - options is untyped in mock implementation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      capturedOptions = options as any;
      return createMockMutationResult({
        mutate: mutateMock,
      }) as unknown as ReturnType<typeof api.trip.generate.useMutation>;
    });

    render(<PlanContents />);

    // Select date
    const datePicker = screen.getByTestId('date-range-picker');
    fireEvent.change(datePicker, { target: { value: 'valid-range' } });

    // Click Generate
    const generateBtn = screen.getByRole('button', { name: /Generate My Itinerary/i });
    fireEvent.click(generateBtn);

    // Verify error handling
    const mockError = { message: 'Some other error' };
    act(() => {
      capturedOptions.onError(mockError);
    });

    expect(alertSpy).toHaveBeenCalledWith('Something went wrong: Some other error');

    // Verify modal is NOT shown (default is hidden/false)
    const modal = screen.getByTestId('upgrade-modal');
    expect(modal).toHaveStyle('display: none');

    alertSpy.mockRestore();
  });
});
