import { test, expect } from "../../src/fixtures/base-test";

test.describe("Login flow", () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.gotoLogin();
  });

  test("should log in with valid credentials", async ({ authPage }) => {
    await authPage.login("test@example.com", "Password123!");

    await expect(authPage.getUserAvatar()).toBeVisible({ timeout: 10_000 });
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
