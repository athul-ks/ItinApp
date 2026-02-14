import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '@itinapp/env';

import { PrismaClient } from './generated/prisma/client';

const connectionString = env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Simple, Classic Initialization
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from './generated/prisma/client';
