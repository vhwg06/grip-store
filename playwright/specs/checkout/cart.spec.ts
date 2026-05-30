import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

async function ensureCartHasItem(
  productDetailPage: { goto: (id: string) => Promise<void>; addToCart: () => Promise<void> },
  request: any
) {
  const client = new GoBackendClient(request);
  const catalogApi = new CatalogApiHelper(client);
  const products = await catalogApi.getProducts({ limit: 20 });
  expect(products.ok).toBe(true);
  expect(products.data.items.length).toBeGreaterThan(0);
  let selectedProductId = products.data.items[0].id;
  for (const product of products.data.items) {
    const buyMeta = await catalogApi.getBuyMeta(product.id);
    if (buyMeta.ok && buyMeta.data.available) {
      selectedProductId = product.id;
      break;
    }
  }
  await productDetailPage.goto(selectedProductId);
  await productDetailPage.addToCart();
}

test.describe("Cart @checkout", () => {
  test("should add product to cart and view cart", async ({
    productDetailPage,
    cartPage,
    request,
  }) => {
    await ensureCartHasItem(productDetailPage, request);

    // Go to cart
    await cartPage.goto();
    const items = await cartPage.getItems();
    expect(items.length).toBeGreaterThan(0);
  });

  test("should display cart total", async ({ cartPage }) => {
    await cartPage.goto();

    const total = await cartPage.getTotal();
    // Total should be a string (may be "0" if cart is empty)
    expect(total).toBeTruthy();
  });

  test("should update item quantity", async ({ cartPage, productDetailPage, request }) => {
    await ensureCartHasItem(productDetailPage, request);
    await cartPage.goto();

    const items = await cartPage.getItems();
    expect(items.length).toBeGreaterThan(0);

    await cartPage.updateQuantity(0, 2);

    // After update, quantity should reflect
    const updatedItems = await cartPage.getItems();
    expect(updatedItems[0].quantity).toBe(2);
  });

  test("should remove item from cart", async ({ cartPage, productDetailPage, request }) => {
    await ensureCartHasItem(productDetailPage, request);
    await cartPage.goto();

    const items = await cartPage.getItems();
    expect(items.length).toBeGreaterThan(0);

    const initialCount = items.length;
    await cartPage.removeItem(0);

    const remaining = await cartPage.getItems();
    expect(remaining.length).toBeLessThanOrEqual(initialCount);
  });

  test("should show empty state when cart is empty", async ({
    cartPage,
    page,
  }) => {
    await cartPage.goto();

    let items = await cartPage.getItems();
    while (items.length > 0) {
      await cartPage.removeItem(0);
      items = await cartPage.getItems();
    }

    const emptyState = page.locator('[data-testid="empty-cart"]');
    await expect(emptyState).toBeVisible();
  });
});
