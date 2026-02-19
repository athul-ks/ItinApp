import { createHash } from 'node:crypto';

interface CacheInput {
  destination: string;
  dateRange: {
    from: Date | string;
    to: Date | string;
  };
  budget: string;
  vibe: string;
}

export function generateCacheKey(input: CacheInput): string {
  const fromDate =
    input.dateRange.from instanceof Date
      ? input.dateRange.from.toISOString()
      : input.dateRange.from;

  const toDate =
    input.dateRange.to instanceof Date ? input.dateRange.to.toISOString() : input.dateRange.to;

  const cacheString = `${input.destination.toLowerCase()}|${fromDate}|${toDate}|${input.budget}|${input.vibe}`;
  const hash = createHash('sha256').update(cacheString).digest('hex');
  return `itinerary:${hash}`;
}
