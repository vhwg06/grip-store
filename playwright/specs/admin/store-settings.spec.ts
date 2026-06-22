import type { Page } from "@playwright/test";
import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Store Settings Spec Coverage @admin P1", () => {
  test.describe.configure({ mode: "serial" });

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

  async function getSettingsConfig(request: any, token: string) {
    const response = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    return payload?.data?.config ?? payload?.config ?? {};
  }

  test("UC-SET-01 submits storefront identity intent through brand and contact groups and reflects the new identity publicly", async ({
    page,
    homepagePage,
    request,
  }) => {
    const adminToken = await getAdminToken(request);
    const originalConfig = await getSettingsConfig(request, adminToken);

    try {
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

      await homepagePage.goto();
      await expect(page.locator('[data-testid="site-header-logo-text"]')).toContainText("playwright-storefront-identity");
      await expect(page.locator('[data-testid="sticky-bar-address"]')).toContainText("12 Nguyen Hue");
      await expect(page.locator('[data-testid="sticky-bar-hotline"]')).toContainText("+84 903 117 742");
      await expect(page.locator('[data-testid="footer-contact-email"]')).toContainText("playwright-identity@grip.vn");
    } finally {
      await request.put(`${BACKEND_URL}/v1/admin/store-settings/brand`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: originalConfig.brand,
      });
      await request.put(`${BACKEND_URL}/v1/admin/store-settings/contact`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: originalConfig.contact,
      });
    }
  });

  test("UC-SET-02 submits homepage composition decisions and reflects the new homepage priority", async ({
    page,
    homepagePage,
    request,
  }) => {
    const adminToken = await getAdminToken(request);
    const originalConfig = await getSettingsConfig(request, adminToken);

    try {
      await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();
      await page.locator('[data-testid="homepage-news-count"]').fill("3");

      const categoriesMoveUp = page.locator('[data-testid="homepage-block-categories-move-up"]');
      if (await categoriesMoveUp.isEnabled()) {
        await categoriesMoveUp.click();
      }

      await page.locator('[data-testid="settings-save-homepage"]').click();
      await expectSuccessToast(page);

      await homepagePage.goto();
      await expect(page.locator('[data-testid="homepage-module-categories"]')).toBeVisible();
      await expect(page.locator('[data-testid="homepage-module-latest-news"]')).toBeVisible();
      expect(await page.locator('[data-testid="latest-news-card"]').count()).toBeLessThanOrEqual(3);
    } finally {
      await request.put(`${BACKEND_URL}/v1/admin/store-settings/homepage`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: originalConfig.homepage,
      });
    }
  });

  test("UC-SET-02 negative path: rejects negative news count", async ({ page }) => {
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();
    await page.locator('[data-testid="homepage-news-count"]').fill("-1");
    await expect(page.locator('[data-testid="settings-save-homepage"]')).toBeDisabled();
  });

  test("UC-SET-04 submits footer and support touchpoint intent and reflects public support commitments", async ({
    page,
    homepagePage,
    request,
  }) => {
    const adminToken = await getAdminToken(request);
    const originalConfig = await getSettingsConfig(request, adminToken);

    try {
      await expect(page.locator('[data-testid="settings-section-footer-social"]')).toBeVisible();
      await expect(page.locator('[data-testid="settings-section-floating-support"]')).toBeVisible();

      await page.locator('[data-testid="social-link-facebook"]').fill("https://facebook.com/playwright-grip");
      await page.locator('[data-testid="settings-save-footer-social"]').click();
      await expectSuccessToast(page);

      const zaloToggle = page.locator('[data-testid="support-action-zalo-enabled"]');
      if (!(await zaloToggle.isChecked())) {
        await zaloToggle.click();
      }
      await page.locator('[data-testid="support-action-zalo-target"]').fill("https://zalo.me/playwright-grip");
      await page.locator('[data-testid="settings-save-support-controls"]').click();
      await expectSuccessToast(page);

      await homepagePage.goto();
      await expect(page.locator('[data-testid="footer-social-facebook"]')).toHaveAttribute("href", /facebook\.com\/playwright-grip/);
      await expect(page.locator('[data-testid="floating-button-zalo"]')).toHaveAttribute("href", /zalo\.me\/playwright-grip/);
    } finally {
      await request.put(`${BACKEND_URL}/v1/admin/store-settings/footer`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: originalConfig.footer,
      });
      await request.put(`${BACKEND_URL}/v1/admin/store-settings/floating-support`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { actions: originalConfig.floatingSupport ?? [] },
      });
    }
  });

  test("UC-SET-04 negative path: validation blocks invalid support email format", async ({ page }) => {
    await expect(page.locator('[data-testid="settings-section-contact"]')).toBeVisible();
    await page.locator('[data-testid="settings-contact-email"]').fill("invalid-email");
    await expect(page.getByText("Invalid email format.")).toBeVisible();
    await expect(page.locator('[data-testid="settings-save-contact"]')).toBeDisabled();
  });
});
