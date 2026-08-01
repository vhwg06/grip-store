import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../playwright/.env.test") });

const GO_BACKEND_URL = "https://grip.vn/api";

export default defineConfig({
  testDir: path.resolve(__dirname, "../test/tests"),
  outputDir: path.resolve(__dirname, "../playwright/test-results"),
  globalSetup: path.resolve(__dirname, "../test/support/runtime/fixtures/global-setup.ts"),
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
      testMatch: /test\/tests\/api\/.+\.spec\.ts/,
      use: {
        baseURL: GO_BACKEND_URL,
      },
    },
  ],
});
