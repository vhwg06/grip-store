import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Site Config @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("should load settings page and show general config fields", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Store Settings" })).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-brand"]')).toBeVisible();
    await expect(page.locator("#shop-name")).toBeVisible();
    await expect(page.locator('[data-testid="settings-brand-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-brand-logo-open-media-picker"]')).toBeVisible();
  });
});
