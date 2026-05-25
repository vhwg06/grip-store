import { test as setup, expect } from "@playwright/test";
import path from "path";

const USER_STATE_PATH = path.resolve(__dirname, ".auth/user.json");
const ADMIN_STATE_PATH = path.resolve(__dirname, ".auth/admin.json");

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

setup("authenticate test user", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
  const password = process.env.TEST_USER_PASSWORD ?? "TestPass123!";

  await page.goto(`${BASE_URL}/login`);
  const avatar = page.locator('[data-testid="user-avatar"]').first();
  if (!(await avatar.isVisible())) {
    await page.locator('[data-testid="login-email-input"]').first().fill(email);
    await page.locator('[data-testid="login-password-input"]').first().fill(password);
    await page.locator('[data-testid="login-submit-btn"]').first().click({ trial: false });
  }

  // Wait for successful login
  await expect(avatar).toBeVisible({
    timeout: 15_000,
  });

  await page.context().storageState({ path: USER_STATE_PATH });
});

setup("authenticate admin user", async ({ page }) => {
  const email = process.env.ADMIN_USER_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_USER_PASSWORD ?? "AdminPass123!";

  await page.goto(`${BASE_URL}/login`);
  const avatar = page.locator('[data-testid="user-avatar"]').first();
  if (!(await avatar.isVisible())) {
    await page.locator('[data-testid="login-email-input"]').first().fill(email);
    await page.locator('[data-testid="login-password-input"]').first().fill(password);
    await page.locator('[data-testid="login-submit-btn"]').first().click({ trial: false });
  }

  // Wait for successful login
  await expect(avatar).toBeVisible({
    timeout: 15_000,
  });

  await page.context().storageState({ path: ADMIN_STATE_PATH });
});
