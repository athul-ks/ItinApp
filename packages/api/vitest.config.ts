import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'vitest.setup.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'dist/**',
        'scripts/smoke-test-worker.ts',
      ],
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
