import { prisma as db } from '@itinapp/db';

import { itineraryQueue } from '../src/lib/queue';

console.log('🔍 Initializing Smoke Test...');

const mockUserId = 'e2e-test-user-id';
const testDestination = `Tokyo-Test-${Date.now()}`;

try {
  console.log(`1: Creating dummy trip in Database for ${testDestination}...`);

  const trip = await db.trip.create({
    data: {
      userId: mockUserId,
      destination: testDestination,
      destinationLat: 0,
      destinationLng: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      budget: 'moderate',
      itinerary: [],
      status: 'PENDING',
    },
  });

  console.log(`✅ Trip created with ID: ${trip.id}`);
  console.log('2: Pushing job to BullMQ...');

  await itineraryQueue.add('generate-itinerary', {
    tripId: trip.id,
    userId: mockUserId,
    input: {
      destination: testDestination,
      dateRange: {
        from: trip.startDate.toISOString(), // Simulating JSON serialization
        to: trip.endDate.toISOString(),
      },
      budget: 'moderate',
      vibe: 'balanced',
    },
  });

  console.log('🚀 Job pushed successfully!');

  const client = await itineraryQueue.client;
  await client.quit();
  process.exit(0);
} catch (err) {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
}
