import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/cron/cleanup/route';
import { NextResponse } from 'next/server';

// Hoist mocks
const { prismaMock, loggerMock, flushLogsMock, normalizeErrorMock, sentryMock } = vi.hoisted(() => {
    return {
        prismaMock: {
            trip: {
                findMany: vi.fn(),
                update: vi.fn(),
            },
            user: {
                update: vi.fn(),
            },
            $transaction: vi.fn((promises) => Promise.all(promises)),
        },
        loggerMock: {
            info: vi.fn(),
            error: vi.fn(),
        },
        flushLogsMock: vi.fn().mockResolvedValue(undefined),
        normalizeErrorMock: vi.fn((err) => ({ message: err.message })),
        sentryMock: {
            captureException: vi.fn(),
            flush: vi.fn().mockResolvedValue(true),
        }
    };
});

// Mock @itinapp/db
vi.mock('@itinapp/db', () => ({
  prisma: prismaMock,
}));

// Mock @sentry/nextjs
vi.mock('@sentry/nextjs', () => sentryMock);

// Mock @itinapp/api logger
vi.mock('@itinapp/api', () => ({
  logger: loggerMock,
  flushLogs: flushLogsMock,
  normalizeError: normalizeErrorMock,
}));

describe('GET /api/cron/cleanup', () => {
  const CRON_SECRET = 'test-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('returns 401 if authorization header is missing', async () => {
    const req = new Request('http://localhost/api/cron/cleanup', {
      headers: {},
    });

    const response = await GET(req);

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('returns 401 if authorization header is incorrect', async () => {
    const req = new Request('http://localhost/api/cron/cleanup', {
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    const response = await GET(req);

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('processes stuck trips successfully', async () => {
    const req = new Request('http://localhost/api/cron/cleanup', {
      headers: {
        authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const mockTrips = [
      { id: 'trip-1', userId: 'user-1' },
      { id: 'trip-2', userId: 'user-2' },
    ];

    prismaMock.trip.findMany.mockResolvedValue(mockTrips);
    prismaMock.trip.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const response = await GET(req);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.processed).toBe(2);

    expect(loggerMock.info).toHaveBeenCalledWith('Cron job started');
    expect(prismaMock.trip.findMany).toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);

    // Check if update was called for each trip
    expect(prismaMock.trip.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'trip-1' },
        data: { status: 'FAILED' }
    }));
    expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-1' },
        data: { credits: { increment: 1 } }
    }));

    expect(loggerMock.info).toHaveBeenCalledWith('Cron job finished');
    expect(flushLogsMock).toHaveBeenCalled();
  });

  it('handles database errors gracefully', async () => {
     const req = new Request('http://localhost/api/cron/cleanup', {
      headers: {
        authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const error = new Error('Database connection failed');
    prismaMock.trip.findMany.mockRejectedValue(error);

    const response = await GET(req);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Internal Server Error');

    expect(loggerMock.error).toHaveBeenCalledWith('Cron job failed', expect.any(Object));
    expect(flushLogsMock).toHaveBeenCalled();

    const { captureException, flush } = await import('@sentry/nextjs');
    expect(captureException).toHaveBeenCalledWith(error);
    expect(flush).toHaveBeenCalledWith(2000);
  });
});
