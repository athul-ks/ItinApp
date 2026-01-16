import { TRPCError } from '@trpc/server';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { env } from '@itinapp/env';
import { E2E_CONSTANTS, MOCK_TRIP_DATA, TripOptionsSchema, TripSchema } from '@itinapp/schemas';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// FORCE EXACTLY 3 OPTIONS
const TripResponseSchema = z.object({
  destinationCoordinates: z.object({
    lat: z.number().describe('Center latitude of the destination city'),
    lng: z.number().describe('Center longitude of the destination city'),
  }),
  options: TripOptionsSchema.length(
    3,
    'You must generate exactly 3 options: Fast Paced, Balanced, and Relaxed.'
  ),
});

// --- ROUTER ---

export const tripRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        destination: z.string(),
        dateRange: z.object({ from: z.date(), to: z.date() }),
        budget: z.enum(['low', 'moderate', 'high']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (process.env.NODE_ENV !== 'production' && ctx.headers.get('x-e2e-mock') === 'true') {
        return {
          tripId: E2E_CONSTANTS.TRIP_ID,
          tripData: MOCK_TRIP_DATA,
        };
      }

      const { db, session } = ctx;

      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user || user.credits <= 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INSUFFICIENT_CREDITS',
        });
      }

      await db.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 1 } },
      });

      let duration =
        Math.ceil(
          (input.dateRange.to.getTime() - input.dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      // SAFETY: Cap duration at 5 days for this detailed mode to prevent timeout/token limits
      // If we need > 5 days, we would need to switch to "Lazy Loading" architecture.
      if (duration > 5) duration = 5;

      const budgetMap = {
        low: 'Economy (Hostels, street food, public transport)',
        moderate: 'Standard (3-4 star hotels, casual dining, mix of transit)',
        high: 'Luxury (5-star hotels, fine dining, private transfers)',
      };

      const systemPrompt = `
        You are an expert travel planner. Create exactly 3 distinct itineraries for ${input.destination}.
        Duration: ${duration} Days.
        Budget: ${budgetMap[input.budget]}.
        
        CRITICAL INSTRUCTIONS:
        1. **Coordinates**: You MUST provide accurate Latitude (lat) and Longitude (lng) for EVERY single activity and restaurant. This is required for the map.
        2. **City Center**: Provide the central lat/lng for ${input.destination} as 'destinationCoordinates'.
        3. **Completeness**: Generate ALL 3 options (Fast Paced, Balanced, Relaxed).
        
        For each option, provide a HIGHLY DETAILED day-by-day itinerary including:
        - Specific times (Morning/Afternoon/Evening).
        - Travel times between locations.
        - 2-3 Restaurant suggestions per meal slot matching the budget.
        - Accommodation suggestion for the night.
        
        Note: Keep descriptions concise to ensure you have space to generate ALL 3 distinct plans.
      `;

      try {
        const response = await openai.responses.parse({
          model: 'gpt-4o-2024-08-06',
          input: [
            {
              role: 'system',
              content: 'You are a helpful travel assistant. You ALWAYS generate 3 options.',
            },
            { role: 'user', content: systemPrompt },
          ],
          text: {
            format: zodTextFormat(TripResponseSchema, 'trip_options'),
          },
        });

        const parsedData = response.output_parsed;

        if (!parsedData?.options || parsedData.options.length !== 3) {
          console.error(`Only received ${parsedData?.options?.length} options.`);
          throw new Error('AI failed to generate all 3 options. Please try again.');
        }

        const savedTrip = await db.trip.create({
          data: {
            userId: session.user.id,
            destination: input.destination,
            destinationLat: parsedData.destinationCoordinates.lat,
            destinationLng: parsedData.destinationCoordinates.lng,
            startDate: input.dateRange.from,
            endDate: input.dateRange.to,
            budget: input.budget,
            tripData: parsedData.options,
          },
        });

        return {
          tripId: savedTrip.id,
          tripData: parsedData.options,
        };
      } catch (error) {
        await db.user.update({
          where: { id: session.user.id },
          data: { credits: { increment: 1 } },
        });
        console.error('Trip generation failed, credit refunded:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate trip. Your credit has been refunded.',
        });
      }
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const trip = await ctx.db.trip.findUnique({
      where: { id: input.id },
    });

    if (!trip) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' });
    }

    const parsedTrip = TripSchema.parse(trip);
    return parsedTrip;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const trips = await ctx.db.trip.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return trips.map((trip) => TripSchema.parse(trip));
  }),
});
