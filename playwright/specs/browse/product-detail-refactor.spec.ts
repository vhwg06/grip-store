import { test, expect } from "../../src/fixtures/base-test";
import type { APIRequestContext } from "@playwright/test";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

async function getFirstProductIdOrNull(
  request: APIRequestContext
): Promise<string | null> {
  const client = new GoBackendClient(request);
  const catalogApi = new CatalogApiHelper(client);
  const products = await catalogApi.getProducts({ limit: 1 });
  expect(products.ok).toBeTruthy();
  return products.data.items[0]?.id ?? null;
}

test.describe("Product Detail Refactored Flow @browse", () => {
  test("should render product specs table", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) return;

    await productDetailPage.goto(productId);

    // Verify title and price are present
    const title = await productDetailPage.getProductTitle();
    expect(title).toBeTruthy();

    const price = await productDetailPage.getPrice();
    expect(price).toBeTruthy();

    // Verify specs table is visible
    const specsTable = page.locator('[data-testid="product-specs-table"]');
    await expect(specsTable).toBeVisible();

    // Verify it contains spec rows (at least one key-value pair)
    const specRows = specsTable.locator('tr, div[role="row"]');
    const rowCount = await specRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should allow adding to cart from detail page", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) return;

    await productDetailPage.goto(productId);

    // Click add to cart button
    await productDetailPage.addToCart();

    // Verify cart count badge increments
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText("1");
  });
});
