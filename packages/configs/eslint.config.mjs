import turbo from "eslint-plugin-turbo";

export const sharedConfig = [
  {
    plugins: {
      turbo: turbo,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "no-console": "warn",
    },
  },
];
