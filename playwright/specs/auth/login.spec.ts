import { test, expect } from "../../src/fixtures/base-test";

test.describe("Login flow", () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.gotoLogin();
  });

  test("should log in with valid credentials", async ({ authPage, page }) => {
    await authPage.login(
      process.env.TEST_USER_EMAIL ?? "test@example.com",
      process.env.TEST_USER_PASSWORD ?? "Password123!"
    );

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(
      page.locator(
        '[data-testid="user-avatar"], [data-testid="profile-link"], [data-testid="logout-btn"]'
      )
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should show error with invalid credentials", async ({ authPage }) => {
    await authPage.login("wrong@example.com", "BadPassword!");

    await expect(authPage.getErrorMessage()).toBeVisible();
    await expect(authPage.getErrorMessage()).toContainText(/invalid|incorrect/i);
  });

  test("should show validation error for empty fields", async ({
    authPage,
    page,
  }) => {
    await authPage.login("", "");

    // The submit button click with empty fields should not navigate away
    await expect(page).toHaveURL(/\/login/);
  });
});
