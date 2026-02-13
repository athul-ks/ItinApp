import * as Sentry from '@sentry/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDestinationImage } from '@/lib/unsplash';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  env: {
    ENABLE_E2E_MOCKS: 'false',
    UNSPLASH_ACCESS_KEY: 'test-key',
  },
}));

vi.mock('@itinapp/env', () => ({
  env: mocks.env,
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}));

const fetchSpy = vi.fn();
global.fetch = fetchSpy;

describe('getDestinationImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.ENABLE_E2E_MOCKS = 'false';
  });

  it('returns mock image if ENABLE_E2E_MOCKS is true', async () => {
    mocks.env.ENABLE_E2E_MOCKS = 'true';

    const result = await getDestinationImage('Paris');

    expect(result?.alt).toBe('E2E Mock Destination Image');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches and formats image data from Unsplash API', async () => {
    const mockUnsplashResponse = {
      results: [
        {
          urls: { regular: 'https://example.com/paris.jpg' },
          alt_description: 'Eiffel Tower',
          user: { name: 'Photographer', username: 'photo_user' },
        },
      ],
    };

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => mockUnsplashResponse,
    } as Response);

    const result = await getDestinationImage('Paris');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('api.unsplash.com/search/photos?query=Paris'),
      expect.objectContaining({
        headers: { Authorization: 'Client-ID test-key' },
      })
    );

    expect(result).toEqual({
      url: 'https://example.com/paris.jpg',
      alt: 'Eiffel Tower',
      credit: {
        name: 'Photographer',
        link: expect.stringContaining('@photo_user'),
      },
    });
  });

  it('logs warning to Sentry and returns null on API error', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as Response);

    const result = await getDestinationImage('London');

    expect(result).toBeNull();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('403 Forbidden'),
      'warning'
    );
  });

  it('logs exception to Sentry and returns null on Network Error', async () => {
    const error = new Error('Network Down');
    fetchSpy.mockRejectedValue(error);

    const result = await getDestinationImage('Rome');

    expect(result).toBeNull();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
