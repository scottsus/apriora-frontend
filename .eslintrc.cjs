/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "drizzle"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  rules: {
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/consistent-type-import": "off",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-base-to-string": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/non-nullable-type-assertion-style": "off",
    "@typescript-eslint/prefer-promise-reject-errors": "off",
    "drizzle/enforce-delete-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
  },
};
module.exports = config;
