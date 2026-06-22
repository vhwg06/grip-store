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
    await expect(page.getByRole("heading", { name: "Store Settings" })).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-brand"]')).toBeVisible();
    await expect(page.locator("#shop-name")).toBeVisible();
  });

  test("should manage categories", async ({ adminPage, page }) => {
    // Navigate to categories section
    const categoriesNav = page.locator('[data-testid="admin-nav-categories"]');
    if (await categoriesNav.isVisible()) {
      await adminPage.navigateTo("categories");
      await expect(page.getByRole("heading", { name: "Category Management" })).toBeVisible();
    }
  });

  test("should view users list", async ({ adminPage, page }) => {
    const usersNav = page.locator('[data-testid="admin-nav-users"]');
    if (await usersNav.isVisible()) {
      await adminPage.navigateTo("users");
      await expect(page.locator('[data-testid="user-management-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="account-actions-panel"]')).toBeVisible();
    }
  });
});
