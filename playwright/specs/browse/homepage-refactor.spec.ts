import { test, expect } from "../../src/fixtures/base-test";

test.describe("Homepage Refactored Guest Flow @browse", () => {
  test.beforeEach(async ({ homepagePage }) => {
    await homepagePage.goto();
  });

  test("should display banner and category icons", async ({ page }) => {
    // Verify hero banner is visible
    await expect(page.locator('[data-testid="hero-title"]')).toBeVisible();

    // Verify category rail rail is visible and contains items
    const icons = page.locator('[data-testid="category-icon"]');
    await expect(icons.first()).toBeVisible();
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to products page when category icon is clicked", async ({ page }) => {
    const firstIcon = page.locator('[data-testid="category-icon"]').first();
    await firstIcon.click();
    
    // Use toHaveURL to wait for client-side navigation to update the URL
    await expect(page).toHaveURL(/(\/products|\/buy)(\?category=|$)/);
  });

  test("should navigate to detail page when Discover button on product card is clicked", async ({ page }) => {
    // Locate the first product card discover button
    // The previous implementation used data-testid="add-to-cart" but the text was "Khám phá"
    const discoverBtn = page.locator('[data-testid="add-to-cart"]').first();
    await expect(discoverBtn).toBeVisible();

    // Click the Discover button
    await discoverBtn.click();
    await page.waitForLoadState("domcontentloaded");

    // Check if URL switched to detail page (/products/[id])
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);

    // Verify that the cart badge count is still empty (or 0)
    // to confirm that clicking 'Discover' did NOT add the product to the cart
    const cartBadge = page.locator('[data-testid="cart-count"]');
    if (await cartBadge.isVisible()) {
      await expect(cartBadge).toHaveText("0");
    }
  });
});
