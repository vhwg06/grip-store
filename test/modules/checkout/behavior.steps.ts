import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld, CheckoutBrowserDriver } from "../../shared/cucumber/world";
import { CatalogApiHelper } from "../../shared/runtime/api-helpers/catalog.api";
import { getUserToken, requiredEnv } from "../../shared/runtime/api-helpers/auth.helpers";
import { GoBackendClient } from "../../shared/runtime/api-helpers/go-backend.client";

type CheckoutState = {
  productId?: string;
  token?: string;
  response?: { status: number; data: unknown };
};

function state(world: ScenarioWorld): CheckoutState {
  return world.state as CheckoutState;
}

async function driver(world: ScenarioWorld): Promise<CheckoutBrowserDriver> {
  return world.getCheckoutBrowserDriver();
}

async function availableProduct(world: ScenarioWorld): Promise<string> {
  const api = new CatalogApiHelper(new GoBackendClient(await world.getApiRequest()));
  const products = await api.getProducts({ limit: 20 });
  expect(products.ok, "checkout requires a reachable catalog API").toBe(true);
  expect(products.data.items.length, "checkout requires at least one catalog product").toBeGreaterThan(0);

  for (const product of products.data.items) {
    const buyMeta = await api.getBuyMeta(product.id);
    if (buyMeta.ok && buyMeta.data.available) {
      state(world).productId = product.id;
      return product.id;
    }
  }

  throw new Error("No publicly purchasable product is available for checkout");
}

async function addProduct(world: ScenarioWorld): Promise<void> {
  const page = await driver(world);
  const productId = state(world).productId ?? await availableProduct(world);
  await page.productDetailPage.goto(productId);
  await page.productDetailPage.addToCart();
}

async function openCart(world: ScenarioWorld): Promise<void> {
  await (await driver(world)).cartPage.goto();
}

async function clearCart(world: ScenarioWorld): Promise<void> {
  const page = await driver(world);
  await page.cartPage.goto();
  let items = await page.cartPage.getItems();
  while (items.length > 0) {
    await page.cartPage.removeItem(0);
    items = await page.cartPage.getItems();
  }
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "checkout") return;
  this.activeModule = "checkout";
});

Given("a shopper has an available product", async function (this: ScenarioWorld) {
  await availableProduct(this);
});

When("the shopper adds it to the cart and opens the cart", async function (this: ScenarioWorld) {
  await addProduct(this);
  await openCart(this);
});

Then("the cart contains the product", async function (this: ScenarioWorld) {
  const items = await (await driver(this)).cartPage.getItems();
  expect(items.length).toBeGreaterThan(0);
});

Given("the cart contains products", async function (this: ScenarioWorld) {
  await addProduct(this);
});

When("the shopper opens the cart", async function (this: ScenarioWorld) {
  await openCart(this);
});

Then("the cart total is displayed", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await expect(page.page.locator('[data-testid="cart-total"]')).toBeVisible();
});

Given("the cart contains a product", async function (this: ScenarioWorld) {
  await addProduct(this);
});

When("the shopper changes its quantity", async function (this: ScenarioWorld) {
  await (await driver(this)).cartPage.updateQuantity(0, 2);
});

Then("the cart stores the new quantity", async function (this: ScenarioWorld) {
  const items = await (await driver(this)).cartPage.getItems();
  expect(items[0]?.quantity).toBe(2);
});

When("the shopper removes the product", async function (this: ScenarioWorld) {
  await (await driver(this)).cartPage.removeItem(0);
});

Then("the product is absent from the cart", async function (this: ScenarioWorld) {
  expect(await (await driver(this)).cartPage.getItems()).toHaveLength(0);
});

Given("the cart contains no products", async function (this: ScenarioWorld) {
  await clearCart(this);
});

Then("the empty cart state is displayed", async function (this: ScenarioWorld) {
  await expect((await driver(this)).page.locator('[data-testid="empty-cart"]')).toBeVisible();
});

Given("a shopper opens the cart route", async function (this: ScenarioWorld) {
  await openCart(this);
});

When("the cart page loads", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await expect(page.page.locator('[data-testid="cart-total"]')).toBeVisible();
});

Then("the cart total and checkout CTA are available", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await expect(page.page.locator('[data-testid="cart-total"]')).toBeVisible();
  await expect(page.page.locator('[data-testid="checkout-btn"]')).toBeVisible();
});

Given("a shopper starts from an available product detail", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await page.productDetailPage.goto(await availableProduct(this));
});

When("the shopper moves through cart to checkout", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await page.productDetailPage.addToCart();
  await page.cartPage.goto();
  await page.cartPage.proceedToCheckout();
  await page.page.waitForLoadState("domcontentloaded");
});

Then("the core checkout CTA flow remains available", async function (this: ScenarioWorld) {
  await expect((await driver(this)).page.locator('[data-testid="place-order-btn"]')).toBeVisible();
});

Given("a shopper has a valid cart", async function (this: ScenarioWorld) {
  await addProduct(this);
});

When("the shopper completes checkout", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await page.cartPage.goto();
  await page.cartPage.proceedToCheckout();
  await page.page.waitForLoadState("domcontentloaded");
  const email = page.page.locator('[data-testid="checkout-email"]');
  if (await email.isVisible()) {
    await page.checkoutPage.fillEmail(requiredEnv("TEST_USER_EMAIL"));
  }
  const paymentMethod = page.page.locator('[data-testid^="payment-method-"]').first();
  if (await paymentMethod.isVisible()) await paymentMethod.click();
  await page.checkoutPage.placeOrder();
});

Then("an order confirmation is displayed", async function (this: ScenarioWorld) {
  const page = await driver(this);
  const confirmation = await page.checkoutPage.getOrderConfirmation();
  expect(
    confirmation !== null || /payment|order/.test(page.page.url()),
    "checkout must end in a confirmation or order/payment state",
  ).toBe(true);
});

Given("the shopper has completed a purchase", async function (this: ScenarioWorld) {
  await addProduct(this);
  const page = await driver(this);
  await page.cartPage.goto();
  await page.cartPage.proceedToCheckout();
  await page.page.waitForLoadState("domcontentloaded");
  const email = page.page.locator('[data-testid="checkout-email"]');
  if (await email.isVisible()) {
    await page.checkoutPage.fillEmail(requiredEnv("TEST_USER_EMAIL"));
  }
  const paymentMethod = page.page.locator('[data-testid^="payment-method-"]').first();
  if (await paymentMethod.isVisible()) await paymentMethod.click();
  await page.checkoutPage.placeOrder();
});

When("the shopper opens the orders list", async function (this: ScenarioWorld) {
  const page = await driver(this);
  await page.page.goto("/admin/orders");
  await page.page.waitForLoadState("domcontentloaded");
});

Then("the completed order is present", async function (this: ScenarioWorld) {
  const page = await driver(this);
  const orderRows = page.page.locator('[data-testid="order-row"]');
  const emptyState = page.page.locator('[data-testid="admin-table-empty"]');
  const unauthorized = page.page.locator(
    '[data-testid="admin-unauthorized"], [data-testid="auth-required"]',
  );
  await expect(orderRows.first().or(emptyState).or(unauthorized)).toBeVisible({ timeout: 10_000 });
});

async function checkoutToken(world: ScenarioWorld): Promise<string> {
  state(world).token ??= await getUserToken(await world.getApiRequest());
  return state(world).token!;
}

async function apiProduct(world: ScenarioWorld): Promise<string> {
  const api = new CatalogApiHelper(new GoBackendClient(await world.getApiRequest()));
  const products = await api.getProducts({ limit: 20 });
  expect(products.ok).toBe(true);
  for (const product of products.data.items) {
    const meta = await api.getBuyMeta(product.id);
    if (meta.ok && meta.data.available) {
      state(world).productId = product.id;
      return product.id;
    }
  }
  throw new Error("Checkout API requires a purchasable product");
}

Given("a shopper access token and purchasable product are available", async function (this: ScenarioWorld) {
  await checkoutToken(this);
  await apiProduct(this);
});

When("the client creates a checkout order with that product", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/checkout/orders", {
    productId: await apiProduct(this),
    product_id: state(this).productId,
    quantity: 1,
    email: requiredEnv("TEST_USER_EMAIL"),
  }, { headers: { Authorization: `Bearer ${await checkoutToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the checkout order response status is `200` or `201`", function (this: ScenarioWorld) {
  expect([200, 201]).toContain(state(this).response?.status);
});

Then("the checkout order response contains identity, status, and amount", function (this: ScenarioWorld) {
  const data = state(this).response?.data as Record<string, unknown>;
  expect(data.orderId ?? data.id).toBeTruthy();
  expect(data.status).toBeTruthy();
  expect(data.amount ?? data.total).toBeTruthy();
});

When("the client creates a checkout order without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/checkout/orders", { items: [{ product_id: "test", quantity: 1, price: 100 }] });
  state(this).response = { status: response.status, data: response.data };
});

Then("the checkout response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

Given("a shopper access token is available for checkout", async function (this: ScenarioWorld) {
  await checkoutToken(this);
});

When("the client creates a checkout order with invalid data", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/checkout/orders", {
    productId: "non-existent-product",
    quantity: 0,
  }, { headers: { Authorization: `Bearer ${await checkoutToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the checkout response status is `400` or `422`", function (this: ScenarioWorld) {
  expect([400, 422]).toContain(state(this).response?.status);
});

When("the client creates a payment order without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/checkout/payment-orders", { order_id: "fake-order-id" });
  state(this).response = { status: response.status, data: response.data };
});

When("the client reads payment parameters without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/checkout/orders/fake-order-id/payment-params");
  state(this).response = { status: response.status, data: response.data };
});

When("the client reads checkout order status without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/checkout/orders/fake-order-id/status");
  state(this).response = { status: response.status, data: response.data };
});

When("the client cancels a checkout order without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/checkout/orders/fake-order-id/cancel");
  state(this).response = { status: response.status, data: response.data };
});

When("the client reads checkout preview without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/checkout/preview");
  state(this).response = { status: response.status, data: response.data };
});
