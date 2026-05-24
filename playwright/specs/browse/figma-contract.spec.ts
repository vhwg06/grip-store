import { test, expect } from "../../src/fixtures/base-test";

/**
 * Figma Trace:
 * - Homepage: 27:1404
 * - Product Listing: 58:861
 * - Product Detail: 62:2672
 * Requirement: smoke/layout visibility + CTA navigation mapping.
 */
test.describe("Figma Contract Browse @browse", () => {
  test("homepage should expose hero/category/featured blocks", async ({ homepagePage, page }) => {
    await homepagePage.goto();
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-icon"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="featured-product-card"]').first()).toBeVisible();
  });

  test("category CTA should navigate from homepage to listing", async ({ homepagePage, page }) => {
    await homepagePage.goto();
    await page.locator('[data-testid="category-icon"]').first().click();
    await expect(page).toHaveURL(/\/products/);
  });

  test("listing and detail should satisfy required sections", async ({ productListPage, productDetailPage, page }) => {
    await productListPage.goto();
    await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
    const firstCard = page.locator('[data-testid="product-card"]').first();
    await expect(firstCard).toBeVisible();

    const firstProductId = await firstCard.getAttribute("data-product-id");
    if (firstProductId) {
      await productDetailPage.goto(firstProductId);
    } else {
      await firstCard.locator('[data-testid="product-title"]').first().click();
    }

    await expect(page.locator('[data-testid="product-detail-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-detail-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-gallery"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();
  });
});
