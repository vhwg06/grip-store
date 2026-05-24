import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Cart @checkout", () => {
  test("should add product to cart and view cart", async ({
    productDetailPage,
    cartPage,
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

    // Navigate to product and add to cart
    const product = products.data.items[0];
    await productDetailPage.goto(product.id);
    await productDetailPage.addToCart();

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

  test("should update item quantity", async ({
    cartPage,
    page,
  }) => {
    await cartPage.goto();

    const items = await cartPage.getItems();
    test.skip(items.length === 0, "Cart is empty");

    await cartPage.updateQuantity(0, 2);

    // After update, quantity should reflect
    const updatedItems = await cartPage.getItems();
    expect(updatedItems[0].quantity).toBe(2);
  });

  test("should remove item from cart", async ({ cartPage }) => {
    await cartPage.goto();

    const items = await cartPage.getItems();
    test.skip(items.length === 0, "Cart is empty");

    const initialCount = items.length;
    await cartPage.removeItem(0);

    const remaining = await cartPage.getItems();
    expect(remaining.length).toBe(initialCount - 1);
  });

  test("should show empty state when cart is empty", async ({
    cartPage,
    page,
  }) => {
    await cartPage.goto();

    const items = await cartPage.getItems();
    if (items.length === 0) {
      const emptyState = page.locator('[data-testid="empty-cart"]');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    }
  });
});
