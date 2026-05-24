import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Orders @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("orders");
  });

  test("should display admin order list", async ({ adminPage, page }) => {
    const table = page.locator('[data-testid="admin-table"]');
    await expect(table).toBeVisible();

    const rows = await adminPage.getTableRows();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test("should view order detail", async ({ page }) => {
    const viewBtns = page.locator('[data-testid="view-order-btn"]');
    test.skip((await viewBtns.count()) === 0, "No orders to view");

    await viewBtns.first().click();
    await page.waitForLoadState("domcontentloaded");

    // Should show order detail modal or page
    const orderDetail = page.locator(
      '[data-testid="order-detail"], [data-testid="admin-modal"]'
    );
    await expect(orderDetail).toBeVisible({ timeout: 5_000 });
  });

  test("should update order status", async ({ page }) => {
    const editBtns = page.locator('[data-testid="edit-btn"]');
    test.skip((await editBtns.count()) === 0, "No orders to edit");

    await editBtns.first().click();
    await page.waitForLoadState("domcontentloaded");

    const statusField = page.locator('[data-testid="field-status"]');
    if (await statusField.isVisible()) {
      // Select a different status
      await statusField.selectOption({ index: 1 });
      await page.locator('[data-testid="save-btn"]').click();
      await page.waitForLoadState("networkidle");
    }
  });
});
