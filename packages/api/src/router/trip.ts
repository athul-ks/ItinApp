import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  E2E_CONSTANTS,
  ItinerarySchema,
  TripInputSchema,
  TripResponseSchema,
} from '@itinapp/schemas';

import { generateCacheKey } from '../lib/cache-key';
import { itineraryQueue } from '../lib/queue';
import { redis } from '../lib/redis';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// --- ROUTER ---

export const tripRouter = createTRPCRouter({
  generate: protectedProcedure.input(TripInputSchema).mutation(async ({ ctx, input }) => {
    const forceMock = process.env.ENABLE_E2E_MOCKS === 'true';
    const headerMock = ctx.headers.get('x-e2e-mock') === 'true';

    if (forceMock || headerMock) {
      console.log('⚡ E2E Mode Detected: Returning Mock Data immediately.');
      return {
        tripId: E2E_CONSTANTS.TRIP_ID,
      };
    }

    const { db, session } = ctx;
    const cacheKey = generateCacheKey(input);

    try {
      const cachedDataString = await redis.get(cacheKey);
      if (cachedDataString) {
        let rawData;
        try {
          rawData = JSON.parse(cachedDataString);
        } catch (e) {
          console.warn(`Redis contained invalid JSON for key ${cacheKey}. Deleting. Error: `, e);
          await redis.del(cacheKey);
          rawData = null;
        }

        if (rawData) {
          const parseResult = TripResponseSchema.safeParse(rawData);
          if (parseResult.success) {
            const cachedData = parseResult.data;
            return db.$transaction(async (tx) => {
              const user = await tx.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: 1 } },
              });

              if (user.credits < 0) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'INSUFFICIENT_CREDITS' });
              }

              const trip = await tx.trip.create({
                data: {
                  userId: session.user.id,
                  destination: input.destination,
                  destinationLat: cachedData.coordinates.lat,
                  destinationLng: cachedData.coordinates.lng,
                  startDate: input.dateRange.from,
                  endDate: input.dateRange.to,
                  budget: input.budget,
                  status: 'COMPLETED',
                  itinerary: cachedData.itinerary,
                },
              });

              return { tripId: trip.id };
            });
          } else {
            console.warn(parseResult.error);
            await redis.del(cacheKey);
          }
        }
      }
    } catch (err) {
      console.error('Redis cache read failed:', err);
    }

    // 1. Transaction: Lock User, Check Limit, Deduct Credit, Create Pending Trip
    const pendingTrip = await db.$transaction(async (tx) => {
      // Lock the user to serialize requests
      // This prevents parallel requests from bypassing the rate limit check
      await tx.$queryRaw`SELECT 1 FROM "User" WHERE id = ${session.user.id} FOR UPDATE`;

      const lastTrip = await tx.trip.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      if (lastTrip) {
        const timeSinceLastTrip = Date.now() - lastTrip.createdAt.getTime();
        if (timeSinceLastTrip < 60 * 1000) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Please wait before generating another trip.',
          });
        }
      }

      const result = await tx.user.updateMany({
        where: {
          id: session.user.id,
          credits: { gt: 0 },
        },
        data: {
          credits: { decrement: 1 },
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INSUFFICIENT_CREDITS',
        });
      }

      return tx.trip.create({
        data: {
          userId: session.user.id,
          destination: input.destination,
          destinationLat: 0, // Placeholder
          destinationLng: 0, // Placeholder
          startDate: input.dateRange.from,
          endDate: input.dateRange.to,
          budget: input.budget,
          itinerary: {}, // Placeholder
          status: 'PENDING',
        },
      });
    });

    await itineraryQueue.add('generate-itinerary', {
      tripId: pendingTrip.id,
      userId: session.user.id, // Helpful for refunding credits on total failure
      input: {
        destination: input.destination,
        dateRange: input.dateRange,
        budget: input.budget,
        vibe: input.vibe,
      },
    });

    return {
      tripId: pendingTrip.id,
    };
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const trip = await ctx.db.trip.findUnique({
      where: { id: input.id },
    });

    if (!trip) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' });
    }

    if (trip.userId !== ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not authorized to view this trip',
      });
    }

    let parsedItinerary = null;
    if (trip.itinerary) {
      const result = ItinerarySchema.or(z.object({})).safeParse(trip.itinerary);
      if (!result.success) {
        // SECURITY: Log the validation error sanitized, but do not expose details to user
        console.error(`Data corruption detected for trip ${trip.id}:`, result.error.message);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Trip data is corrupted and cannot be displayed.',
        });
      }
      parsedItinerary = result.data;
    }

    return {
      ...trip,
      itinerary: parsedItinerary,
    };
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const trips = await ctx.db.trip.findMany({
      where: {
        userId: ctx.session.user.id,
        status: { not: 'FAILED' },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // SECURITY: Filter out corrupted trips instead of crashing the entire request.
    // This prevents a persistent Denial of Service if one trip has invalid JSON.
    return trips.reduce(
      (acc, trip) => {
        if (!trip.itinerary) {
          if (trip.status === 'COMPLETED') {
            console.error(`Trip ${trip.id} is COMPLETED but has missing itinerary.`);
            return acc; // Skip/Filter out
          }
          acc.push({ ...trip, itinerary: null });
          return acc;
        }

        const result = ItinerarySchema.safeParse(trip.itinerary);
        if (result.success) {
          acc.push({
            ...trip,
            itinerary: result.data,
          });
        } else {
          console.error(`Data corruption detected for trip ${trip.id}:`, result.error.message);
        }
        return acc;
      },
      [] as Array<(typeof trips)[number] & { itinerary: z.infer<typeof ItinerarySchema> | null }>
    );
  }),
});
