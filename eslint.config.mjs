import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/set-state-in-effect": "off",
      "prefer-const": "off",
    },
  },
  {
    ignores: [
      ".agents/**",
      "playwright/**",
      "playwright-report/**",
      "playwright/reports/**",
      "playwright/test-results/**",
      "coverage/**",
      "dist/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
