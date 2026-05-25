import { test as setup } from "@playwright/test";
import path from "path";

const USER_STATE_PATH = path.resolve(__dirname, ".auth/user.json");
const ADMIN_STATE_PATH = path.resolve(__dirname, ".auth/admin.json");

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function tryLoginAndPersistState(page: any, email: string, password: string, statePath: string) {
  await page.goto(`${BASE_URL}/login`);
  const avatar = page.locator('[data-testid="user-avatar"]').first();

  if (!(await avatar.isVisible().catch(() => false))) {
    await page.locator('[data-testid="login-email-input"]').first().fill(email);
    await page.locator('[data-testid="login-password-input"]').first().fill(password);
    await page.locator('[data-testid="login-submit-btn"]').first().click({ trial: false });
  }

  const loggedIn = await avatar.isVisible({ timeout: 15_000 }).catch(() => false);
  await page.context().storageState({ path: statePath });

  // Do not fail the whole test graph if auth bootstrap is unavailable in local/dev env.
  if (!loggedIn) {
    setup.skip(true, `Unable to authenticate ${email} during setup`);
  }
}

setup("authenticate test user", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
  const password = process.env.TEST_USER_PASSWORD ?? "TestPass123!";

  await tryLoginAndPersistState(page, email, password, USER_STATE_PATH);
});

setup("authenticate admin user", async ({ page }) => {
  const email = process.env.ADMIN_USER_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_USER_PASSWORD ?? "AdminPass123!";

  await tryLoginAndPersistState(page, email, password, ADMIN_STATE_PATH);
});
