import { sharedConfig } from "@itinapp/configs/eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...sharedConfig,
  {
    // You can add API-specific overrides here if needed
    ignores: ["dist/**"],
  },
];
