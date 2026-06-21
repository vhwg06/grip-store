import { defineConfig, devices, firefox, webkit } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: path.resolve(__dirname, "playwright/.env.test") });

const GO_GRIP_ROOT =
  process.env.GO_GRIP_ROOT ?? path.resolve(__dirname, "../go-grip");

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const GO_BACKEND_URL = process.env.GO_BACKEND_URL ?? "http://127.0.0.1:8080";
const CI_EXTERNAL_BACKEND = process.env.CI_EXTERNAL_BACKEND === "true";
const IS_LOCAL_BACKEND = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  GO_BACKEND_URL,
);
const USE_EXTERNAL_BACKEND = CI_EXTERNAL_BACKEND || !IS_LOCAL_BACKEND;
const FIREFOX_AVAILABLE = fs.existsSync(firefox.executablePath());
const WEBKIT_AVAILABLE = fs.existsSync(webkit.executablePath());

if (!FIREFOX_AVAILABLE) {
  // Keep suite stable in restricted environments where browser binaries cannot be downloaded.
  console.warn(
    "[playwright-config] Firefox project disabled: browser binary not found.",
  );
}

if (!WEBKIT_AVAILABLE) {
  console.warn(
    "[playwright-config] WebKit project disabled: browser binary not found.",
  );
}

const IS_CI = !!process.env.CI;
const IS_CI_OR_ALL_BROWSERS = IS_CI || process.env.ALL_BROWSERS === "true";
let SKIP_SETUP = process.env.PLAYWRIGHT_SKIP_SETUP === "true";

if (!SKIP_SETUP) {
  try {
    const checkFresh = (p: string) => {
      if (!fs.existsSync(p)) return false;
      const c = JSON.parse(fs.readFileSync(p, "utf-8"));
      const exp = (c.cookies || []).find((x: any) => x.name === "grip_store_access_token_expires_at");
      if (!exp) return false;
      return Number(exp.value) > Date.now() + 300_000;
    };
    const adminPath = path.resolve(__dirname, "./playwright/src/fixtures/.auth/admin.json");
    const userPath = path.resolve(__dirname, "./playwright/src/fixtures/.auth/user.json");
    if (checkFresh(adminPath) && checkFresh(userPath)) {
      SKIP_SETUP = true;
      console.log("[playwright-config] Auth states are fresh. Setup project will be skipped.");
    }
  } catch (err) {
    // Ignore error
  }
}

const browserProjects = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: 1600, height: 1200 },
      storageState: "./playwright/src/fixtures/.auth/user.json",
    },
    testIgnore: /specs\/api\/.+\.spec\.ts/,
    dependencies: SKIP_SETUP ? [] : ["setup"],
  },
  ...(IS_CI_OR_ALL_BROWSERS && FIREFOX_AVAILABLE
    ? [
        {
          name: "firefox",
          use: {
            ...devices["Desktop Firefox"],
            storageState: "./playwright/src/fixtures/.auth/user.json",
          },
          testIgnore: /specs\/api\/.+\.spec\.ts/,
          dependencies: SKIP_SETUP ? [] : ["setup"],
        },
      ]
    : []),
  ...(IS_CI_OR_ALL_BROWSERS && WEBKIT_AVAILABLE
    ? [
        {
          name: "webkit",
          use: {
            ...devices["Desktop Safari"],
            storageState: "./playwright/src/fixtures/.auth/user.json",
          },
          testIgnore: /specs\/api\/.+\.spec\.ts/,
          dependencies: SKIP_SETUP ? [] : ["setup"],
        },
      ]
    : []),
  ...(IS_CI_OR_ALL_BROWSERS
    ? [
        {
          name: "mobile-chrome",
          use: {
            ...devices["Pixel 5"],
            storageState: "./playwright/src/fixtures/.auth/user.json",
          },
          testIgnore: /specs\/api\/.+\.spec\.ts/,
          dependencies: SKIP_SETUP ? [] : ["setup"],
        },
      ]
    : []),
];

const TEST_TIMEOUT = process.env.PLAYWRIGHT_TEST_TIMEOUT
  ? parseInt(process.env.PLAYWRIGHT_TEST_TIMEOUT, 10)
  : 30000;

const EXPECT_TIMEOUT = process.env.PLAYWRIGHT_EXPECT_TIMEOUT
  ? parseInt(process.env.PLAYWRIGHT_EXPECT_TIMEOUT, 10)
  : 5000;

const ACTION_TIMEOUT = process.env.PLAYWRIGHT_ACTION_TIMEOUT
  ? parseInt(process.env.PLAYWRIGHT_ACTION_TIMEOUT, 10)
  : 3000;

const NAVIGATION_TIMEOUT = process.env.PLAYWRIGHT_NAVIGATION_TIMEOUT
  ? parseInt(process.env.PLAYWRIGHT_NAVIGATION_TIMEOUT, 10)
  : 8000;

export default defineConfig({
  testDir: "./playwright/specs",
  outputDir: "./playwright/test-results",
  globalSetup: "./playwright/src/fixtures/global-setup.ts",

  /* Maximum time one test can run */
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: EXPECT_TIMEOUT,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      animations: "disabled",
    },
  },

  /* Run tests in files in parallel */
  fullyParallel: process.env.PLAYWRIGHT_FULLY_PARALLEL !== "false",

  /* Maximum number of concurrent worker processes. */
  workers: process.env.PLAYWRIGHT_WORKERS
    ? parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
    : process.env.CI
    ? 2
    : Math.max(2, Math.floor(require("os").cpus().length / 2)),

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
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    trace: IS_CI ? "on-first-retry" : "off",
    screenshot: IS_CI ? "only-on-failure" : "off",
    video: IS_CI ? "retain-on-failure" : "off",
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
      timeout: 5000,
    },

    /* API-only tests — no browser, uses Go backend directly */
    {
      name: "api",
      use: {
        baseURL: GO_BACKEND_URL,
      },
      testMatch: /specs\/api\/.+\.spec\.ts/,
    },

    /* E2E browser tests */
    ...browserProjects,
  ],

  /* Run local dev server before starting the tests */
  webServer: USE_EXTERNAL_BACKEND
    ? [
        {
          command: process.env.PLAYWRIGHT_PROD === "true" ? "npx -y serve out -l 3000" : "npm run dev",
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ]
    : [
        {
          command: `cd ${JSON.stringify(
            GO_GRIP_ROOT,
          )} && docker compose up -d db && set -a && if [ -f .env ]; then . ./.env; else . ./.env.example; fi && set +a && export ADMIN_USERS=\${ADMIN_USERS:-test_admin} && CGO_ENABLED=0 go run -tags migrate ./cmd/app`,
          url: `${GO_BACKEND_URL}/healthz`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: process.env.PLAYWRIGHT_PROD === "true" ? "npx -y serve out -l 3000" : "npm run dev",
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
});
