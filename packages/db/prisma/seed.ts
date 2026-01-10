// Load Environment Variables explicitly
// We must do this before importing anything that relies on them
// Loads .env from the monorepo root
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '../../.env' });

// Instantiate a local client for seeding
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Cleanup existing data
  await prisma.trip.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create a Test User
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test Traveler',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      credits: 100,
    },
  });
  console.log(`👤 Created user: ${user.email}`);

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

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      destination: 'Tokyo, Japan',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-05'),
      budget: 'Medium',
      status: 'generated',
      tripData: mockItinerary,
    },
  });
  console.log(`✈️ Created trip to: ${trip.destination}`);

  console.log('✅ Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
