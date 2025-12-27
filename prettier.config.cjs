/** @type {import("prettier").Config} */
module.exports = {
  // 1. Standard Prettier Config
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,

  // 2. Plugins (Order matters!)
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss", // MUST be last to work with sorting
  ],

  // 3. Import Sorting Rules
  importOrder: [
    "^react$", // React imports first
    "<THIRD_PARTY_MODULES>", // Installed packages (zod, next, etc)
    "^@itenapp/(.*)$", // Your internal packages
    "^@/(.*)$", // Absolute imports (from tsconfig paths)
    "^[./]", // Relative imports
  ],
  importOrderSeparation: true, // Add space between groups
  importOrderSortSpecifiers: true,
};
