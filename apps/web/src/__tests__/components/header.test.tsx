import { fireEvent, render, screen, within } from '@testing-library/react';
import type { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';

import Header from '../../components/header';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock CreditBadge
vi.mock('../../components/credit-badge', () => ({
  CreditBadge: () => <div data-testid="credit-badge">Credits</div>,
}));

// Mock UI components
vi.mock('@itinapp/ui/components/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="sheet" data-state={open ? 'open' : 'closed'}>
      <button data-testid="toggle-sheet" onClick={() => onOpenChange(!open)}>
        Toggle Sheet
      </button>
      {children}
    </div>
  ),
  SheetTrigger: ({ children }: { children: ReactNode }) => <div data-testid="sheet-trigger">{children}</div>,
  SheetContent: ({ children }: { children: ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@itinapp/ui/components/button', () => ({
  Button: ({ children, onClick, ...props }: { children: ReactNode; onClick?: () => void; [key: string]: unknown }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  buttonVariants: () => 'button-variant-class',
}));

describe('Header', () => {
  const mockUseSession = useSession as MockedFunction<typeof useSession>;
  const mockUsePathname = usePathname as MockedFunction<typeof usePathname>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders unauthenticated state', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header />);

    // Check for Sign In / Get Started buttons
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
    expect(screen.queryByText('My Trips')).not.toBeInTheDocument();
  });

  it('renders authenticated state', () => {
    const mockSession = {
      user: { name: 'John Doe', email: 'john@example.com' },
    };

    mockUseSession.mockReturnValue({
      data: mockSession as unknown as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText('Hi, John')).toBeInTheDocument();

    expect(screen.getAllByText('My Trips').length).toBeGreaterThan(0);

    // There can be multiple credit badges (desktop and mobile)
    const creditBadges = screen.getAllByTestId('credit-badge');
    expect(creditBadges.length).toBeGreaterThan(0);
    expect(creditBadges[0]).toBeInTheDocument();

    expect(screen.getAllByText('Sign Out').length).toBeGreaterThan(0);
  });

  it('opens mobile menu and shows correct content', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header />);

    const sheet = screen.getByTestId('sheet');
    expect(sheet).toHaveAttribute('data-state', 'closed');

    const toggle = screen.getByTestId('toggle-sheet');
    fireEvent.click(toggle);

    expect(sheet).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('calls signOut when clicking Sign Out button', () => {
    const mockSession = {
      user: { name: 'John Doe' },
    };

    mockUseSession.mockReturnValue({
      data: mockSession as unknown as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);

    const signOutButtons = screen.getAllByText('Sign Out');
    fireEvent.click(signOutButtons[0]);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('calls signOut from mobile menu', () => {
    const mockSession = {
      user: { name: 'John Doe' },
    };

    mockUseSession.mockReturnValue({
      data: mockSession as unknown as Session,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);

    // Open menu
    const toggle = screen.getByTestId('toggle-sheet');
    fireEvent.click(toggle);

    const sheetContent = screen.getByTestId('sheet-content');
    const mobileSignOut = within(sheetContent).getByText('Sign Out');

    fireEvent.click(mobileSignOut);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
