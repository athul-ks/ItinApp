import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HeroSearch } from '../../../app/(home)/hero-search';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { POPULAR_DESTINATIONS } from '@/lib/destinations';

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
  const actual = await importOriginal();
  return {
    ...actual as any,
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
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('renders correctly with default state', () => {
    (useSession as any).mockReturnValue({ data: null });
    render(<HeroSearch />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Where do you want to go?')).toBeInTheDocument();
    expect(screen.getByText('Plan my Trip')).toBeDisabled();
  });

  it('opens popover and lists destinations', async () => {
    (useSession as any).mockReturnValue({ data: null });
    render(<HeroSearch />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const firstDestination = POPULAR_DESTINATIONS[0];
    await waitFor(() => {
        expect(screen.getByText(firstDestination.label)).toBeInTheDocument();
    });
  });

  it('selects a destination and enables button', async () => {
    (useSession as any).mockReturnValue({ data: null });
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
    (useSession as any).mockReturnValue({ data: null });
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
    (useSession as any).mockReturnValue({ data: { user: { name: 'Test User' } } });
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
     (useSession as any).mockReturnValue({ data: null });
    render(<HeroSearch />);

    const button = screen.getByText('Plan my Trip');
    // Button is disabled, but let's try firing click anyway to ensure logic holds if disabled attribute fails
    fireEvent.click(button);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
