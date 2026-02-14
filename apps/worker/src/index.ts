import { Job, Worker } from 'bullmq';
import { Redis } from 'ioredis';

import { generateCacheKey, generateItineraryWithAI, redis } from '@itinapp/api';
import { prisma as db } from '@itinapp/db';
import { env } from '@itinapp/env';
import { TripJob, TripResponse } from '@itinapp/schemas';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'itinerary-generation',
  async (job: Job<TripJob>) => {
    const { tripId, userId, input } = job.data;

    console.log(`[Worker] Starting job ${job.id} for Trip ${tripId}`);

    // 1. Mark as PROCESSING in Supabase
    await db.trip.update({
      where: { id: tripId },
      data: { status: 'PROCESSING' },
    });

    try {
      const parsedData = await generateItineraryWithAI(input);

      if (!parsedData?.itinerary) throw new Error('AI failed to generate');

      await db.trip.update({
        where: { id: tripId },
        data: {
          destinationLat: parsedData.coordinates.lat,
          destinationLng: parsedData.coordinates.lng,
          itinerary: parsedData.itinerary,
          status: 'COMPLETED',
        },
      });

      const cacheKey = generateCacheKey(input);
      const cachePayload: TripResponse = {
        itinerary: parsedData.itinerary,
        coordinates: {
          lat: parsedData.coordinates.lat,
          lng: parsedData.coordinates.lng,
        },
      };
      await redis.set(cacheKey, JSON.stringify(cachePayload), 'EX', 86400);

      console.log(`[Worker] Job ${job.id} finished successfully.`);
    } catch (error) {
      console.error(`[Worker] Job ${job.id} attempt ${job.attemptsMade + 1} failed`, error);

      if (job.attemptsMade >= 2) {
        await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: { credits: { increment: 1 } },
          }),
          db.trip.update({
            where: { id: tripId },
            data: { status: 'FAILED' },
          }),
        ]);
        console.log(`[Worker] Refunded credit for Trip ${tripId} after max retries.`);
      }

      throw error; // Essential for BullMQ to handle the retry backoff
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n[${signal}] Received. Closing worker and connection...`);
  await worker.close(); // Stop taking new jobs
  await connection.quit(); // Close Redis connection
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
