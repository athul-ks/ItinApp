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
    vibe: 'relaxed' as const,
  };

  describe('getById', () => {
    it('should throw FORBIDDEN if user tries to access another users trip', async () => {
      const caller = createCaller();
      const tripId = 'trip_of_user_2';

      mockDb.trip.findUnique.mockResolvedValue({
        id: tripId,
        userId: 'user_2', // Different user
        destination: 'London',
        destinationLat: 51.5,
        destinationLng: -0.12,
        startDate: new Date(),
        endDate: new Date(),
        budget: 'moderate',
        tripData: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(caller.getById({ id: tripId })).rejects.toThrow(
        'You are not authorized to view this trip'
      );
    });

    it('should return trip if it belongs to the user', async () => {
      const caller = createCaller();
      const tripId = 'trip_123';

      mockDb.trip.findUnique.mockResolvedValue({
        id: tripId,
        userId: 'user_1', // Matches mockSession
        destination: 'Paris',
        destinationLat: 48.8566,
        destinationLng: 2.3522,
        startDate: new Date(),
        endDate: new Date(),
        budget: 'moderate',
        tripData: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await caller.getById({ id: tripId });
      expect(result.id).toBe(tripId);
    });
  });

  describe('generate', () => {
    describe('Input Validation', () => {
      it('should throw if destination is too short', async () => {
        const caller = createCaller();
        await expect(caller.generate({ ...validInput, destination: 'A' })).rejects.toThrow();
      });

      it('should throw if destination is too long', async () => {
        const caller = createCaller();
        const longDestination = 'A'.repeat(101);
        await expect(
          caller.generate({ ...validInput, destination: longDestination })
        ).rejects.toThrow();
      });

      it('should throw if destination contains control characters', async () => {
        const caller = createCaller();
        await expect(
          caller.generate({ ...validInput, destination: 'Paris\nFrance' })
        ).rejects.toThrow('Destination cannot contain control characters');

        await expect(
          caller.generate({ ...validInput, destination: 'Paris\0France' })
        ).rejects.toThrow('Destination cannot contain control characters');
      });

      it('should throw if dateRange is invalid (end before start)', async () => {
        const caller = createCaller();
        const invalidDateRange = {
          from: new Date('2024-06-05'),
          to: new Date('2024-06-01'),
        };
        await expect(
          caller.generate({ ...validInput, dateRange: invalidDateRange })
        ).rejects.toThrow('End date must be after start date');
      });

      it('should throw if destination contains triple quotes', async () => {
        const caller = createCaller();
        await expect(
          caller.generate({ ...validInput, destination: 'Evil """ Injection' })
        ).rejects.toThrow('Destination cannot contain triple quotes');
      });
    });

    it('should throw UNAUTHORIZED if no session', async () => {
      const caller = createCaller(null);
      await expect(caller.generate(validInput)).rejects.toThrow(TRPCError);
    });

    it('should throw TOO_MANY_REQUESTS if last trip was created < 1 min ago', async () => {
      const caller = createCaller();

      // Mock that a trip was created 30 seconds ago
      mockDb.trip.findFirst.mockResolvedValue({
        id: 'recent_trip',
        userId: 'user_1',
        createdAt: new Date(Date.now() - 30 * 1000), // 30s ago
      } as any);

      await expect(caller.generate(validInput)).rejects.toThrow(
        'Please wait a minute before generating another trip'
      );
    });

    it('should throw FORBIDDEN if user has insufficient credits', async () => {
      const caller = createCaller();
      mockDb.user.updateMany.mockResolvedValue({ count: 0 });

      await expect(caller.generate(validInput)).rejects.toThrow('INSUFFICIENT_CREDITS');
    });

    it('should generate a trip and decrement credits on success', async () => {
      const caller = createCaller();

      // Mock DB: Credits check and deduct
      mockDb.user.updateMany.mockResolvedValue({ count: 1 });

      // Mock OpenAI: Success
      const mockTripData = [
        { id: '3', title: 'Relaxed', vibe: 'Relaxed', highlights: [], itinerary: [] },
      ];

      // Use the hoisted spy directly
      mocks.parse.mockResolvedValue({
        output_parsed: {
          destinationCoordinates: { lat: 48.8566, lng: 2.3522 },
          itinerary: mockTripData,
        },
      });

      mockDb.trip.create.mockResolvedValue({
        id: 'trip_123',
        tripData: mockTripData,
      } as any);

      const result = await caller.generate(validInput);

      expect(result.tripId).toBe('trip_123');
      expect(mockDb.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user_1', credits: { gt: 0 } },
        data: { credits: { decrement: 1 } },
      });
    });

    it('should REFUND credits if OpenAI fails', async () => {
      const caller = createCaller();
      mockDb.user.updateMany.mockResolvedValue({ count: 1 });

      // Mock OpenAI: Failure
      mocks.parse.mockRejectedValue(new Error('AI Service Down'));

      await expect(caller.generate(validInput)).rejects.toThrow('Failed to generate trip');

      // Verify Refund
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data: { credits: { increment: 1 } },
      });
    });

    it('should cap duration at 10 days (SAFETY LIMIT)', async () => {
      const caller = createCaller();
      mockDb.user.updateMany.mockResolvedValue({ count: 1 });

      const longDateRange = {
        from: new Date('2024-06-01'),
        to: new Date('2024-06-16'), // 15 days
      };

      mocks.parse.mockResolvedValue({
        output_parsed: {
          destinationCoordinates: { lat: 48.8566, lng: 2.3522 },
          itinerary: [],
        },
      });

      mockDb.trip.create.mockResolvedValue({
        id: 'trip_123',
        tripData: [],
      } as any);

      await caller.generate({ ...validInput, dateRange: longDateRange });

      const calls = mocks.parse.mock.calls;
      const lastCall = calls[calls.length - 1];
      const inputArg = lastCall[0].input;
      const userMessage = inputArg.find((msg: any) => msg.role === 'user').content;

      // Safety limit caps at 10 days
      expect(userMessage).toContain('Duration: 10 Days');
    });
  });
});
