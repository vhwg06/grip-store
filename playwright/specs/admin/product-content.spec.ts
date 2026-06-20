import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Product Content @admin P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-PROD-05 opens a product-linked card flow from product context", async ({ page }) => {
    // GOAL: Admin Manages Product-Linked Cards: quản lý card hoặc inventory-like artifact gắn với một product.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-05 Main flow
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="admin-nav-cards"]')).toBeVisible();
    await page.locator('[data-testid="admin-nav-cards"]').click();
    await expect(page).toHaveURL(/\/admin\/cards/);
    await expect(page.getByRole("heading", { name: /cards/i })).toBeVisible();
  });
});
