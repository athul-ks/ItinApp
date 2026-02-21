import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PrismaClient } from '@itinapp/db';
import { Itinerary } from '@itinapp/schemas';

import { itineraryQueue } from '../../lib/queue';
import { redis } from '../../lib/redis';
import { tripRouter } from '../../router/trip';

// Test Setup
let mockDb: DeepMockProxy<PrismaClient>;
const originalEnv = process.env;

describe('tripRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = mockDeep<PrismaClient>();
    process.env.ENABLE_E2E_MOCKS = 'false';

    // MOCK TRANSACTION
    // Execute callback immediately
    mockDb.$transaction.mockImplementation(async (arg: any) => {
      if (typeof arg === 'function') {
        return arg(mockDb);
      }
      return arg;
    });

    // MOCK QUERYRAW
    mockDb.$queryRaw.mockResolvedValue([1]);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const mockSession = {
    user: { id: 'user_1', name: 'Test User', email: 'test@example.com', credits: 10 },
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

  const mockItinerary: Itinerary = {
    title: 'Paris Trip',
    description: 'A nice trip',
    totalCostEstimate: '£1000',
    vibe: 'Relaxed',
    highlights: ['Eiffel'],
    days: [],
  };

  describe('getAll', () => {
    it('should not return failed trips', async () => {
      const caller = createCaller();
      mockDb.trip.findMany.mockResolvedValue([]);

      await caller.getAll();

      expect(mockDb.trip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user_1',
            status: { not: 'FAILED' },
          }),
        })
      );
    });

    it('should handle corrupted trip data gracefully', async () => {
      const caller = createCaller();

      const corruptedTrip = {
        id: 'bad',
        userId: 'user_1',
        destination: 'Nowhere',
        status: 'COMPLETED',
        createdAt: new Date(),
        itinerary: { bad_field: true }, // Invalid Schema
      };

      const validTrip = {
        id: 'good',
        userId: 'user_1',
        destination: 'Paris',
        status: 'COMPLETED',
        createdAt: new Date(),
        itinerary: mockItinerary, // Valid Schema
      };

      mockDb.trip.findMany.mockResolvedValue([corruptedTrip, validTrip] as any);

      const result = await caller.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('good');
    });

    it('should include PENDING trips with null itinerary', async () => {
      const caller = createCaller();
      const pendingTrip = {
        id: 'pending',
        userId: 'user_1',
        status: 'PENDING',
        createdAt: new Date(),
        itinerary: null,
      };

      mockDb.trip.findMany.mockResolvedValue([pendingTrip] as any);

      const result = await caller.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('PENDING');
    });
  });

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
        'Please wait before generating another trip'
      );

      // Verify User Locking was called
      expect(mockDb.$queryRaw).toHaveBeenCalled();
    });

    it('should throw FORBIDDEN if user has insufficient credits', async () => {
      const caller = createCaller();
      mockDb.user.updateMany.mockResolvedValue({ count: 0 });

      await expect(caller.generate(validInput)).rejects.toThrow('INSUFFICIENT_CREDITS');
    });

    it('should return COMPLETED trip immediately on Cache Hit', async () => {
      const caller = createCaller();

      const cachedData = {
        itinerary: mockItinerary,
        coordinates: { lat: 10, lng: 20 },
      };
      (redis.get as any).mockResolvedValue(JSON.stringify(cachedData));

      mockDb.user.update.mockResolvedValue({ credits: 5 } as any);
      mockDb.trip.create.mockResolvedValue({ id: 'instant_trip' } as any);

      const result = await caller.generate(validInput);

      expect(redis.get).toHaveBeenCalled(); // Checked cache
      expect(itineraryQueue.add).not.toHaveBeenCalled(); // Did NOT queue job
      expect(mockDb.trip.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED', // Instant success
            itinerary: expect.anything(),
          }),
        })
      );
      expect(result.tripId).toBe('instant_trip');
    });

    it('should queue a job and return PENDING trip on Cache Miss', async () => {
      const caller = createCaller();
      (redis.get as any).mockResolvedValue(null);

      mockDb.user.updateMany.mockResolvedValue({ count: 1 });
      mockDb.trip.create.mockResolvedValue({
        id: 'job_trip',
        status: 'PENDING',
      } as any);

      const result = await caller.generate(validInput);

      expect(redis.get).toHaveBeenCalled();
      expect(itineraryQueue.add).toHaveBeenCalledWith(
        'generate-itinerary',
        expect.objectContaining({
          tripId: 'job_trip',
          userId: 'user_1',
          input: expect.objectContaining({ destination: 'Paris' }),
        })
      );

      expect(mockDb.trip.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );

      expect(result.tripId).toBe('job_trip');
    });

    it('should rate limit subsequent requests even if the previous trip failed', async () => {
      const caller = createCaller();
      (redis.get as any).mockResolvedValue(null);

      // Mock that a trip was created 30 seconds ago (and FAILED)
      mockDb.trip.findFirst.mockResolvedValue({
        id: 'recent',
        createdAt: new Date(Date.now() - 30 * 1000), // 30s ago
      } as any);

      await expect(caller.generate(validInput)).rejects.toThrow(
        'Please wait before generating another trip'
      );
    });

    describe('E2E / Mock Mode', () => {
      const originalEnv = process.env;

      beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
      });

      afterEach(() => {
        process.env = originalEnv;
      });

      it('should return MOCK DATA immediately if ENABLE_E2E_MOCKS env var is set', async () => {
        process.env.ENABLE_E2E_MOCKS = 'true';
        const caller = createCaller();
        const result = await caller.generate(validInput);

        expect(result.tripId).toBe('e2e-test-trip-id');
        expect(mockDb.$transaction).not.toHaveBeenCalled();
      });

      it('should return MOCK DATA immediately if x-e2e-mock header is present', async () => {
        const headers = new Headers();
        headers.set('x-e2e-mock', 'true');

        const caller = tripRouter.createCaller({
          db: mockDb as unknown as PrismaClient,
          session: mockSession,
          headers: headers,
        });

        const result = await caller.generate(validInput);

        expect(result.tripId).toBe('e2e-test-trip-id');
        expect(mockDb.$transaction).not.toHaveBeenCalled();
      });

      it('should IGNORE x-e2e-mock header if NODE_ENV is production', async () => {
        process.env.NODE_ENV = 'production';
        const headers = new Headers();
        headers.set('x-e2e-mock', 'true');

        const caller = tripRouter.createCaller({
          db: mockDb as unknown as PrismaClient,
          session: mockSession,
          headers: headers,
        });

        // Mock normal flow to ensure it proceeds past the mock check
        (redis.get as any).mockResolvedValue(null);
        mockDb.user.updateMany.mockResolvedValue({ count: 1 });
        mockDb.trip.create.mockResolvedValue({ id: 'job_trip', status: 'PENDING' } as any);

        const result = await caller.generate(validInput);

        // Should NOT return E2E mock ID
        expect(result.tripId).toBe('job_trip');
        expect(mockDb.$transaction).toHaveBeenCalled();
      });
    });
  });
});
