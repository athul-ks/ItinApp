import { fireEvent, render, screen } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';

import { AuthModal } from '../../components/auth-modal';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

describe('AuthModal', () => {
  const mockReplace = vi.fn();
  const mockPush = vi.fn();

  const mockUseRouter = useRouter as MockedFunction<typeof useRouter>;
  const mockUsePathname = usePathname as MockedFunction<typeof usePathname>;
  const mockUseSearchParams = useSearchParams as MockedFunction<typeof useSearchParams>;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockRouter: Partial<AppRouterInstance> = {
      push: mockPush,
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as unknown as AppRouterInstance);

    mockUsePathname.mockReturnValue('/current-path');

    // Reset body style
    document.body.style.overflow = 'unset';
  });

  it('renders nothing when auth param is not "login"', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('') as unknown as ReadonlyURLSearchParams);
    const { container } = render(<AuthModal />);
    expect(container).toBeEmptyDOMElement();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('renders modal when auth="login"', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login') as unknown as ReadonlyURLSearchParams);
    render(<AuthModal />);
    expect(screen.getByText('Unlock your Itinerary')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes modal when backdrop is clicked', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login') as unknown as ReadonlyURLSearchParams);
    render(<AuthModal />);

    const backdrop = screen.getByLabelText('Close modal');
    fireEvent.click(backdrop);

    expect(mockReplace).toHaveBeenCalledWith('/current-path?', { scroll: false });
  });

  it('closes modal when X button is clicked', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login') as unknown as ReadonlyURLSearchParams);
    render(<AuthModal />);

    const buttons = screen.getAllByRole('button');
    // Index 1 is the close X button
    fireEvent.click(buttons[1]);

    expect(mockReplace).toHaveBeenCalledWith('/current-path?', { scroll: false });
  });

  it('closes modal on Escape key', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login') as unknown as ReadonlyURLSearchParams);
    render(<AuthModal />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockReplace).toHaveBeenCalledWith('/current-path?', { scroll: false });
  });

  it('calls signIn with google provider and callbackUrl', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login&callbackUrl=/dashboard') as unknown as ReadonlyURLSearchParams);
    render(<AuthModal />);

    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
  });

  it('sets loading state when signIn is called', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login') as unknown as ReadonlyURLSearchParams);
    render(<AuthModal />);

    const googleButton = screen.getByText('Continue with Google');
    expect(googleButton).not.toBeDisabled();

    fireEvent.click(googleButton);

    expect(googleButton).toBeDisabled();
  });

  it('cleans up body overflow on unmount', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('auth=login') as unknown as ReadonlyURLSearchParams);
    const { unmount } = render(<AuthModal />);

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});
