import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PrismaClient } from '@itinapp/db';

// 1. MOCK ENV MODULE to simulate PRODUCTION
vi.mock('@itinapp/env', async () => {
  return {
    env: {
      NODE_ENV: 'production',
      OPENAI_API_KEY: 'test-key',
      DATABASE_URL: 'postgres://test',
    },
  };
});

// 2. MOCK OPENAI
vi.mock('openai', () => {
  return {
    default: class OpenAI {
      responses = {
        parse: vi.fn(),
      };
    },
  };
});

// 3. IMPORT ROUTER
import { tripRouter } from '../../router/trip';

describe('tripRouter Security Checks', () => {
  let mockDb: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = mockDeep<PrismaClient>();

    // Mock transaction
    mockDb.$transaction.mockImplementation(async (arg: any) => {
      if (typeof arg === 'function') return arg(mockDb);
      return arg;
    });
    mockDb.$queryRaw.mockResolvedValue([1]);
  });

  const mockSession = {
    user: { id: 'user_1', credits: 5 },
    expires: '2099-01-01',
  };

  const createCaller = (headers: Headers = new Headers()) => {
    return tripRouter.createCaller({
      db: mockDb as unknown as PrismaClient,
      session: mockSession,
      headers,
    });
  };

  it('should IGNORE x-e2e-mock header when NODE_ENV is production', async () => {
    const headers = new Headers();
    headers.set('x-e2e-mock', 'true'); // Try to exploit
    const caller = createCaller(headers);

    const input = {
      destination: 'Paris',
      dateRange: { from: new Date(), to: new Date() },
      budget: 'moderate' as const,
      vibe: 'relaxed' as const,
    };

    // Make DB call fail to prove it was called
    mockDb.trip.findFirst.mockRejectedValue(new Error('DB_ACCESSED'));

    // If logic is vulnerable, it returns mock data and ignores DB
    // If logic is secure, it calls DB and throws 'DB_ACCESSED'

    await expect(caller.generate(input)).rejects.toThrow('DB_ACCESSED');
  });
});
