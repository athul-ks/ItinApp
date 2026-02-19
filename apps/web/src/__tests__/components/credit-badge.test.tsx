import { render, screen } from '@testing-library/react';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';

import { CreditBadge } from '../../components/credit-badge';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock @itinapp/ui/components/skeleton
vi.mock('@itinapp/ui/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// Mock Lucide icon
vi.mock('lucide-react', () => ({
  Coins: ({ className }: { className?: string }) => <div data-testid="coins-icon" className={className} />,
}));

describe('CreditBadge', () => {
  const mockUseSession = useSession as MockedFunction<typeof useSession>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });

    render(<CreditBadge />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders nothing when unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    const { container } = render(<CreditBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when session exists but user is null', () => {
    const mockSession: Partial<Session> = {
      user: undefined,
    };

    mockUseSession.mockReturnValue({
      data: mockSession as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    const { container } = render(<CreditBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders credits count correctly for single credit', () => {
    // We assume Session is augmented with credits
    const mockSession = {
      user: { credits: 1 },
      expires: '2099-01-01',
    };

    mockUseSession.mockReturnValue({
      data: mockSession as unknown as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<CreditBadge />);
    expect(screen.getByText('1 Credit')).toBeInTheDocument();
    expect(screen.getByText('1 Credit').closest('div')).toHaveClass('bg-white', 'text-gray-700');
  });

  it('renders credits count correctly for multiple credits', () => {
    const mockSession = {
      user: { credits: 5 },
      expires: '2099-01-01',
    };

    mockUseSession.mockReturnValue({
      data: mockSession as unknown as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<CreditBadge />);
    expect(screen.getByText('5 Credits')).toBeInTheDocument();
  });

  it('applies red styling when credits are 0', () => {
    const mockSession = {
      user: { credits: 0 },
      expires: '2099-01-01',
    };

    mockUseSession.mockReturnValue({
      data: mockSession as unknown as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<CreditBadge />);
    const badge = screen.getByText('0 Credits').closest('div');
    expect(badge).toHaveClass('border-red-200', 'bg-red-50', 'text-red-600');

    const icon = screen.getByTestId('coins-icon');
    expect(icon).toHaveClass('text-red-500');
  });
});
