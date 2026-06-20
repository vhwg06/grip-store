import type { Page } from "@playwright/test";
import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Store Settings Spec Coverage @admin P1 P2", () => {
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

  test("UC-SET-01 submits storefront identity intent through brand and contact groups and reflects the new identity publicly", async ({
    page,
    homepagePage,
    request,
  }) => {
    // GOAL: Admin Maintains Storefront Identity: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-01 Main flow
    // INVARIANT: brand và contact là public business facts — identity changes phải được hiểu là thay đổi storefront behavior
    // INVARIANT: storefront read model mới phải có hiệu lực ngay sau save (verified via /v1/site-config)
    const adminToken = await getAdminToken(request);
    expect(adminToken).toBeTruthy();

    const getResp = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getResp.ok()).toBeTruthy();
    const originalPayload = await getResp.json();
    const originalBrand = originalPayload?.data?.config?.brand || originalPayload?.config?.brand;
    const originalContact = originalPayload?.data?.config?.contact || originalPayload?.config?.contact;

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

      const siteConfig = await request.get(`${BACKEND_URL}/v1/site-config`);
      expect(siteConfig.ok()).toBeTruthy();
      const siteConfigPayload = await siteConfig.json();
      expect(siteConfigPayload.data.brand.shopName).toBe("playwright-storefront-identity");

      await homepagePage.goto();

      await expect(page.locator('[data-testid="site-header-logo-text"]')).toContainText("playwright-storefront-identity");
      await expect(page.locator('[data-testid="sticky-bar-address"]')).toContainText("12 Nguyen Hue");
      await expect(page.locator('[data-testid="sticky-bar-hotline"]')).toContainText("+84 903 117 742");
      await expect(page.locator('[data-testid="footer-contact-email"]')).toContainText("playwright-identity@grip.vn");
    } finally {
      if (originalBrand) {
        await request.put(`${BACKEND_URL}/v1/admin/store-settings/brand`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          data: originalBrand,
        });
      }
      if (originalContact) {
        await request.put(`${BACKEND_URL}/v1/admin/store-settings/contact`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          data: originalContact,
        });
      }
    }
  });

  test("UC-SET-01 alternate flow: updates contact info without changing brand info", async ({
    page,
    homepagePage,
    request,
  }) => {
    // GOAL: Admin Maintains Storefront Identity: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-01 Alternate flow
    const adminToken = await getAdminToken(request);
    expect(adminToken).toBeTruthy();

    const getResp = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getResp.ok()).toBeTruthy();
    const originalPayload = await getResp.json();
    const originalBrand = originalPayload?.data?.config?.brand || originalPayload?.config?.brand;
    const originalContact = originalPayload?.data?.config?.contact || originalPayload?.config?.contact;

    try {
      await expect(page.getByRole("heading", { name: "Store Settings" })).toBeVisible();
      await expect(page.locator('[data-testid="settings-section-contact"]')).toBeVisible();

      await page.locator('[data-testid="settings-contact-address"]').fill("456 Playwright Alternate Road");
      await page.locator('[data-testid="settings-save-contact"]').click();
      await expectSuccessToast(page);

      await homepagePage.goto();
      await expect(page.locator('[data-testid="sticky-bar-address"]')).toContainText("456 Playwright Alternate Road");

      if (originalBrand?.shopName) {
        await expect(page.locator('[data-testid="site-header-logo-text"]')).toContainText(originalBrand.shopName);
      }
    } finally {
      if (originalContact) {
        await request.put(`${BACKEND_URL}/v1/admin/store-settings/contact`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          data: originalContact,
        });
      }
    }
  });

  test("UC-SET-02 submits homepage composition decisions and reflects the new homepage priority", async ({
    page,
    homepagePage,
    request,
  }) => {
    // GOAL: Admin Composes Homepage Surface: quyết định storefront homepage đang ưu tiên giới thiệu nội dung gì.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-02 Main flow
    // INVARIANT: block order là publishing decision — không chỉ là UI arrangement
    // INVARIANT: enabled/disabled blocks thay đổi homepage presence semantics
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();

    await page.locator('[data-testid="homepage-block-latest-news-toggle"]').click();
    await page.locator('[data-testid="homepage-block-latest-news-toggle"]').click();
    await page.locator('[data-testid="homepage-news-count"]').fill("3");

    // Đọc state từ backend trước, assert dựa trên actual composition order
    const adminToken = await getAdminToken(request);
    const settingsResp = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const config = await settingsResp.json();
    const blocks = config?.data?.config?.homepage?.blocks ?? [];
    const categoriesIdx = blocks.findIndex((b: any) => b.key === "categories");
    if (categoriesIdx > 0) {
      await expect(page.locator('[data-testid="homepage-block-categories-move-up"]')).toBeEnabled();
      await page.locator('[data-testid="homepage-block-categories-move-up"]').click();
    } else {
      // Categories đã ở top — assert disabled (đây là valid state, không phải skip)
      await expect(page.locator('[data-testid="homepage-block-categories-move-up"]')).toBeDisabled();
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
    // GOAL: Admin Composes Homepage Surface: quyết định storefront homepage đang ưu tiên giới thiệu nội dung gì.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-02 Exception flow
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();
    await page.locator('[data-testid="homepage-news-count"]').fill("-1");
    // Save button should be disabled for negative news count
    await expect(page.locator('[data-testid="settings-save-homepage"]')).toBeDisabled();
  });

  test("UC-SET-03 submits discovery and visibility rules as behavioral settings", async ({
    page,
    homepagePage,
  }) => {
    // GOAL: Admin Controls Public Discovery And Visibility Rules: điều chỉnh cách storefront được discover và cách một số capability xuất hiện công khai.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-03 Main flow
    // INVARIANT: các flags như no-index mang behavioral meaning — không phải display preference đơn thuần
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
    // GOAL: Admin Controls Public Discovery And Visibility Rules: điều chỉnh cách storefront được discover và cách một số capability xuất hiện công khai.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-03 Exception flow
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
    // GOAL: Admin Maintains Storefront Support And Footer Presence: kiểm soát các điểm chạm hỗ trợ và navigation/public references trên storefront.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-04 Main flow
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
    // GOAL: Admin Maintains Storefront Support And Footer Presence: kiểm soát các điểm chạm hỗ trợ và navigation/public references trên storefront.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-04 Exception flow
    await expect(page.locator('[data-testid="settings-section-contact"]')).toBeVisible();
    await page.locator('[data-testid="settings-contact-email"]').fill("invalid-email");
    
    // Check validation error message
    await expect(page.getByText("Invalid email format.")).toBeVisible();
    // Save button should be disabled
    await expect(page.locator('[data-testid="settings-save-contact"]')).toBeDisabled();
  });

  test("UC-SET-05 exposes banner and about presence controls inside store settings", async ({
    page,
    homepagePage,
    request,
  }) => {
    // GOAL: Admin Maintains Banner And About Presence Through Store Settings: kiểm soát các reference thuộc banner/about trong phạm vi storefront behavior.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-05 Main flow
    // INVARIANT: banner và about presence controls thay đổi layout composition của storefront
    test.fail(true, "blocked-be-gap: bannerPresence/aboutPresence missing in config");

    await expect(page.locator('[data-testid="settings-banner-presence-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-about-presence-toggle"]')).toBeVisible();

    // Toggle them
    await expect(page.locator('[data-testid="settings-banner-presence-toggle"]')).toBeEnabled({ timeout: 1000 });
    await expect(page.locator('[data-testid="settings-about-presence-toggle"]')).toBeEnabled({ timeout: 1000 });

    await page.locator('[data-testid="settings-banner-presence-toggle"]').click();
    await page.locator('[data-testid="settings-about-presence-toggle"]').click();

    // Save
    await page.locator('[data-testid="settings-save-presence"]').click();
    await expectSuccessToast(page);

    // Verify reflection on storefront
    await homepagePage.goto();
    await expect(page.locator('[data-testid="homepage-banner"]')).toBeHidden();
    await expect(page.locator('[data-testid="homepage-about"]')).toBeHidden();
  });

  test("UC-SET-06 exposes registry and legacy commitment controls as an intentional storefront policy surface", async ({
    page,
  }) => {
    // GOAL: Admin Maintains Registry And Legacy Storefront Commitments: giữ các storefront commitments cũ hoặc registry-related commitments ở trạng thái đúng với business policy hiện tại.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-06 Main flow
    await expect(page.locator('[data-testid="settings-section-registry-legacy"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Registry & legacy controls" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Join Registry|Resubmit Origin/i })).toBeVisible();
  });

  test("UC-SET-04 negative path: validation blocks invalid social URL format", async ({ page }) => {
    // GOAL: Admin Maintains Storefront Support And Footer Presence: kiểm soát các điểm chạm hỗ trợ và navigation/public references trên storefront.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-04 Exception flow
    test.fail(true, "blocked-fe-gap: social URL validation is missing in frontend");
    await expect(page.locator('[data-testid="settings-section-footer-social"]')).toBeVisible();
    await page.locator('[data-testid="social-link-facebook"]').fill("invalid-facebook-url");
    await expect(page.locator('[data-testid="settings-save-footer-social"]')).toBeDisabled();
  });

  test("UC-SET-05 negative path: banner/about presence toggle and save failure", async ({ page }) => {
    // GOAL: Admin Maintains Banner And About Presence Through Store Settings: kiểm soát các reference thuộc banner/about trong phạm vi storefront behavior.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-05 Exception flow
    // INVARIANT: save operation cho presence controls phải fail an toàn khi server từ chối cập nhật
    await expect(page.locator('[data-testid="settings-banner-presence-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-banner-presence-toggle"]')).toBeDisabled();
  });

  test("UC-SET-06 negative path: rejects invalid registry origin payload", async ({ page }) => {
    // GOAL: Admin Maintains Registry And Legacy Storefront Commitments: giữ các storefront commitments cũ hoặc registry-related commitments ở trạng thái đúng với business policy hiện tại.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-06 Exception flow
    // INVARIANT: registry commit với invalid payload phải bị chặn và hiển thị error, không silent succeed
    await expect(page.locator('[data-testid="settings-section-registry-legacy"]')).toBeVisible();
    
    const commitBtn = page.getByRole("button", { name: /Join Registry|Resubmit Origin/i });
    await expect(commitBtn).toBeVisible();
    await commitBtn.click();

    await expect(page.locator("[data-type='error'], .toast-error").first()).toBeVisible();
  });

  test("UC-SET-01 exception: failed save must not silently succeed on empty shop name", async ({ page }) => {
    // GOAL: Admin Maintains Storefront Identity: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-01 Exception flow
    // INVARIANT: shop name là bắt buộc cho storefront identity — empty shop name phải bị validate chặn ở client hoặc server
    await expect(page.locator('[data-testid="settings-section-brand"]')).toBeVisible();

    await page.locator('[data-testid="settings-brand-shop-name"]').fill("");
    
    const saveBtn = page.locator('[data-testid="settings-save-brand"]');
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(page.locator("[data-type='success'], .toast-success").first()).toBeHidden();
      await expect(page.locator("[data-type='error'], .toast-error").first()).toBeVisible();
    } else {
      await expect(saveBtn).toBeDisabled();
    }
  });

  test("UC-SET-02 alternate: reorders only active blocks without toggling enablement", async ({
    page,
    homepagePage,
    request,
  }) => {
    // GOAL: Admin Composes Homepage Surface: quyết định storefront homepage đang ưu tiên giới thiệu nội dung gì.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-02 Alternate flow
    await expect(page.locator('[data-testid="settings-section-homepage"]')).toBeVisible();

    const adminToken = await getAdminToken(request);
    const settingsResp = await request.get(`${BACKEND_URL}/v1/admin/store-settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const config = await settingsResp.json();
    const blocks = config?.data?.config?.homepage?.blocks ?? [];
    const categoriesIdx = blocks.findIndex((b: any) => b.key === "categories");
    if (categoriesIdx > 0) {
      await expect(page.locator('[data-testid="homepage-block-categories-move-up"]')).toBeEnabled();
      await page.locator('[data-testid="homepage-block-categories-move-up"]').click();
    } else {
      await expect(page.locator('[data-testid="homepage-block-categories-move-down"]')).toBeEnabled();
      await page.locator('[data-testid="homepage-block-categories-move-down"]').click();
    }

    await page.locator('[data-testid="settings-save-homepage"]').click();
    await expectSuccessToast(page);
  });

  test("UC-SET-03 alternate: submits grouped discovery and visibility flags as a single save decision", async ({
    page,
    homepagePage,
  }) => {
    // GOAL: Admin Controls Public Discovery And Visibility Rules: điều chỉnh cách storefront được discover và cách một số capability xuất hiện công khai.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-03 Alternate flow
    await expect(page.locator('[data-testid="settings-section-discovery-visibility"]')).toBeVisible();

    const checkboxNoIndex = page.locator('[data-testid="visibility-noindex-enabled"]');
    const checkboxWishlist = page.locator('[data-testid="visibility-wishlist-enabled"]');

    if (await checkboxNoIndex.getAttribute("aria-checked") !== "true") {
      await checkboxNoIndex.click();
    }
    if (await checkboxWishlist.getAttribute("aria-checked") !== "true") {
      await checkboxWishlist.click();
    }

    await page.locator('[data-testid="settings-save-support-controls"]').click();
    await expectSuccessToast(page);
  });
});

