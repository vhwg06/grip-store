import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Site Config @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("should load settings page and show general config fields", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // General config items should be visible
    await expect(page.locator("h1")).toContainText("Cấu hình cửa hàng");
    await expect(page.locator("#shop-name")).toBeVisible();
    await expect(page.locator("#shop-desc")).toBeVisible();
    await expect(page.locator("#shop-logo")).toBeVisible();
  });
});
