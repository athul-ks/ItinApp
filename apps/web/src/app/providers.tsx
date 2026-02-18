'use client';

import { SessionProvider } from 'next-auth/react';

import { CSPostHogProvider } from '@/providers/posthog-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <SessionProvider>{children}</SessionProvider>
    </CSPostHogProvider>
  );
}
