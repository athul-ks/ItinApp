import { prisma } from '../src';

console.log('🌱 Starting seed...');

try {
  // 1. Transactional Cleanup (Order matters for Foreign Keys!)
  console.log('🧹 Cleaning up database...');
  await prisma.$transaction([
    prisma.trip.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // 2. Upsert Test User (Safe for repeated runs)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {}, // If user exists, do nothing
    create: {
      email: 'test@example.com',
      name: 'Test Traveler',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      credits: 100,
    },
  });
  console.log(`👤 Verified user: ${user.email}`);

  // 3. Create a Trip with embedded JSON data
  const mockItinerary = {
    tripName: 'Tokyo Exploration',
    days: [
      {
        day: 1,
        theme: 'Historical Tokyo',
        activities: [
          {
            name: 'Senso-ji Temple',
            description: 'Ancient Buddhist temple located in Asakusa.',
            location: 'Asakusa, Tokyo',
            startTime: '09:00',
            endTime: '11:00',
          },
          {
            name: 'Lunch at Sushi Dai',
            description: 'Famous sushi spot near the market.',
            location: 'Toyosu Market',
            startTime: '12:00',
            endTime: '13:30',
          },
          {
            name: 'Tokyo Skytree',
            description: 'The tallest tower in Japan offering panoramic views.',
            location: 'Sumida',
            startTime: '15:00',
            endTime: '17:00',
          },
        ],
      },
      {
        day: 2,
        theme: 'Modern Culture',
        activities: [
          {
            name: 'Shibuya Crossing',
            description: "The world's busiest pedestrian crossing.",
            location: 'Shibuya',
            startTime: '10:00',
            endTime: '12:00',
          },
        ],
      },
    ],
  };

  // 4. Create Trip
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      destination: 'Tokyo, Japan',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-05'),
      budget: 'Medium',
      status: 'COMPLETED',
      itinerary: mockItinerary,
    },
  });
  console.log(`✈️ Created trip to: ${trip.destination}`);

  console.log('✅ Seeding finished.');
} catch (e) {
  console.error('❌ Seed failed:', e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
