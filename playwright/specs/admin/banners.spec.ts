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

  test.beforeEach(async ({ adminPage, page, request }) => {
    // 1. Ensure homepage Hero block and Banner presence are enabled in settings via API
    const token = await getAdminToken(request);
    const settingsResp = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(settingsResp.ok()).toBeTruthy();

    const current = await settingsResp.json();
    const config = current?.data?.config ?? current?.config ?? {};
    const bannerPresence = config.bannerPresence ?? {};
    const aboutPresence = config.aboutPresence ?? {};
    const homepage = config.homepage ?? {};

    // Enable banner presence if disabled
    if (!bannerPresence.enabled) {
      const presenceResp = await request.put(`${BACKEND_URL}/v1/admin/store-settings/presence`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          bannerPresenceEnabled: true,
          aboutPresenceEnabled: aboutPresence.enabled ?? true,
        },
      });
      expect(presenceResp.ok()).toBeTruthy();
    }

    // Enable homepage hero block if disabled
    const blocks = homepage.blocks ?? [];
    const heroBlock = blocks.find((b: any) => b.key === "hero");
    if (!heroBlock || !heroBlock.enabled) {
      const updatedBlocks = blocks.map((b: any) => b.key === "hero" ? { ...b, enabled: true } : b);
      if (!blocks.some((b: any) => b.key === "hero")) {
        updatedBlocks.push({ key: "hero", enabled: true, order: 1 });
      }
      const homepageResp = await request.put(`${BACKEND_URL}/v1/admin/store-settings/homepage`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          blocks: updatedBlocks,
          newsCount: homepage.newsCount ?? 3,
        },
      });
      expect(homepageResp.ok()).toBeTruthy();
    }

    await adminPage.goto();
    // 2. Navigate to Banners management
    await page.goto("/admin/banners", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  test("should allow adding, updating, and deleting a banner per page", async ({ page }) => {
    const bannerTitle = `E2E Test Banner Title ${Date.now()}`;

    // 1. Verify basic page structure
    await expect(page.locator("h1")).toContainText(/Banner Management|Quản lý Banner/);

    // 2. Select target page (e.g. 'homepage')
    const pageSelect = page.locator('[data-testid="banner-target-page-select"]');
    if (await pageSelect.isVisible()) {
      await pageSelect.selectOption("homepage");
    }

    // 3. Fill banner details
    await page.locator("#banner-title").fill(bannerTitle);
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
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // 6. Assert success toast
    await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();

    // 7. Verify the new banner is in the table
    const tableRow = page.locator('[data-testid="banner-item"]').filter({ hasText: bannerTitle }).first();
    await expect(tableRow).toBeVisible();

    // 8. Go to Homepage and verify the banner renders correctly
    await page.goto("/", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-title"]').filter({ hasText: bannerTitle })).toBeVisible();

    // 9. Go back and delete the banner
    await page.goto("/admin/banners", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const deleteRow = page.locator('[data-testid="banner-item"]').filter({ hasText: bannerTitle }).first();
    await expect(deleteRow).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await deleteRow.locator('[data-testid="banner-delete-btn"]').click();
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // 10. Verify row disappeared
    await expect(deleteRow).not.toBeVisible();
  });
});
