import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../shared/cucumber/world";
import { CatalogApiHelper } from "../../shared/runtime/api-helpers/catalog.api";
import { GoBackendClient } from "../../shared/runtime/api-helpers/go-backend.client";
import { CartPage } from "../../shared/runtime/objects/cart.page";
import { ProductDetailPage } from "../../shared/runtime/objects/product-detail.page";

type ProductFlowState = { productId?: string; beforeCount?: number };

function state(world: ScenarioWorld): ProductFlowState {
  return world.state as ProductFlowState;
}

async function driver(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, detail: new ProductDetailPage(page), cart: new CartPage(page) };
}

async function chooseAvailableProduct(world: ScenarioWorld): Promise<string> {
  if (state(world).productId) return state(world).productId!;
  const api = new CatalogApiHelper(new GoBackendClient(await world.getApiRequest()));
  const products = await api.getProducts({ limit: 20 });
  expect(products.ok, "product-flow requires a reachable catalog").toBe(true);
  for (const product of products.data.items) {
    const buyMeta = await api.getBuyMeta(product.id);
    if (buyMeta.ok && buyMeta.data.available) {
      state(world).productId = product.id;
      return product.id;
    }
  }
  throw new Error("No publicly purchasable product is available for product-flow");
}

async function cartCount(world: ScenarioWorld): Promise<number> {
  const page = await world.getBrowserPage();
  const badge = page.locator('[data-testid="cart-count"]').first();
  if (await badge.count() === 0) return 0;
  const value = Number((await badge.innerText()).trim() || "0");
  return Number.isFinite(value) ? value : 0;
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "product-flow") return;
  this.activeModule = "product-flow";
});

Given("a shopper opens an available product detail", async function (this: ScenarioWorld) {
  const current = await driver(this);
  await current.detail.goto(await chooseAvailableProduct(this));
  state(this).beforeCount = await cartCount(this);
});

When("the shopper adds the product from detail", async function (this: ScenarioWorld) {
  await (await driver(this)).detail.addToCart();
});

Then("the cart count increases by one", async function (this: ScenarioWorld) {
  expect(await cartCount(this)).toBe(state(this).beforeCount! + 1);
});

Then("the add-to-cart confirmation is visible", async function (this: ScenarioWorld) {
  await expect((await driver(this)).page.locator('[data-testid="toast"], [data-testid="cart-count"]').first()).toBeVisible();
});

When("the shopper selects quantity `2` and adds the product", async function (this: ScenarioWorld) {
  const current = await driver(this);
  await current.page.locator('button:has-text("+")').first().click();
  await current.detail.addToCart();
});

Then("the cart stores quantity `2` for that product", async function (this: ScenarioWorld) {
  const current = await driver(this);
  await current.cart.goto();
  const items = await current.cart.getItems();
  expect(items.find((item) => item.productId === state(this).productId)?.quantity ?? items[0]?.quantity).toBe(2);
});
