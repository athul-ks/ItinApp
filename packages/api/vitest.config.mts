import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['vitest.setup.ts', '**/*.test.ts', '**/*.spec.ts', 'dist/**'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
