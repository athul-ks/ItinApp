import * as Sentry from '@sentry/nextjs';
import 'server-only';

import { env } from '@itinapp/env';

type UnsplashImage = {
  url: string;
  alt: string;
  credit: {
    name: string;
    link: string;
  };
};

export async function getDestinationImage(query: string): Promise<UnsplashImage | null> {
  if (env.ENABLE_E2E_MOCKS === 'true') {
    return {
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      alt: 'E2E Mock Destination Image',
      credit: {
        name: 'E2E Test',
        link: 'https://unsplash.com',
      },
    };
  }

  const accessKey = env.UNSPLASH_ACCESS_KEY;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        // Cache this result for 1 hour so we don't hit limits
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      Sentry.captureMessage(
        `Unsplash API Error: ${response.status} ${response.statusText}`,
        'warning'
      );
      return null;
    }

    const data = await response.json();
    const photo = data.results?.[0];

    if (!photo) return null;

    return {
      url: photo.urls.regular, // or .full if you want higher qual
      alt: photo.alt_description || query,
      credit: {
        name: photo.user.name,
        link: `https://unsplash.com/@${photo.user.username}?utm_source=ItinApp&utm_medium=referral`, // UTI params required by Unsplash
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
}
