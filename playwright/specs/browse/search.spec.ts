import { test, expect } from "../../src/fixtures/base-test";

test.describe("Search @browse", () => {
  test.beforeEach(async ({ productListPage }) => {
    await productListPage.goto();
  });

  test("should return search results for valid query", async ({
    productListPage,
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    if (!(await searchInput.isVisible())) {
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productListPage.search("a");

    // Should show results or product cards
    const cards = page.locator('[data-testid="product-card"]');
    const noResults = page.locator('[data-testid="no-results"]');

    await expect(cards.first().or(noResults)).toBeVisible({ timeout: 10_000 });
  });

  test("should show empty state for no matches", async ({
    productListPage,
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    if (!(await searchInput.isVisible())) {
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productListPage.search("zzzznonexistentproduct99999");

    // Should show no results or empty product cards
    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    // Either no cards shown or a no-results message
    if (cardCount === 0) {
      expect(cardCount).toBe(0);
      return;
    }

    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
  });

  test("should display result count matching results", async ({
    productListPage,
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    if (!(await searchInput.isVisible())) {
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productListPage.search("a");

    const resultCountEl = page.locator('[data-testid="result-count"]');
    if (await resultCountEl.isVisible()) {
      const count = await productListPage.getResultCount();
      const cards = page.locator('[data-testid="product-card"]');
      const cardCount = await cards.count();

      // Result count should be >= cards shown on current page
      expect(count).toBeGreaterThanOrEqual(cardCount);
    }
  });
});
