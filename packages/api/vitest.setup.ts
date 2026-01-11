// Populate process.env with dummy values so the @itinapp/env package is happy
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test-db';
process.env.OPENAI_API_KEY = 'mock-openai-key';
process.env.UNSPLASH_ACCESS_KEY = 'mock-unsplash-key';
process.env.NEXTAUTH_SECRET = 'mock-nextauth-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'mock-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'mock-google-secret';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'mock-google-maps-key';
process.env.DISCORD_WEBHOOK_URL = 'mock-discord-webhook-url';

// Optional: specific global mocks if needed later
