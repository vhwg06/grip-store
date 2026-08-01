import { defineConfig } from "@playwright/test";
import path from "node:path";

const moduleRoot = path.resolve(__dirname, "modules");

// Cucumber owns execution. This config only supplies shared Playwright
// defaults for the browser/API adapters; module-native spec files are not
// part of the repository.
export default defineConfig({
  testDir: moduleRoot,
  fullyParallel: false,
  testMatch: [],
  use: { baseURL: process.env.TEST_API_BASE_URL },
});
