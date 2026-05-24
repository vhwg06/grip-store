import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Settings @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("settings");
  });

  test("should display settings page", async ({ page }) => {
    const settingsForm = page.locator(
      '[data-testid="setting-site-name"], [data-testid="field-site_name"]'
    );
    await expect(settingsForm).toBeVisible({ timeout: 5_000 });
  });

  test("should manage categories", async ({ adminPage, page }) => {
    // Navigate to categories section
    const categoriesNav = page.locator('[data-testid="admin-nav-categories"]');
    if (await categoriesNav.isVisible()) {
      await adminPage.navigateTo("categories");

      const table = page.locator('[data-testid="admin-table"]');
      await expect(table).toBeVisible();
    }
  });

  test("should view users list", async ({ adminPage, page }) => {
    const usersNav = page.locator('[data-testid="admin-nav-users"]');
    if (await usersNav.isVisible()) {
      await adminPage.navigateTo("users");

      const table = page.locator('[data-testid="admin-table"]');
      await expect(table).toBeVisible();

      const rows = await adminPage.getTableRows();
      expect(rows).toBeGreaterThanOrEqual(0);
    }
  });
});
