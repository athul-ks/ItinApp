import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PrismaClient } from '@itinapp/db';

import { tripRouter } from './trip';

// HOISTED MOCK HELPER
// Only hoist the specific spy function we need to track.
const mocks = vi.hoisted(() => {
  return {
    parse: vi.fn(),
  };
});

// MOCK OPENAI MODULE
vi.mock('openai', () => {
  // Define a real class for the default export
  return {
    default: class OpenAI {
      // Mimic the structure: openai.responses.parse()
      responses = {
        parse: mocks.parse,
      };

      // The constructor doesn't need to do anything, but it must exist
      constructor(_config: any) {}
    },
  };
});

// Test Setup
let mockDb: DeepMockProxy<PrismaClient>;

describe('tripRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = mockDeep<PrismaClient>();
  });

  const mockSession = {
    user: { id: 'user_1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
  };

  const createCaller = (session: any = mockSession) => {
    return tripRouter.createCaller({
      db: mockDb as unknown as PrismaClient,
      session: session,
      headers: new Headers(),
    });
  };

  const validInput = {
    destination: 'Paris',
    dateRange: { from: new Date('2024-06-01'), to: new Date('2024-06-03') },
    budget: 'moderate' as const,
  };

  describe('generate', () => {
    it('should throw UNAUTHORIZED if no session', async () => {
      const caller = createCaller(null);
      await expect(caller.generate(validInput)).rejects.toThrow(TRPCError);
    });

    it('should throw FORBIDDEN if user has insufficient credits', async () => {
      const caller = createCaller();
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user_1',
        credits: 0,
      } as any);

      await expect(caller.generate(validInput)).rejects.toThrow('INSUFFICIENT_CREDITS');
    });

    it('should generate a trip and decrement credits on success', async () => {
      const caller = createCaller();

      // Mock DB: User exists with credits
      mockDb.user.findUnique.mockResolvedValue({ id: 'user_1', credits: 5 } as any);

      // Mock OpenAI: Success
      const mockTripData = [
        { id: '1', title: 'Fast', vibe: 'Fast Paced', highlights: [], itinerary: [] },
        { id: '2', title: 'Balanced', vibe: 'Balanced', highlights: [], itinerary: [] },
        { id: '3', title: 'Relaxed', vibe: 'Relaxed', highlights: [], itinerary: [] },
      ];

      // Use the hoisted spy directly
      mocks.parse.mockResolvedValue({
        output_parsed: {
          destinationCoordinates: { lat: 48.8566, lng: 2.3522 },
          options: mockTripData,
        },
      });

      mockDb.trip.create.mockResolvedValue({
        id: 'trip_123',
        tripData: mockTripData,
      } as any);

      const result = await caller.generate(validInput);

      expect(result.tripId).toBe('trip_123');
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data: { credits: { decrement: 1 } },
      });
    });

    it('should REFUND credits if OpenAI fails', async () => {
      const caller = createCaller();
      mockDb.user.findUnique.mockResolvedValue({ id: 'user_1', credits: 5 } as any);

      // Mock OpenAI: Failure
      mocks.parse.mockRejectedValue(new Error('AI Service Down'));

      await expect(caller.generate(validInput)).rejects.toThrow('Failed to generate trip');

      // Verify Refund
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data: { credits: { increment: 1 } },
      });
    });
  });
});
