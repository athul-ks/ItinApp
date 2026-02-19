import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POPULAR_DESTINATIONS } from '@/lib/destinations';

import { HeroSearch } from '../../../app/(home)/hero-search';

// Mock ResizeObserver for cmdk
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for cmdk
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    MapPinIcon: () => <div data-testid="map-pin-icon" />,
    ChevronsUpDown: () => <div data-testid="chevrons-up-down" />,
    Check: () => <div data-testid="check-icon" />,
  };
});

// Mock pointer capture methods for Radix UI
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe('HeroSearch', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('renders correctly with default state', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
    render(<HeroSearch />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Where do you want to go?')).toBeInTheDocument();
    expect(screen.getByText('Plan my Trip')).toBeDisabled();
  });

  it('opens popover and lists destinations', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
    render(<HeroSearch />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const firstDestination = POPULAR_DESTINATIONS[0];
    await waitFor(() => {
      expect(screen.getByText(firstDestination.label)).toBeInTheDocument();
    });
  });

  it('selects a destination and enables button', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
    render(<HeroSearch />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const firstDestination = POPULAR_DESTINATIONS[0];
    const option = await screen.findByText(firstDestination.label);

    fireEvent.click(option);

    expect(screen.getByText(firstDestination.label)).toBeInTheDocument();
    expect(screen.getByText('Plan my Trip')).not.toBeDisabled();
  });

  it('redirects to auth when user is not logged in', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
    render(<HeroSearch />);

    // Select destination
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    const firstDestination = POPULAR_DESTINATIONS[0];
    const option = await screen.findByText(firstDestination.label);
    fireEvent.click(option);

    // Click Plan my Trip
    const button = screen.getByText('Plan my Trip');
    fireEvent.click(button);

    const params = new URLSearchParams();
    params.set('destination', firstDestination.label);
    const targetUrl = `/plan?${params.toString()}`;
    const expectedUrl = `?auth=login&callbackUrl=${encodeURIComponent(targetUrl)}`;

    expect(mockPush).toHaveBeenCalledWith(expectedUrl);
  });

  it('redirects to plan page when user is logged in', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          id: 'user_123',
          credits: 10,
        },
        expires: '9999-12-31T23:59:59.999Z',
      },
      status: 'authenticated',
      update: vi.fn(),
    });
    render(<HeroSearch />);

    // Select destination
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    const firstDestination = POPULAR_DESTINATIONS[0];
    const option = await screen.findByText(firstDestination.label);
    fireEvent.click(option);

    // Click Plan my Trip
    const button = screen.getByText('Plan my Trip');
    fireEvent.click(button);

    const params = new URLSearchParams();
    params.set('destination', firstDestination.label);
    const expectedUrl = `/plan?${params.toString()}`;

    expect(mockPush).toHaveBeenCalledWith(expectedUrl);
  });

  it('does nothing if search is empty', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
    render(<HeroSearch />);

    const button = screen.getByText('Plan my Trip');
    // Button is disabled, but let's try firing click anyway to ensure logic holds if disabled attribute fails
    fireEvent.click(button);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
