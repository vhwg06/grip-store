import { test, expect } from "../../src/fixtures/base-test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("Admin Media Management @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("should show banner management link in admin sidebar nav", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Desktop sidebar should have the banner link (data-testid only set on desktop)
    await expect(page.locator('[data-testid="admin-nav-banners"]')).toBeVisible();
    await page.locator('[data-testid="admin-nav-banners"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/admin\/banners/);
  });

  test("should load banners page and show banner table", async ({ page }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // The page heading should exist
    await expect(page.locator('h1').filter({ hasText: /banner/i }).first()).toBeVisible();
    // The add form card should be visible
    await expect(page.locator('[data-testid="banner-desktop-media"]')).toBeVisible();
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

  test("should support full flow: add banner with image -> display on homepage -> delete banner", async ({ page }) => {
    // Forward browser console logs to Node console
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // 1. Go to Admin Banners page
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // 2. Fill in the new banner details
    await page.locator("#banner-title").fill("E2E Test Banner Title");
    await page.locator("#banner-subtitle").fill("E2E Test Banner Subtitle");
    await page.locator("#banner-cta").fill("Shop E2E");
    await page.locator("#banner-link").fill("/products");
    await page.locator("#banner-sort").fill("999");

    // 3. Upload banner image
    await page.locator('[data-testid="banner-desktop-media"] input[data-testid="media-file-input"]').setInputFiles({
      name: "e2e-banner.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });

    // Wait for upload success indicator/preview
    await expect(page.locator('[data-testid="banner-desktop-media"] [data-testid="media-preview-image"]').first()).toBeVisible();

    // 4. Click Add/Save banner button
    const postPromise = page.waitForResponse(response =>
      response.url().includes("/v1/admin/banners") && response.request().method() === "POST"
    );
    await page.locator('[data-testid="banner-add-btn"]').click();
    const postResponse = await postPromise;
    expect(postResponse.status()).toBe(200);

    // Wait for the new banner row to be visible in the table
    const tableRow = page.locator("tr").filter({
      has: page.locator('input[value="E2E Test Banner Title"]')
    });
    await expect(tableRow).toBeVisible();

    // 5. Navigate to public Homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 6. Verify that the banner is rendered on the homepage
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-title"]', { hasText: "E2E Test Banner Title" }).first()).toBeVisible();

    // Verify that the banner image is displayed and has the correct src
    const bannerImage = page.locator('img[alt="E2E Test Banner Title"]').first();
    await expect(bannerImage).toBeVisible();
    const src = await bannerImage.getAttribute("src");
    expect(src).toBeTruthy();
    expect(decodeURIComponent(src!)).toContain("/static/uploads/");

    // 7. Cleanup: Go back to Admin Banners and delete it
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // Register dialog handler to automatically accept confirm delete dialog
    page.once("dialog", dialog => dialog.accept());
    
    // Click the delete button on the row
    const deleteRow = page.locator("tr").filter({
      has: page.locator('input[value="E2E Test Banner Title"]')
    });
    const deletePromise = page.waitForResponse(response =>
      response.url().includes("/v1/admin/banners/") && response.request().method() === "DELETE"
    );
    await deleteRow.locator('[data-testid="banner-delete-btn"]').click();
    const deleteResponse = await deletePromise;
    expect(deleteResponse.status()).toBe(200);

    // Verify row disappears
    await expect(deleteRow).not.toBeVisible();
  });
});
