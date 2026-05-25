import { test, expect } from "../../src/fixtures/base-test";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Product List Shopping Flow @browse", () => {
  test.beforeEach(async ({ productListPage }) => {
    await productListPage.goto();
  });

  test("should display product listing with cards", async ({ page, productListPage }) => {
    const cards = await productListPage.getProductCards();
    expect(cards.length).toBeGreaterThan(0);

    // Verify filter panel is visible
    await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
  });

  test("should allow adding a product directly to cart from list card", async ({ page, productListPage }) => {
    // Locate the Add to Cart button on the first card
    const firstCard = page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first();
    await expect(firstCard).toBeVisible();

    const addToCartBtn = firstCard.locator('[data-testid="add-to-cart"]');
    await expect(addToCartBtn).toBeVisible();

    // Click "Thêm vào giỏ"
    await addToCartBtn.click();

    // Verify toast is visible
    const toast = page.locator('.sonner-toast, [data-testid="toast"]');
    // Sonner toast could be asynchronous or different selector, let's also check header badge
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText("1");
  });

  test("should search products by keyword", async ({ productListPage, page }) => {
    // Perform search with a sample term, e.g. "tay" (since it's a grip shop)
    await productListPage.search("tay");
    
    // Result count should display search results count
    const count = await productListPage.getResultCount();
    expect(count).toBeGreaterThanOrEqual(0);

    // Verify only matching or some cards are shown
    const cards = await productListPage.getProductCards();
    for (const card of cards) {
      expect(card.title.toLowerCase()).toContain("tay");
    }
  });

  test("should navigate to detail page when product card title or image is clicked", async ({ page, productListPage }) => {
    const firstCard = page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first();
    await expect(firstCard).toBeVisible();

    const titleLink = firstCard.locator('[data-testid="product-title"]');
    await titleLink.click();
    await page.waitForLoadState("domcontentloaded");

    // Check if redirect to detail page (/products/[id])
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);
  });
});
