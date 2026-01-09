import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

import { sharedConfig } from '@itinapp/configs/eslint.config.mjs';

const sharedConfigWithoutTsPlugin = sharedConfig.map((config) => {
  if (config.plugins && config.plugins['@typescript-eslint']) {
    const { '@typescript-eslint': _, ...otherPlugins } = config.plugins;
    return {
      ...config,
      plugins: otherPlugins,
    };
  }
  return config;
});

const eslintConfig = defineConfig([
  nextVitals,
  nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  ...sharedConfigWithoutTsPlugin,
]);

export default eslintConfig;
