import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

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
    await page.goto("/admin/banners", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  test("should allow adding, updating storefront visibility, and deleting a banner", async ({ page, request }) => {
    const adminToken = await getAdminToken(request);
    const settingsResp = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(settingsResp.ok()).toBeTruthy();
    const current = await settingsResp.json();
    const config = current?.data?.config ?? current?.config ?? {};
    const originalPresence = config.bannerPresence ?? { enabled: true, present: true };
    const originalHomepage = config.homepage ?? {};

    const bannerTitle = `E2E Test Banner Title ${Date.now()}`;

    try {
      await expect(page.locator("h1")).toContainText(/Banner Management|Quản lý Banner/);
      await expect(page.locator('[data-testid="banner-presence-controls"]')).toBeVisible();

      const pageSelect = page.locator('[data-testid="banner-target-page-select"]');
      await pageSelect.selectOption("homepage");

      await page.locator("#banner-title").fill(bannerTitle);
      await page.locator("#banner-subtitle").fill("E2E Test Banner Subtitle");
      await page.locator("#banner-cta").fill("Shop E2E");
      await page.locator("#banner-link").fill("/products");
      await page.locator("#banner-sort").fill("999");
      await page.locator("#banner-active").check();

      await page
        .locator('[data-testid="banner-desktop-media"] input[data-testid="media-file-input"]')
        .setInputFiles({ name: "e2e-banner.png", mimeType: "image/png", buffer: tinyPng });

      await expect(
        page.locator('[data-testid="banner-desktop-media"] [data-testid="media-preview-image"]').first()
      ).toBeVisible({ timeout: 10_000 });

      await page.locator('[data-testid="banner-add-btn"]').click();
      await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();

      const tableRow = page.locator('[data-testid="banner-item"]').filter({ hasText: bannerTitle }).first();
      await expect(tableRow).toBeVisible();

      const presenceToggle = page.locator('[data-testid="banner-presence-toggle"]');
      if (await presenceToggle.isChecked()) {
        await presenceToggle.uncheck();
      }
      await page.locator('[data-testid="banner-presence-save"]').click();
      await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();

      await page.goto("/", { timeout: 10000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 });
      await expect(page.locator('[data-testid="homepage-banner"]')).toHaveCount(0);

      await page.goto("/products", { timeout: 10000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 });
      await expect(page.locator('[data-testid="products-hero-banner"]')).toHaveCount(0);

      await page.goto("/admin/banners", { timeout: 10000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      if (!(await presenceToggle.isChecked())) {
        await presenceToggle.check();
      }
      await page.locator('[data-testid="banner-presence-save"]').click();
      await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();

      page.once("dialog", (d) => d.accept());
      await tableRow.locator('[data-testid="banner-delete-btn"]').click();
      await expect(tableRow).not.toBeVisible();
    } finally {
      await request.put(`${BACKEND_URL}/v1/admin/store-settings/presence`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          bannerPresence: originalPresence,
          aboutPresence: config.aboutPresence ?? { enabled: true, present: true },
        },
      });

      await request.put(`${BACKEND_URL}/v1/admin/store-settings/homepage`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: originalHomepage,
      });
    }
  });
});
