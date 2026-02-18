import { Job, Worker } from 'bullmq';
import { Redis } from 'ioredis';

import {
  generateCacheKey,
  generateItineraryWithAI,
  logger,
  normalizeError,
  redis,
} from '@itinapp/api';
import { prisma as db } from '@itinapp/db';
import { env } from '@itinapp/env';
import { TripJob, TripResponse } from '@itinapp/schemas';

import { startHeartbeat } from './heartbeat';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'itinerary-generation',
  async (job: Job<TripJob>) => {
    const { tripId, userId, input } = job.data;
    logger.info('Worker picked up job', { jobId: job.id, tripId });

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

      logger.info('Worker completed job', { jobId: job.id, tripId });
    } catch (err) {
      logger.error('Worker failed job', {
        jobId: job.id,
        tripId,
        attempt: job.attemptsMade + 1,
        ...normalizeError(err),
      });

      const maxRetries = job.opts.attempts || 1;
      if (job.attemptsMade >= maxRetries - 1) {
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
        logger.info(`Worker refunded credit after max retries.`, { tripId, userId });
      }

      throw err; // Essential for BullMQ to handle the retry backoff
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  logger.info(`Job completed successfully.`, { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error(`Job failed after all retries.`, {
    jobId: job?.id,
    ...normalizeError(err),
  });
});

startHeartbeat();

const gracefulShutdown = async (signal: string) => {
  logger.info(`Worker shutting down gracefully...`, { signal });
  await worker.close(); // Stop taking new jobs
  await connection.quit(); // Close Redis connection
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
