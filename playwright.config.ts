import { defineConfig, devices, firefox, webkit } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: path.resolve(__dirname, "playwright/.env.test") });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const GO_BACKEND_URL = process.env.GO_BACKEND_URL ?? "http://localhost:8080";
const FIREFOX_AVAILABLE = fs.existsSync(firefox.executablePath());
const WEBKIT_AVAILABLE = fs.existsSync(webkit.executablePath());

if (!FIREFOX_AVAILABLE) {
  // Keep suite stable in restricted environments where browser binaries cannot be downloaded.
  console.warn(
    "[playwright-config] Firefox project disabled: browser binary not found."
  );
}

if (!WEBKIT_AVAILABLE) {
  console.warn(
    "[playwright-config] WebKit project disabled: browser binary not found."
  );
}

const browserProjects = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "./playwright/src/fixtures/.auth/user.json",
    },
    testIgnore: /specs\/api\/.+\.spec\.ts/,
    dependencies: ["setup"],
  },
  ...(FIREFOX_AVAILABLE
    ? [
        {
          name: "firefox",
          use: {
            ...devices["Desktop Firefox"],
            storageState: "./playwright/src/fixtures/.auth/user.json",
          },
          testIgnore: /specs\/api\/.+\.spec\.ts/,
          dependencies: ["setup"],
        },
      ]
    : []),
  ...(WEBKIT_AVAILABLE
    ? [
        {
          name: "webkit",
          use: {
            ...devices["Desktop Safari"],
            storageState: "./playwright/src/fixtures/.auth/user.json",
          },
          testIgnore: /specs\/api\/.+\.spec\.ts/,
          dependencies: ["setup"],
        },
      ]
    : []),
  {
    name: "mobile-chrome",
    use: {
      ...devices["Pixel 5"],
      storageState: "./playwright/src/fixtures/.auth/user.json",
    },
    testIgnore: /specs\/api\/.+\.spec\.ts/,
    dependencies: ["setup"],
  },
];

export default defineConfig({
  testDir: "./playwright/specs",
  outputDir: "./playwright/test-results",
  globalSetup: "./playwright/src/fixtures/global-setup.ts",

  /* Maximum time one test can run */
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      animations: "disabled",
    },
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Reporter */
  reporter: process.env.CI
    ? [["html", { outputFolder: "./playwright/reports" }], ["github"]]
    : [["html", { outputFolder: "./playwright/reports", open: "never" }]],

  /* Shared settings for all the projects below */
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    extraHTTPHeaders: {
      "X-Playwright-Test": "true",
    },
  },


  projects: [
    /* Global setup — authenticates test users, saves storageState */
    {
      name: "setup",
      testDir: "./playwright/src/fixtures",
      testMatch: /auth\.setup\.ts/,
    },

    /* API-only tests — no browser, uses Go backend directly */
    {
      name: "api",
      use: {
        baseURL: GO_BACKEND_URL,
      },
      testMatch: /specs\/api\/.+\.spec\.ts/,
      dependencies: ["setup"],
    },

    /* E2E browser tests */
    ...browserProjects,
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
