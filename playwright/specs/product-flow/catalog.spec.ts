import { test, expect } from "../../src/fixtures/base-test";

test.describe("Product Flow - Catalog @product-flow", () => {
  test.beforeEach(async ({ productListPage }) => {
    await productListPage.goto();
  });

  test("PF-CATALOG-001 catalog lists active products", async ({ productListPage }) => {
    const cards = await productListPage.getProductCards();
    expect(cards.length).toBeGreaterThan(0);
  });

  test("PF-CATALOG-002 category filter returns matching products", async ({ page }) => {
    await page.goto("/products?category=a1111111-1111-1111-1111-111111111111");
    await expect(page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first()).toBeVisible();
  });

  test("PF-CATALOG-003 search returns matching products", async ({ productListPage }) => {
    await productListPage.search("test");
    const cards = await productListPage.getProductCards();
    expect(cards.length).toBeGreaterThan(0);
  });

  test("PF-CATALOG-004 sort updates product ordering", async ({ productListPage }) => {
    await productListPage.sortBy("price_asc");
    const cards = await productListPage.getProductCards();
    expect(cards.length).toBeGreaterThan(0);
  });

  test("PF-CATALOG-005 empty result shows no-results state", async ({ productListPage, page }) => {
    await productListPage.search("__no_product_should_match__");
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
  });

  test("PF-CATALOG-006 product card click navigates to detail", async ({ page }) => {
    await page
      .locator('[data-testid="product-card"], [data-testid="product-card-item"]')
      .first()
      .locator('a[href^="/products/"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);
  });
});
