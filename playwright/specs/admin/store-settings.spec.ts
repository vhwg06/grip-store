import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Store Settings Spec Coverage @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.fixme(true, "Spec 005 exists, but Store Settings redesign is not implemented yet.");

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("settings");
  });

  test("renders sectioned Store Settings surface with grouped save boundaries", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Store Settings" })).toBeVisible();

    await expect(page.locator('[data-testid="settings-section-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-brand"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-footer-social"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-floating-support"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-discovery-visibility"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-section-registry-legacy"]')).toBeVisible();

    await expect(page.locator('[data-testid="settings-save-brand"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-save-homepage"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-save-footer-social"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-save-support-controls"]')).toBeVisible();
  });

  test("updates brand and contact settings then reflects them on storefront after reload", async ({ page, homepagePage }) => {
    await page.locator('[data-testid="settings-brand-shop-name"]').fill("Grip Store QA");
    await page.locator('[data-testid="settings-brand-description"]').fill("Premium hardware QA copy");
    await page.locator('[data-testid="settings-contact-address"]').fill("12 Nguyen Hue, Ho Chi Minh City");
    await page.locator('[data-testid="settings-contact-hotline"]').fill("+84 903 117 742");
    await page.locator('[data-testid="settings-contact-email"]').fill("qa-contact@grip.vn");
    await page.locator('[data-testid="settings-brand-logo-open-media-picker"]').click();
    await page.locator('[data-testid="media-picker-item"]').first().click();
    await page.locator('[data-testid="media-picker-confirm"]').click();
    await page.locator('[data-testid="settings-save-brand"]').click();

    await expect(page.locator('[data-testid="settings-toast-success"]')).toBeVisible();

    await homepagePage.goto();
    await page.reload();

    await expect(page.locator('[data-testid="site-header-logo-text"]')).toContainText("Grip Store QA");
    await expect(page.locator('[data-testid="sticky-bar-address"]')).toContainText("12 Nguyen Hue");
    await expect(page.locator('[data-testid="sticky-bar-hotline"]')).toContainText("+84 903 117 742");
    await expect(page.locator('[data-testid="footer-contact-email"]')).toContainText("qa-contact@grip.vn");
    await expect(page.locator('[data-testid="site-header-logo-image"]')).toBeVisible();
  });

  test("updates homepage composition and reflects module order plus news count", async ({ page, homepagePage }) => {
    await page.locator('[data-testid="homepage-block-latest-news-toggle"]').click();
    await page.locator('[data-testid="homepage-block-latest-news-toggle"]').click();
    await page.locator('[data-testid="homepage-news-count"]').fill("6");
    await page.locator('[data-testid="homepage-block-categories-move-up"]').click();
    await page.locator('[data-testid="settings-save-homepage"]').click();

    await expect(page.locator('[data-testid="settings-toast-success"]')).toBeVisible();

    await homepagePage.goto();
    await page.reload();

    await expect(page.locator('[data-testid="homepage-module-categories"]')).toBeVisible();
    await expect(page.locator('[data-testid="homepage-module-latest-news"]')).toBeVisible();
    await expect(page.locator('[data-testid="latest-news-card"]')).toHaveCount(6);
  });

  test("updates footer, social links, support actions, and discovery controls", async ({ page, homepagePage }) => {
    await page.locator('[data-testid="footer-column-0-title"]').fill("Products");
    await page.locator('[data-testid="footer-column-0-link-0-label"]').fill("Door Handles");
    await page.locator('[data-testid="footer-column-0-link-0-url"]').fill("/products");
    await page.locator('[data-testid="social-link-facebook"]').fill("https://facebook.com/gripvn");
    await page.locator('[data-testid="support-action-zalo-enabled"]').click();
    await page.locator('[data-testid="support-action-zalo-target"]').fill("https://zalo.me/gripvn");
    await page.locator('[data-testid="visibility-noindex-enabled"]').click();
    await page.locator('[data-testid="settings-save-support-controls"]').click();

    await expect(page.locator('[data-testid="settings-toast-success"]')).toBeVisible();

    await homepagePage.goto();
    await page.reload();

    await expect(page.locator('[data-testid="footer-column-title"]').first()).toContainText("Products");
    await expect(page.locator('[data-testid="footer-social-facebook"]')).toHaveAttribute("href", /facebook\.com\/gripvn/);
    await expect(page.locator('[data-testid="floating-button-zalo"]')).toHaveAttribute("href", /zalo\.me\/gripvn/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
