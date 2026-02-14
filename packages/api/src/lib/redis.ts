import { Redis } from 'ioredis';

import { env } from '@itinapp/env';

const isSecure = env.REDIS_URL.startsWith('rediss://');

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Mandatory for BullMQ
  tls: isSecure ? { rejectUnauthorized: false } : undefined, // TLS for Production
});
