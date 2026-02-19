import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, './empty-stub.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['**/src/**/*.{ts,tsx}'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/src/app/**/layout.tsx',
        '**/src/components/ui/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/src/instrumentation.ts',
        '**/src/instrumentation-client.ts',
        '**/src/lib/destination.ts',
        '**/src/server/auth.ts',
        '**/src/trpc/**',
        '**/src/app/**/not-found.tsx',
        '**/src/app/**/global-error.tsx',
        '**/src/app/providers.tsx',
        '**/src/app/(home)/page.tsx',
        '**/src/app/api/auth/[...nextauth]/route.ts',
        '**/src/app/api/trpc/[trpc]/route.ts',
        '**/src/app/dashboard/page.tsx',
        '**/src/app/plan/page.tsx',
        '**/src/app/plan/upgrade-modal.tsx',
      ],
    },
  },
});
