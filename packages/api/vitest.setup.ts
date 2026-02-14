// Global mocks

vi.mock('ioredis', () => {
  const RedisMock = vi.fn();

  RedisMock.prototype.get = vi.fn().mockResolvedValue(null);
  RedisMock.prototype.set = vi.fn().mockResolvedValue('OK');
  RedisMock.prototype.del = vi.fn().mockResolvedValue(1);
  RedisMock.prototype.on = vi.fn();
  RedisMock.prototype.quit = vi.fn();
  RedisMock.prototype.disconnect = vi.fn();
  // Important: BullMQ often checks strictly for status properties
  RedisMock.prototype.status = 'ready';

  return {
    // Handle "import Redis from 'ioredis'"
    default: RedisMock,
    // Handle "import { Redis } from 'ioredis'"
    Redis: RedisMock,
  };
});

vi.mock('bullmq', () => {
  const QueueMock = vi.fn();
  QueueMock.prototype.add = vi.fn();
  QueueMock.prototype.on = vi.fn();
  QueueMock.prototype.close = vi.fn();

  const WorkerMock = vi.fn();
  WorkerMock.prototype.on = vi.fn();
  WorkerMock.prototype.close = vi.fn();
  WorkerMock.prototype.run = vi.fn();

  return {
    Queue: QueueMock,
    Worker: WorkerMock,
  };
});

// Populate process.env with dummy values so the @itinapp/env package is happy
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test-db';
process.env.OPENAI_API_KEY = 'mock-openai-key';
process.env.UNSPLASH_ACCESS_KEY = 'mock-unsplash-key';
process.env.NEXTAUTH_SECRET = 'mock-nextauth-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'mock-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'mock-google-secret';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'mock-google-maps-key';
process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/mock-webhook-url';
process.env.REDIS_URL = 'redis://localhost:6379';

// Optional: specific global mocks if needed later
