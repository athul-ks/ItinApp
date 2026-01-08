import turbo from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export const sharedConfig = [
  {
    plugins: {
      turbo: turbo,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
