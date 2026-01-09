import { sharedConfig } from '@itinapp/configs/eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...sharedConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
