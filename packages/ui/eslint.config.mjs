import { sharedConfig } from "@itenapp/configs/eslint.config.mjs";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // 1. Setup global language options (like browser/node env)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // 2. Import your base config
  ...sharedConfig,

  // 3. Setup TypeScript Parser explicitly
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Shadcn often uses spreading props like <button {...props} />
      "react/jsx-props-no-spreading": "off",

      // Shadcn components sometimes define unused variables (like `cn`)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Fix for "React is defined but never used" if using new JSX transform
      "react/react-in-jsx-scope": "off",
    },
  },
];
