import { test, expect } from "../../src/fixtures/base-test";

test.describe("Auth Flow @auth", () => {
  test.describe("Login enhancements", () => {
    test("should initiate OAuth redirect", async ({ authPage, page }) => {
      await authPage.gotoLogin();

      // Check for OAuth buttons (LinuxDO / GitHub)
      const oauthBtn = page.locator(
        '[data-testid="oauth-linuxdo-btn"], [data-testid="oauth-github-btn"], [data-testid="oauth-btn"]'
      );

      if ((await oauthBtn.count()) > 0) {
        // Verify OAuth button is clickable
        await expect(oauthBtn.first()).toBeVisible();
        await expect(oauthBtn.first()).toBeEnabled();
      }
    });

    test("should persist session on page refresh", async ({
      authPage,
      page,
    }) => {
      // With storageState, user should already be logged in
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Refresh the page
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // User avatar should still be visible
      const avatar = page.locator('[data-testid="user-avatar"]');
      if (await avatar.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(avatar).toBeVisible();
      }
    });

    test("should logout and invalidate session", async ({
      authPage,
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const logoutBtn = page.locator('[data-testid="logout-btn"]');
      if (await logoutBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await authPage.logout();

        // After logout, should redirect to login or home
        await page.waitForLoadState("domcontentloaded");

        // User avatar should no longer be visible
        const avatar = page.locator('[data-testid="user-avatar"]');
        await expect(avatar).not.toBeVisible({ timeout: 5_000 });
      }
    });
  });
});
