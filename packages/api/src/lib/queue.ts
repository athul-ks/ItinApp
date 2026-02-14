import { Queue } from 'bullmq';

import { redis } from './redis';

export const ITINERARY_QUEUE_NAME = 'itinerary-generation';

export const itineraryQueue = new Queue(ITINERARY_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
      age: 3600,
    },
    removeOnFail: {
      count: 50,
    },
  },
});
