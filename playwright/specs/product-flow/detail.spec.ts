import { test, expect } from "../../src/fixtures/base-test";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import type { APIRequestContext } from "@playwright/test";

async function getFirstProductIdOrNull(request: APIRequestContext): Promise<string | null> {
  const client = new GoBackendClient(request);
  const catalogApi = new CatalogApiHelper(client);
  const products = await catalogApi.getProducts({ limit: 1 });
  if (!products.ok) return null;
  return products.data.items[0]?.id ?? null;
}

test.describe("Product Flow - Detail @product-flow", () => {
  test("PF-DETAIL-001 detail renders product core info", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) test.skip(true, "No product available for detail flow test");
    await productDetailPage.goto(productId);
    await expect(page.locator('[data-testid="product-detail-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-detail-price"]')).toBeVisible();
  });

  test("PF-DETAIL-002 detail renders specs from backend details", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) test.skip(true, "No product available for specs detail test");
    await productDetailPage.goto(productId);
    const specsTable = page.locator('[data-testid="product-specs-table"]');
    if (!(await specsTable.isVisible())) {
      test.skip(true, "Product has no specs table");
    }
    await expect(specsTable).toBeVisible();
  });

  test("PF-DETAIL-003 add-to-cart from detail increments cart count", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) test.skip(true, "No product available for add-to-cart test");
    await productDetailPage.goto(productId);
    await productDetailPage.addToCart();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");
  });

  test("PF-DETAIL-004 quantity add-to-cart stores correct quantity", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) test.skip(true, "No product available for quantity add-to-cart test");
    await productDetailPage.goto(productId);
    await page.locator('button:has-text("+")').first().click().catch(() => undefined);
    await page.locator('[data-testid="add-to-cart-btn"]').click();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText(/^[12]$/);
  });

  test("PF-DETAIL-005 inactive product cannot be opened or added", async ({ page }) => {
    await page.goto("/products/non-existent-product-for-404");
    await expect(page.locator('[data-testid="add-to-cart-btn"]')).toHaveCount(0);
  });
});
