import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Review Moderation E2E @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    // Navigate to Reviews moderation section from navigation
    const reviewsNav = page.locator('[data-testid="admin-nav-reviews"]');
    await expect(reviewsNav).toBeVisible();
    await reviewsNav.click();
    await page.waitForLoadState("networkidle");
  });

  test("should display split layout, stats cards, and review queue", async ({ page }) => {
    // 1. Verify page title & subtitle
    await expect(page.locator("h1")).toHaveText("Review Moderation");
    
    // 2. Verify Stats Cards
    await expect(page.locator('[data-testid="reviews-stats-pending"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-stats-featured"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-stats-hidden"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-stats-alert"]')).toContainText(
      "Moderation needs image context before publish."
    );

    // 3. Verify Layout Split Panels
    await expect(page.locator('[data-testid="reviews-queue-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-action-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-context-panel"]')).toBeVisible();

    // 4. Verify Bulk Button is present but disabled initially
    const bulkBtn = page.locator('[data-testid="reviews-bulk-publish-btn"]');
    await expect(bulkBtn).toBeVisible();
    await expect(bulkBtn).toBeDisabled();
  });

  test("should show review context details when a review is selected", async ({ page }) => {
    const queueItem = page.locator('[data-testid="review-queue-item"]').first();
    await expect(queueItem).toBeVisible();
    await queueItem.click();

    // Verify Context detail changes
    await expect(page.locator('[data-testid="context-product-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-buyer-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-order-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-attachment-count"]')).toBeVisible();
  });

  test("should approve a pending review and reflect status", async ({ page }) => {
    // Select first review
    const queueItem = page.locator('[data-testid="review-queue-item"]').first();
    await expect(queueItem).toBeVisible();
    await queueItem.click();

    // Click Approve button
    const approveBtn = page.locator('[data-testid="review-action-approve"]');
    await expect(approveBtn).toBeEnabled();
    await approveBtn.click();

    // Verify loading state and success feedback
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();
  });

  test("should hide an approved review", async ({ page }) => {
    // Select first review
    const queueItem = page.locator('[data-testid="review-queue-item"]').first();
    await expect(queueItem).toBeVisible();
    await queueItem.click();

    // Click Hide button
    const hideBtn = page.locator('[data-testid="review-action-hide"]');
    await expect(hideBtn).toBeEnabled();
    await hideBtn.click();

    // Verify success toast/alert
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();
  });

  test("should toggle feature status on review", async ({ page }) => {
    // Select first review
    const queueItem = page.locator('[data-testid="review-queue-item"]').first();
    await expect(queueItem).toBeVisible();
    await queueItem.click();

    // Click Feature button
    const featureBtn = page.locator('[data-testid="review-action-feature"]');
    await expect(featureBtn).toBeEnabled();
    await featureBtn.click();

    // Verify success toast/alert
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();
  });

  test("should allow bulk publishing of selected pending reviews", async ({ page }) => {
    // Select checkboxes of first two reviews
    const checkbox1 = page.locator('[data-testid="review-item-checkbox"]').nth(0);
    const checkbox2 = page.locator('[data-testid="review-item-checkbox"]').nth(1);

    await checkbox1.check();
    await checkbox2.check();

    // Verify bulk button becomes enabled
    const bulkBtn = page.locator('[data-testid="reviews-bulk-publish-btn"]');
    await expect(bulkBtn).toBeEnabled();

    // Perform bulk publish
    await bulkBtn.click();

    // Verify success feedback
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();
  });
});
