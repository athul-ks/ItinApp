import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true, // Delete old dist/ before building
  shims: true, // Enable Shims (Pollyfills require, __dirname, etc.)
  // Inject a real 'require' function at the top of the file
  // This ensures that when Sentry calls require('url'), it works.
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  noExternal: [
    '@itinapp/api',
    '@itinapp/db',
    '@itinapp/env',
    '@itinapp/config',
    '@itinapp/schemas',
  ],
  sourcemap: true, // Good for debugging errors
});
