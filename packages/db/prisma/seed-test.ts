/// <reference types="node" />
import { E2E_CONSTANTS, MOCK_TRIP_DATA } from '@itinapp/schemas';

import { prisma } from '../src';

console.log('🌱 Seeding test data...');

try {
  await prisma.user.upsert({
    where: { id: E2E_CONSTANTS.USER_ID },
    update: { email: E2E_CONSTANTS.EMAIL, credits: 100 },
    create: {
      id: E2E_CONSTANTS.USER_ID,
      name: 'E2E Robot',
      email: E2E_CONSTANTS.EMAIL,
      credits: 100,
    },
  });

  await prisma.trip.upsert({
    where: { id: E2E_CONSTANTS.TRIP_ID },
    update: {
      userId: E2E_CONSTANTS.USER_ID,
      destination: 'Paris',
      itinerary: MOCK_TRIP_DATA,
      status: 'COMPLETED',
    },
    create: {
      id: E2E_CONSTANTS.TRIP_ID,
      userId: E2E_CONSTANTS.USER_ID,
      destination: 'Paris',
      destinationLat: 48.8566,
      destinationLng: 2.3522,
      startDate: new Date(),
      endDate: new Date(),
      budget: 'moderate',
      itinerary: MOCK_TRIP_DATA,
      status: 'COMPLETED',
    },
  });

  console.log('✅ Test data seeded!');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
