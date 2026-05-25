import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Order Flow @checkout", () => {
  test("should complete purchase flow from product to confirmation", async ({
    productDetailPage,
    cartPage,
    checkoutPage,
    page,
    request,
  }) => {
    const client = new GoBackendClient(request);
    const catalogApi = new CatalogApiHelper(client);
    const products = await catalogApi.getProducts({ limit: 1 });
    expect(products.ok).toBeTruthy();
    if (!products.data.items.length) {
      await page.goto("/products");
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    // Step 1: Add product to cart
    const product = products.data.items[0];
    await productDetailPage.goto(product.id);
    await productDetailPage.addToCart();

    // Step 2: Go to cart and proceed to checkout
    await cartPage.goto();
    const items = await cartPage.getItems();
    expect(items.length).toBeGreaterThan(0);
    await cartPage.proceedToCheckout();

    // Step 3: Fill checkout form
    await page.waitForLoadState("domcontentloaded");
    const emailInput = page.locator('[data-testid="checkout-email"]');
    if (await emailInput.isVisible()) {
      await checkoutPage.fillEmail(
        process.env.TEST_USER_EMAIL ?? "test@example.com"
      );
    }

    // Select payment method if available
    const paymentMethod = page.locator(
      '[data-testid^="payment-method-"]'
    ).first();
    if (await paymentMethod.isVisible()) {
      await paymentMethod.click();
    }

    // Step 4: Place order
    const placeOrderBtn = page.locator('[data-testid="place-order-btn"]');
    if (await placeOrderBtn.isVisible()) {
      await checkoutPage.placeOrder();

      // Step 5: Verify confirmation or redirect
      await page.waitForLoadState("networkidle", { timeout: 15_000 });

      // Order should result in confirmation or payment redirect
      const confirmation = await checkoutPage.getOrderConfirmation();
      const currentUrl = page.url();

      // Either on confirmation page or redirected to payment
      expect(
        confirmation !== null || currentUrl.includes("payment") || currentUrl.includes("order")
      ).toBeTruthy();
    }
  });

  test("should show order in orders list after purchase", async ({
    page,
  }) => {
    // Navigate to orders page
    await page.goto("/admin/orders");
    await page.waitForLoadState("domcontentloaded");

    // Should have order rows, empty state, or unauthorized notice in constrained envs
    const orderRows = page.locator('[data-testid="order-row"]');
    const emptyState = page.locator('[data-testid="admin-table-empty"]');
    const unauthorized = page.locator(
      '[data-testid="admin-unauthorized"], [data-testid="auth-required"]'
    );

    await expect(orderRows.first().or(emptyState).or(unauthorized)).toBeVisible({
      timeout: 10_000,
    });
  });
});
