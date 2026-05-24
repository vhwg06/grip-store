import { test, expect } from "../../src/fixtures/base-test";

test.describe("Product List @browse", () => {
  test.beforeEach(async ({ productListPage }) => {
    await productListPage.goto();
  });

  test("should render product cards", async ({ productListPage }) => {
    const products = await productListPage.getProductCards();
    expect(products.length).toBeGreaterThan(0);

    // Verify card shape
    const first = products[0];
    expect(first.id).toBeTruthy();
    expect(first.title).toBeTruthy();
    expect(first.price).toBeTruthy();
  });

  test("should filter by category", async ({ productListPage, page }) => {
    // Check if category filters exist
    const filterBtns = page.locator('[data-testid^="category-filter-"]');
    const filterCount = await filterBtns.count();
    test.skip(filterCount === 0, "No category filters available");

    const firstFilter = filterBtns.first();
    const categorySlug = (await firstFilter.getAttribute("data-testid"))?.replace(
      "category-filter-",
      ""
    );

    if (categorySlug) {
      await productListPage.filterByCategory(categorySlug);
      // After filtering, page should still have products or show empty state
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
    }
  });

  test("should sort by price", async ({ productListPage, page }) => {
    const sortSelect = page.locator('[data-testid="sort-select"]');
    test.skip(!(await sortSelect.isVisible()), "Sort select not visible");

    await productListPage.sortBy("price_asc");
    const products = await productListPage.getProductCards();

    if (products.length >= 2) {
      // Verify order is ascending
      const prices = products.map((p) =>
        parseFloat(p.price.replace(/[^0-9.]/g, ""))
      );
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    }
  });

  test("should navigate pagination", async ({ productListPage, page }) => {
    const pagination = page.locator('[data-testid="pagination"]');
    test.skip(!(await pagination.isVisible()), "No pagination visible");

    const page2Btn = page.locator('[data-testid="page-2"]');
    test.skip(!(await page2Btn.isVisible()), "Only one page");

    await productListPage.goToPage(2);
    const products = await productListPage.getProductCards();
    expect(products.length).toBeGreaterThan(0);
  });
});
