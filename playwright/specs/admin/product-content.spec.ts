import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Product Content @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("should keep product media controls available for detail images", async ({ page }) => {
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="product-main-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-gallery-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="field-description"]')).toBeVisible();
  });
});
