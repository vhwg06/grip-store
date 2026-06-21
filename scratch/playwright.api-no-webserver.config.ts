import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../playwright/.env.test") });

const GO_BACKEND_URL = process.env.GO_BACKEND_URL ?? "http://127.0.0.1:8080";

export default defineConfig({
  testDir: path.resolve(__dirname, "../playwright/specs"),
  outputDir: path.resolve(__dirname, "../playwright/test-results"),
  globalSetup: path.resolve(__dirname, "../playwright/src/fixtures/global-setup.ts"),
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: GO_BACKEND_URL,
    extraHTTPHeaders: {
      "X-Playwright-Test": "true",
    },
  },
  projects: [
    {
      name: "api",
      testMatch: /specs\/api\/.+\.spec\.ts/,
      use: {
        baseURL: GO_BACKEND_URL,
      },
    },
  ],
});
