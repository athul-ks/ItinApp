import { E2E_CONSTANTS, MOCK_TRIP_DATA } from '@itinapp/schemas';

import { prisma } from '../src';

async function main() {
  console.log('🌱 Seeding test data...');

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
      tripData: MOCK_TRIP_DATA,
      status: 'generated',
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
      tripData: MOCK_TRIP_DATA,
      status: 'generated'
    },
  });

  console.log('✅ Test data seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
