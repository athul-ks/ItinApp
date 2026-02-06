'use client';

import { useEffect, useState } from 'react';

import { signIn } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function AuthModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // The modal opens if the URL contains ?auth=login
  const isOpen = searchParams.get('auth') === 'login';
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [isLoading, setIsLoading] = useState(false);

  // Close modal by removing the ?auth param but keeping the user on the same page
  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('auth');
    params.delete('callbackUrl');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // CLEANUP FUNCTION:
    // Runs if the component is destroyed (unmounted) while the modal is open.
    // This ensures the user is never left with a stuck scrollbar.
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop with Blur */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 h-full w-full bg-black/30 backdrop-blur-sm transition-opacity cursor-default border-none"
        onClick={closeModal}
      />

      {/* Modal Content */}
      <div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all duration-200 sm:p-8">
        {/* Close X Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center">
          {/* Logo Here (Optional) */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <span className="text-xl">✈️</span>
          </div>

          <h3 className="mt-5 text-lg leading-6 font-bold text-gray-900">Unlock your Itinerary</h3>
          <p className="mt-2 text-sm text-gray-500">
            Sign in or create an account to generate, save, and share your perfect trip plans.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-black focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.-.19-.58z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
