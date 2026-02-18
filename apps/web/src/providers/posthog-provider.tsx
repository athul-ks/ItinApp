'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const IS_MOCK_ENV = POSTHOG_KEY?.includes('mock') || process.env.NODE_ENV === 'test';

if (typeof window !== 'undefined' && !IS_MOCK_ENV && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // Optimized for speed
  });
}

const mockPostHogClient = {
  capture: () => {},
  identify: () => {},
  on: () => {},
  reset: () => {},
  opt_in_capturing: () => {},
  opt_out_capturing: () => {},
  // Add other methods if app uses them specifically
} as unknown as typeof posthog;

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const client = IS_MOCK_ENV ? mockPostHogClient : posthog;
  return <PostHogProvider client={client}>{children}</PostHogProvider>;
}
