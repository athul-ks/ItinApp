import { fireEvent, render, screen } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteAccountButton } from '../../components/delete-account-button';
import { api } from '../../trpc/react';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}));

// Mock api
vi.mock('../../trpc/react', () => ({
  api: {
    auth: {
      deleteAccount: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock UI components
vi.mock('@itinapp/ui/components/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog-root">
      <button data-testid="force-open-dialog" onClick={() => onOpenChange?.(true)}>
        Open Dialog Mock
      </button>
      {open ? <div data-testid="dialog-open">{children}</div> : <div data-testid="dialog-closed">{children}</div>}
    </div>
  ),
  DialogTrigger: ({ children }: { children: ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@itinapp/ui/components/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: { children: ReactNode; onClick?: () => void; disabled?: boolean; [key: string]: unknown }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// Helper type to avoid repeating long return type
type DeleteAccountMutationResult = ReturnType<typeof api.auth.deleteAccount.useMutation>;

describe('DeleteAccountButton', () => {
  const mockMutate = vi.fn();
  let onSuccessCallback: (() => Promise<void>) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    onSuccessCallback = undefined;

    const useMutationMock = vi.mocked(api.auth.deleteAccount.useMutation);

    useMutationMock.mockImplementation((options: unknown) => {
       const opts = options as { onSuccess?: () => Promise<void> };
       onSuccessCallback = opts?.onSuccess;

       return {
        mutate: mockMutate,
        isPending: false,
        data: undefined,
        error: null,
        isError: false,
        isSuccess: false,
        status: 'idle',
        reset: vi.fn(),
        context: undefined,
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        isIdle: true,
        isPaused: false,
        mutateAsync: vi.fn(),
        submittedAt: 0,
       } as unknown as DeleteAccountMutationResult;
    });
  });

  it('renders the delete account button', () => {
    render(<DeleteAccountButton />);
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
  });

  it('opens confirmation dialog and triggers delete', () => {
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByTestId('force-open-dialog'));
    expect(screen.getByText('Delete Account', { selector: 'h2' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, delete my account'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('calls signOut after successful deletion', async () => {
    render(<DeleteAccountButton />);
    expect(onSuccessCallback).toBeDefined();

    if (onSuccessCallback) {
      await onSuccessCallback();
    }

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('shows loading state', () => {
    const useMutationMock = vi.mocked(api.auth.deleteAccount.useMutation);

    useMutationMock.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        data: undefined,
        error: null,
        isError: false,
        isSuccess: false,
        status: 'pending',
        reset: vi.fn(),
        context: undefined,
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        isIdle: false,
        isPaused: false,
        mutateAsync: vi.fn(),
        submittedAt: 0,
    } as unknown as DeleteAccountMutationResult);

    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByTestId('force-open-dialog'));

    const button = screen.getByText('Deleting...');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
