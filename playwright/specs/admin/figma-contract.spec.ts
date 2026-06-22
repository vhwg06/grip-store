import { test, expect } from "../../src/fixtures/base-test";

test.describe("Figma UI Contract Admin Parity @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({}, testInfo) => {
    // Skip visual checks on mobile views as figma layouts are desktop-focused
    if (testInfo.project.name.toLowerCase().includes("mobile")) {
      test.skip();
    }
  });

  test("Verify Store Settings page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("settings");
    await page.setViewportSize({ width: 1440, height: 1326 });
    await expect(page).toHaveScreenshot("store-settings.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="settings-section-overview"]'),
      ],
    });
  });

  test("Verify Products list page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("products");
    await expect(page).toHaveScreenshot("products.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="admin-table"] tbody'),
      ],
    });
  });

  test("Verify Product Create page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await page.goto("/admin/product/new");
    await expect(page).toHaveScreenshot("product-create.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("Verify Banners page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("banners");
    await expect(page).toHaveScreenshot("banner-management.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="banners-list-container"]'),
      ],
    });
  });

  test("Verify Media Library page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("media");
    await expect(page).toHaveScreenshot("media-management.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="media-grid-container"]'),
      ],
    });
  });

  test("Verify Orders page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("orders");
    await expect(page).toHaveScreenshot("orders.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="orders-table-body"]'),
      ],
    });
  });

  test("Verify Refunds page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("refunds");
    await expect(page).toHaveScreenshot("refunds.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="refunds-queue-container"]'),
        page.locator('[data-testid="refunds-decision-panel"]'),
        page.locator('[data-testid="refunds-evidence-panel"]'),
      ],
    });
  });

  test("Verify Messages page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("notifications");
    await expect(page).toHaveScreenshot("messages.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="messages-history-list"]'),
      ],
    });
  });

  test("Verify Categories page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("categories");
    await expect(page).toHaveScreenshot("categories.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="categories-tree-container"]'),
      ],
    });
  });

  test("Verify Users page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("users");
    await expect(page).toHaveScreenshot("users.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="users-table-body"]'),
      ],
    });
  });

  test("Verify Reviews page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("reviews");
    await expect(page.getByRole("heading", { name: "Review Moderation" })).toBeVisible();
    await expect(page.locator('[data-testid="reviews-queue-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-context-panel"]')).toBeVisible();
    await expect(page).toHaveScreenshot("reviews.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="reviews-stats-pending"]'),
        page.locator('[data-testid="reviews-stats-featured"]'),
        page.locator('[data-testid="reviews-stats-hidden"]'),
        page.locator('[data-testid="reviews-queue-container"]'),
        page.locator('[data-testid="reviews-context-panel"]'),
      ],
    });
  });

  test("Verify Collect page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("collect");
    await expect(page).toHaveScreenshot("collect.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="collect-inputs-container"]'),
      ],
    });
  });

  test("Verify Profile page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("profile");
    await expect(page).toHaveScreenshot("profile.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="profile-identity-fields"]'),
      ],
    });
  });

  test("Verify FAQs page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("faqs");
    await expect(page).toHaveScreenshot("faqs.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="faqs-list-container"]'),
      ],
    });
  });

  test("Verify Articles page matches Figma @desktop", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("articles");
    await expect(page).toHaveScreenshot("article-management.png", {
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid="articles-list-container"]'),
      ],
    });
  });
});
