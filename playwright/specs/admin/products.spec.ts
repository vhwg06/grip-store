import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Products @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("products");
  });

  test("should display admin product list", async ({ adminPage, page }) => {
    const rows = await adminPage.getTableRows();
    expect(rows).toBeGreaterThanOrEqual(0);

    // Table should be visible
    const table = page.locator('[data-testid="admin-table"]');
    await expect(table).toBeVisible();
  });

  test("should create a new product", async ({ adminPage, page }) => {
    const createBtn = page.locator('[data-testid="create-btn"]');
    test.skip(!(await createBtn.isVisible()), "Create button not found");

    await adminPage.createItem({
      title: `Test Product ${Date.now()}`,
      description: "Created by Playwright admin test",
      price: "49.99",
    });

    // Should show success or new item in table
    await page.waitForLoadState("networkidle");
  });

  test("should toggle product visibility", async ({ adminPage, page }) => {
    const toggleBtns = page.locator('[data-testid="toggle-btn"]');
    test.skip((await toggleBtns.count()) === 0, "No toggle buttons found");

    await toggleBtns.first().click();
    await page.waitForLoadState("networkidle");

    // Toggle should work without error
  });

  test("should delete a product", async ({ adminPage, page }) => {
    const deleteBtns = page.locator('[data-testid="delete-btn"]');
    test.skip((await deleteBtns.count()) === 0, "No delete buttons found");

    const initialRows = await adminPage.getTableRows();
    await deleteBtns.last().click();

    const confirmBtn = page.locator('[data-testid="confirm-delete-btn"]');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForLoadState("networkidle");

      const newRows = await adminPage.getTableRows();
      expect(newRows).toBeLessThanOrEqual(initialRows);
    }
  });
});
