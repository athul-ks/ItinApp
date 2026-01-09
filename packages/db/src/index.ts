import { env } from '@itinapp/env';

import { PrismaClient } from './generated/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Simple, Classic Initialization
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from './generated/client';
