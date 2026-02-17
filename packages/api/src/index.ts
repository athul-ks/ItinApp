/// <reference path="./types.d.ts" />

// Export the router and type for the client to use
export { appRouter, createCaller, type AppRouter } from './root';

// Export the context creator for the Next.js API route to use
export { createTRPCContext } from './trpc';

export { generateCacheKey } from './lib/cache-key';
export { redis } from './lib/redis';
export * from './logger';
export { generateItineraryWithAI } from './services/ai-itinerary';
