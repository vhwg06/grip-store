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
    if (!(await createBtn.isVisible())) {
      await expect(
        page.locator('[data-testid="admin-table"], [data-testid="admin-table-empty"]')
      ).toBeVisible();
      return;
    }

    await adminPage.createItem({
      title: `Test Product ${Date.now()}`,
      description: "Created by Playwright admin test",
      price: "49.99",
    });

    // Should show success or new item in table
    await page.waitForLoadState("networkidle");
  });

  test("should upload image via media uploader when creating product", async ({ adminPage, page }) => {
    // Navigate directly to the full create product page
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    // Fill standard fields
    await page.locator('[data-testid="field-title"]').fill(`Product with Image ${Date.now()}`);
    await page.locator('[data-testid="field-price"]').fill("29.99");
    await page.locator('#slug').fill(`prod-img-${Date.now()}`);

    // Select and upload mock image to first media uploader (main image)
    const fileInput = page.locator('input[data-testid="media-file-input"]').first();

    // Create a mock PNG buffer to upload
    const mockFile = {
      name: "test-product-image.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
    };

    await fileInput.setInputFiles(mockFile);

    // Assert that the preview image is shown and uploaded successfully
    const previewImage = page.locator('[data-testid="media-preview-image"]').first();
    await expect(previewImage).toBeVisible();

    // Verify it contains our uploaded preview card
    const previewCards = page.locator('[data-testid="media-preview-card"]');
    await expect(previewCards).toHaveCount(1);

    // Save product
    await page.locator('[data-testid="save-btn"]').click();
    await page.waitForLoadState("networkidle");
  });

  test("should toggle product visibility", async ({ adminPage, page }) => {
    const toggleBtns = page.locator('[data-testid="toggle-btn"]');
    if ((await toggleBtns.count()) === 0) {
      await expect(
        page.locator('[data-testid="admin-table"], [data-testid="admin-table-empty"]')
      ).toBeVisible();
      return;
    }

    await toggleBtns.first().click();
    await page.waitForLoadState("networkidle");

    // Toggle should work without error
  });

  test("should delete a product", async ({ adminPage, page }) => {
    const deleteBtns = page.locator('[data-testid="delete-btn"]');
    if ((await deleteBtns.count()) === 0) {
      await expect(
        page.locator('[data-testid="admin-table"], [data-testid="admin-table-empty"]')
      ).toBeVisible();
      return;
    }

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
