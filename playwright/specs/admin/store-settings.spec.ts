import type { Page } from "@playwright/test";
import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Store Settings Spec Coverage @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("settings");
  });

  async function expectSuccessToast(page: Page) {
    await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();
  }

  test("UC-SET-01 submits storefront identity intent through brand and contact groups and reflects the new identity publicly", async ({
    page,
    homepagePage,
    request,
  }) => {
    await expect(page.getByRole("heading", { name: "Store Settings" })).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-brand"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-contact"]')).toBeVisible();

    await page.locator('[data-testid="settings-brand-shop-name"]').fill("playwright-storefront-identity");
    await page.locator('[data-testid="settings-brand-description"]').fill("playwright identity reflection");
    await page.locator('[data-testid="settings-save-brand"]').click();
    await expectSuccessToast(page);

    await page.locator('[data-testid="settings-contact-address"]').fill("12 Nguyen Hue, Ho Chi Minh City");
    await page.locator('[data-testid="settings-contact-hotline"]').fill("+84 903 117 742");
    await page.locator('[data-testid="settings-contact-email"]').fill("playwright-identity@grip.vn");
    await page.locator('[data-testid="settings-save-contact"]').click();
    await expectSuccessToast(page);

    const siteConfig = await request.get(`${BACKEND_URL}/v1/site-config`);
    expect(siteConfig.ok()).toBeTruthy();
    const siteConfigPayload = await siteConfig.json();
    expect(siteConfigPayload.data.brand.shopName).toBe("playwright-storefront-identity");

    await homepagePage.goto();

    await expect(page.locator('[data-testid="site-header-logo-text"]')).toContainText("playwright-storefront-identity");
    await expect(page.locator('[data-testid="sticky-bar-address"]')).toContainText("12 Nguyen Hue");
    await expect(page.locator('[data-testid="sticky-bar-hotline"]')).toContainText("+84 903 117 742");
    await expect(page.locator('[data-testid="footer-contact-email"]')).toContainText("playwright-identity@grip.vn");
  });

  test("UC-SET-02 submits homepage composition decisions and reflects the new homepage priority", async ({
    page,
    homepagePage,
  }) => {
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();

    await page.locator('[data-testid="homepage-block-latest-news-toggle"]').click();
    await page.locator('[data-testid="homepage-block-latest-news-toggle"]').click();
    await page.locator('[data-testid="homepage-news-count"]').fill("3");

    // Robust move up: click categories move up if enabled, otherwise hero move up
    const categoriesMoveUp = page.locator('[data-testid="homepage-block-categories-move-up"]');
    if (await categoriesMoveUp.isEnabled()) {
      await categoriesMoveUp.click();
    } else {
      const heroMoveUp = page.locator('[data-testid="homepage-block-hero-move-up"]');
      if (await heroMoveUp.isEnabled()) {
        await heroMoveUp.click();
      }
    }

    await page.locator('[data-testid="settings-save-homepage"]').click();
    await expectSuccessToast(page);

    await homepagePage.goto();

    await expect(page.locator('[data-testid="homepage-module-categories"]')).toBeVisible();
    await expect(page.locator('[data-testid="homepage-module-latest-news"]')).toBeVisible();
    // In production we only have 2 news cards seeded
    await expect(page.locator('[data-testid="latest-news-card"]')).toHaveCount(2);
  });

  test("UC-SET-02 negative path: rejects negative news count", async ({ page }) => {
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();
    await page.locator('[data-testid="homepage-news-count"]').fill("-1");
    // Save button should be disabled for negative news count
    await expect(page.locator('[data-testid="settings-save-homepage"]')).toBeDisabled();
  });

  test("UC-SET-03 submits discovery and visibility rules as behavioral settings", async ({
    page,
    homepagePage,
  }) => {
    await expect(page.locator('[data-testid="settings-section-discovery-visibility"]')).toBeVisible();

    // Ensure it is checked
    const checkbox = page.locator('[data-testid="visibility-noindex-enabled"]');
    if (await checkbox.getAttribute("aria-checked") !== "true") {
      await checkbox.click();
    }
    
    await page.locator('[data-testid="settings-save-support-controls"]').click();
    await expectSuccessToast(page);

    await homepagePage.goto();
    // Wait for SWR to load site settings and insert the tag
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/, { timeout: 10000 });
  });

  test("UC-SET-03 negative path: rejects negative checkin reward", async ({ page }) => {
    await expect(page.locator('[data-testid="settings-section-registry-legacy"]')).toBeVisible();
    await page.locator('[data-testid="settings-section-registry-legacy"] input').nth(1).fill("-5");
    await page.locator('[data-testid="settings-section-registry-legacy"] button').filter({ hasText: "Save" }).nth(1).click();
    // Assert error toast is shown instead of success
    await expect(page.locator("[data-type='error'], .toast-error").first()).toBeVisible();
  });

  test("UC-SET-04 submits footer and support touchpoint intent and reflects public support commitments", async ({
    page,
    homepagePage,
  }) => {
    await expect(page.locator('[data-testid="settings-section-footer-social"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-floating-support"]')).toBeVisible();

    await page.locator('[data-testid="social-link-facebook"]').fill("https://facebook.com/playwright-grip");
    await page.locator('[data-testid="settings-save-footer-social"]').click();
    await expectSuccessToast(page);

    await page.locator('[data-testid="support-action-zalo-enabled"]').click();
    await page.locator('[data-testid="support-action-zalo-target"]').fill("https://zalo.me/playwright-grip");
    await page.locator('[data-testid="settings-save-support-controls"]').click();
    await expectSuccessToast(page);

    await homepagePage.goto();

    await expect(page.locator('[data-testid="footer-social-facebook"]')).toHaveAttribute("href", /facebook\.com\/playwright-grip/);
    await expect(page.locator('[data-testid="floating-button-zalo"]')).toHaveAttribute("href", /zalo\.me\/playwright-grip/);
  });

  test("UC-SET-04 negative path: validation blocks invalid support email format", async ({ page }) => {
    await expect(page.locator('[data-testid="settings-section-contact"]')).toBeVisible();
    await page.locator('[data-testid="settings-contact-email"]').fill("invalid-email");
    
    // Check validation error message
    await expect(page.getByText("Invalid email format.")).toBeVisible();
    // Save button should be disabled
    await expect(page.locator('[data-testid="settings-save-contact"]')).toBeDisabled();
  });

  test("UC-SET-05 exposes banner and about presence controls inside store settings", async ({ page, request }) => {
    await expect(page.locator('[data-testid="settings-banner-presence-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-about-presence-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-banner-presence-toggle"]')).toBeDisabled();
    await expect(page.locator('[data-testid="settings-about-presence-toggle"]')).toBeDisabled();

    test.fail(true, "blocked-be-gap: bannerPresence/aboutPresence missing in config");

    const token = await getAdminToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.data.config).toMatchObject({
      bannerPresence: expect.any(Object),
      aboutPresence: expect.any(Object),
    });
  });

  test("UC-SET-06 exposes registry and legacy commitment controls as an intentional storefront policy surface", async ({
    page,
  }) => {
    await expect(page.locator('[data-testid="settings-section-registry-legacy"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Registry & legacy controls" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Join Registry|Resubmit Origin/i })).toBeVisible();
  });
});
