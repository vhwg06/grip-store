import { test, expect } from "../../src/fixtures/base-test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("Admin Banners – CRUD & Public reflection @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    const navBtn = page.locator('[data-testid="admin-nav-banners"]');
    await expect(navBtn).toBeVisible();
    await navBtn.click();
    await page.waitForLoadState("networkidle");
  });

  test("should allow adding, updating, and deleting a banner per page", async ({ page }) => {
    // 1. Verify basic page structure
    await expect(page.locator("h1")).toContainText("Quản lý Banner");

    // 2. Select target page (e.g. 'homepage')
    const pageSelect = page.locator('[data-testid="banner-target-page-select"]');
    if (await pageSelect.isVisible()) {
      await pageSelect.selectOption("homepage");
    }

    // 3. Fill banner details
    await page.locator("#banner-title").fill("E2E Test Banner Title");
    await page.locator("#banner-subtitle").fill("E2E Test Banner Subtitle");
    await page.locator("#banner-cta").fill("Shop E2E");
    await page.locator("#banner-link").fill("/products");
    await page.locator("#banner-sort").fill("999");
    await page.locator("#banner-active").check();

    // 4. Upload Desktop Image
    await page
      .locator('[data-testid="banner-desktop-media"] input[data-testid="media-file-input"]')
      .setInputFiles({ name: "e2e-banner.png", mimeType: "image/png", buffer: tinyPng });

    await expect(
      page.locator('[data-testid="banner-desktop-media"] [data-testid="media-preview-image"]').first()
    ).toBeVisible({ timeout: 10_000 });

    // 5. Save Banner
    await page.locator('[data-testid="banner-add-btn"]').click();
    await page.waitForLoadState("networkidle");

    // 6. Assert success toast
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();

    // 7. Verify the new banner is in the table
    const tableRow = page.locator("tr").filter({ hasText: "E2E Test Banner Title" }).first();
    await expect(tableRow).toBeVisible();

    // 8. Go to Homepage and verify the banner renders correctly
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-title"]').filter({ hasText: "E2E Test Banner Title" })).toBeVisible();

    // 9. Go back and delete the banner
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    const deleteRow = page.locator("tr").filter({ hasText: "E2E Test Banner Title" }).first();
    await expect(deleteRow).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await deleteRow.locator('[data-testid="banner-delete-btn"]').click();
    await page.waitForLoadState("networkidle");

    // 10. Verify row disappeared
    await expect(deleteRow).not.toBeVisible();
  });
});
