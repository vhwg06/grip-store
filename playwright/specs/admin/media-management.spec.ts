import { test, expect } from "../../src/fixtures/base-test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("Admin Media Management @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("should expose media library navigation and upload/select contract", async ({ page }) => {
    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="admin-media-library"]')).toBeVisible();
    await expect(page.locator('[data-testid="media-dropzone"]').first()).toBeVisible();

    await page.locator('input[data-testid="media-file-input"]').first().setInputFiles({
      name: "admin-media-library.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });

    await expect(page.locator('[data-testid="media-preview-image"]').first()).toBeVisible();
  });

  test("should use media picker for homepage banners", async ({ page }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="banner-desktop-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="banner-mobile-media"]')).toBeVisible();

    await page.locator('[data-testid="banner-desktop-media"] input[data-testid="media-file-input"]').setInputFiles({
      name: "homepage-banner.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });

    await expect(page.locator('[data-testid="banner-desktop-media"] [data-testid="media-preview-image"]').first()).toBeVisible();
  });

  test("should use media picker for article featured image", async ({ page }) => {
    await page.goto("/admin/article/new");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="article-featured-media"]')).toBeVisible();
    await page.locator('[data-testid="article-featured-media"] input[data-testid="media-file-input"]').setInputFiles({
      name: "article-featured.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });

    await expect(page.locator('[data-testid="article-featured-media"] [data-testid="media-preview-image"]').first()).toBeVisible();
  });

  test("should keep product media controls available for detail images", async ({ page }) => {
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="product-main-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-gallery-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="field-description"]')).toBeVisible();
  });
});
