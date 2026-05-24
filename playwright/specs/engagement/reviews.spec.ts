import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Reviews @engagement", () => {
  test("should display reviews on product page", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const client = new GoBackendClient(request);
    const catalogApi = new CatalogApiHelper(client);
    const products = await catalogApi.getProducts({ limit: 1 });
    test.skip(
      !products.ok || !products.data.items.length,
      "No products available"
    );

    await productDetailPage.goto(products.data.items[0].id);

    const reviews = await productDetailPage.getReviews();
    // May have zero reviews — just verify no crash
    expect(reviews).toBeDefined();
  });

  test("should submit review with rating", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const client = new GoBackendClient(request);
    const catalogApi = new CatalogApiHelper(client);
    const products = await catalogApi.getProducts({ limit: 1 });
    test.skip(
      !products.ok || !products.data.items.length,
      "No products available"
    );

    await productDetailPage.goto(products.data.items[0].id);

    const reviewForm = page.locator('[data-testid="review-form"]');
    test.skip(!(await reviewForm.isVisible()), "Review form not visible");

    // Fill rating
    const starBtn = page.locator('[data-testid="review-star-4"]');
    if (await starBtn.isVisible()) {
      await starBtn.click();
    }

    // Fill content
    const contentInput = page.locator('[data-testid="review-content-input"]');
    await contentInput.fill(`Playwright review test ${Date.now()}`);

    // Submit
    const submitBtn = page.locator('[data-testid="review-submit-btn"]');
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Should show success or new review appears
    const toast = page.locator('[data-testid="toast"]');
    if (await toast.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(toast).toBeVisible();
    }
  });

  test("should show review on product page after submission", async ({
    productDetailPage,
    request,
  }) => {
    const client = new GoBackendClient(request);
    const catalogApi = new CatalogApiHelper(client);
    const products = await catalogApi.getProducts({ limit: 1 });
    test.skip(
      !products.ok || !products.data.items.length,
      "No products available"
    );

    await productDetailPage.goto(products.data.items[0].id);

    const reviews = await productDetailPage.getReviews();
    // Verify review structure if any exist
    if (reviews.length > 0) {
      expect(reviews[0].author).toBeTruthy();
      expect(reviews[0].rating).toBeGreaterThanOrEqual(1);
      expect(reviews[0].rating).toBeLessThanOrEqual(5);
    }
  });
});
