import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

/**
 * Figma Trace:
 * - Cart: 114:3466
 * - Checkout: 117:4153
 * Requirement: browse -> add cart -> cart/checkout contract visibility.
 */
test.describe("Figma Contract Checkout @checkout", () => {
  test("cart route should expose cart total + checkout CTA", async ({ cartPage, page }) => {
    await cartPage.goto();
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-btn"]')).toBeVisible();
  });

  test("detail to cart to checkout should preserve core CTA flow", async ({ productDetailPage, cartPage, page, request }) => {
    const client = new GoBackendClient(request);
    const catalogApi = new CatalogApiHelper(client);
    const products = await catalogApi.getProducts({ limit: 1 });
    expect(products.ok).toBeTruthy();
    expect(products.data.items.length).toBeGreaterThan(0);

    await productDetailPage.goto(products.data.items[0].id);
    await page.locator('[data-testid="add-to-cart-btn"]').click();

    await cartPage.goto();
    await page.locator('[data-testid="checkout-btn"]').click();
    await expect(page).toHaveURL(/\/checkout/);

    await expect(page.locator('[data-testid="checkout-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-phone"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="place-order-btn"]')).toBeVisible();
  });
});
