import { test as setup, expect } from "@playwright/test";
import path from "path";

const USER_STATE_PATH = path.resolve(__dirname, ".auth/user.json");
const ADMIN_STATE_PATH = path.resolve(__dirname, ".auth/admin.json");

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

setup("authenticate test user", async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error('[Browser Page Error]', err));

  const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
  const password = process.env.TEST_USER_PASSWORD ?? "TestPass123!";

  await page.goto(`${BASE_URL}/login`);
  await page.locator('[data-testid="login-email-input"]').fill(email);
  await page.locator('[data-testid="login-password-input"]').fill(password);
  await page.locator('[data-testid="login-submit-btn"]').click();

  // Wait for successful login
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible({
    timeout: 15_000,
  });

  await page.context().storageState({ path: USER_STATE_PATH });
});

setup("authenticate admin user", async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error('[Browser Page Error]', err));

  const email = process.env.ADMIN_USER_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_USER_PASSWORD ?? "AdminPass123!";

  await page.goto(`${BASE_URL}/login`);
  await page.locator('[data-testid="login-email-input"]').fill(email);
  await page.locator('[data-testid="login-password-input"]').fill(password);
  await page.locator('[data-testid="login-submit-btn"]').click();

  // Wait for successful login
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible({
    timeout: 15_000,
  });

  await page.context().storageState({ path: ADMIN_STATE_PATH });
});
