import { test, expect } from "../../src/fixtures/base-test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("Admin Media Library @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    // Navigate to /admin/media
    await page.goto("/admin/media", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  test("should display uploaded media assets and support upload operations", async ({ page }) => {
    await expect(page.locator('[data-testid="admin-media-library"]')).toBeVisible();

    // 1. Upload a valid image
    await page.locator('input[data-testid="media-file-input"]').first().setInputFiles({
      name: "library-test.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Wait for the upload card to appear
    const card = page.locator('[data-testid="media-asset-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    // 2. Reject files larger than 5MB or invalid formats client-side
    // Let's create a large buffer to simulate a file over 5MB (e.g. 5.1MB)
    const largeBuffer = Buffer.alloc(5.1 * 1024 * 1024);
    await page.locator('input[data-testid="media-file-input"]').first().setInputFiles({
      name: "oversized.png",
      mimeType: "image/png",
      buffer: largeBuffer,
    });
    // Should show error notification
    await expect(page.locator(".toast-error, [data-type='error'], [role='status']").first()).toBeVisible();
  });

  test("should open media picker from various forms and select an item", async ({ page }) => {
    // Open admin settings to check logo picker
    await page.goto("/admin/settings", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const openPickerBtn = page.locator('[data-testid="settings-brand-logo-open-media-picker"]');
    await expect(openPickerBtn).toBeVisible();
    await openPickerBtn.click();

    // Picker modal should show up
    await expect(page.locator('[data-testid="media-picker-modal"]')).toBeVisible();
    const firstItem = page.locator('[data-testid="media-picker-item"]').first();
    await expect(firstItem).toBeVisible();
    await firstItem.click();

    const confirmBtn = page.locator('[data-testid="media-picker-confirm"]');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Modal should close
    await expect(page.locator('[data-testid="media-picker-modal"]')).not.toBeVisible();
  });
});
