import { defineConfig } from 'vitest/config';

import { sharedExclusions } from '../../coverage-exclusions.js';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [...sharedExclusions],
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
