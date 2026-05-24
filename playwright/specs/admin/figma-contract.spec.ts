import { test, expect } from "../../src/fixtures/base-test";

/**
 * Figma Trace:
 * - Admin management patterns aligned from nodes: 62:2672, 58:861
 * Requirement: admin nav/table/actions contract.
 */
test.describe("Figma Contract Admin @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("admin should expose navigation contract", async ({ adminPage, page }) => {
    await adminPage.goto();
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-settings"]')).toBeVisible();
  });

  test("products admin route should expose table + actions", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("products");
    await expect(page.locator('[data-testid="admin-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-btn"]')).toBeVisible();

    const firstRow = page.locator('[data-item-id]').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('[data-testid="toggle-btn"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="edit-btn"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="delete-btn"]')).toBeVisible();
  });
});
