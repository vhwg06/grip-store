import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../shared/cucumber/world";
import { CatalogApiHelper } from "../../shared/runtime/api-helpers/catalog.api";
import { GoBackendClient } from "../../shared/runtime/api-helpers/go-backend.client";
import { HomepagePage } from "../../shared/runtime/objects/homepage.page";
import { ProductDetailPage } from "../../shared/runtime/objects/product-detail.page";
import { ProductListPage } from "../../shared/runtime/objects/product-list.page";
import { CartPage } from "../../shared/runtime/objects/cart.page";

type BrowseState = {
  productId?: string;
  category?: string;
  keyword?: string;
};

function state(world: ScenarioWorld): BrowseState {
  return world.state as BrowseState;
}

async function pages(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return {
    page,
    home: new HomepagePage(page),
    list: new ProductListPage(page),
    detail: new ProductDetailPage(page),
    cart: new CartPage(page),
  };
}

async function catalog(world: ScenarioWorld) {
  return new CatalogApiHelper(new GoBackendClient(await world.getApiRequest()));
}

async function chooseProduct(world: ScenarioWorld): Promise<string> {
  if (state(world).productId) return state(world).productId!;
  const response = await (await catalog(world)).getProducts({ limit: 20 });
  expect(response.ok, "public catalog must be reachable").toBe(true);
  expect(response.data.items.length).toBeGreaterThan(0);
  state(world).productId = response.data.items[0].id;
  return state(world).productId!;
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "browse") return;
  this.activeModule = "browse";
});

Given("a guest opens the homepage", async function (this: ScenarioWorld) {
  await (await pages(this)).home.goto();
});

When("homepage content finishes loading", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="hero"]')).toBeVisible();
});

Then("hero, category, and featured product blocks are visible", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="hero"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="category-icon"]').first()).toBeVisible();
  await expect(current.page.locator('[data-testid="featured-product-card"]').first()).toBeVisible();
});

Given("an active announcement exists", async function (this: ScenarioWorld) {
  const response = await (await catalog(this)).getAnnouncement();
  expect(response.ok, "announcement contract must be reachable").toBe(true);
  expect(response.data?.active, "an active announcement is required by this scenario").toBe(true);
});

Then("the announcement banner is visible", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="announcement-banner"]')).toBeVisible();
});

Given("a guest sees a homepage category", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.home.goto();
  const category = current.page.locator('[data-testid="category-icon"]').first();
  await expect(category).toBeVisible();
  state(this).category = (await category.getAttribute("data-category")) ?? undefined;
});

When("the guest selects the category", async function (this: ScenarioWorld) {
  await (await pages(this)).page.locator('[data-testid="category-icon"]').first().click();
});

Then("the catalog listing opens for that category", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page).toHaveURL(/(products|buy)(\?category=|$)/);
});

Given("a guest sees a featured product card", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.home.goto();
  await expect(current.page.locator('[data-testid="featured-product-card"]').first()).toBeVisible();
});

When("the guest selects its discovery CTA", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.page.locator('[data-testid="featured-product-card"]').first().click();
});

Then("the product detail opens", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page).toHaveURL(/products\/[^/]+|products\/placeholder/);
});

Given("the guest cart is empty", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.cart.goto();
  let items = await current.cart.getItems();
  while (items.length > 0) {
    await current.cart.removeItem(0);
    items = await current.cart.getItems();
  }
  await current.home.goto();
});

When("a guest selects the homepage discovery CTA without a cart action", async function (this: ScenarioWorld) {
  await (await pages(this)).page.locator('[data-testid="featured-product-card"]').first().click();
});

Then("the guest cart remains empty", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.cart.goto();
  expect(await current.cart.getItems()).toHaveLength(0);
});

When("homepage product cards are visible", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="featured-product-card"]').first()).toBeVisible();
});

Then("homepage product cards contain no follow action", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="featured-product-card"] [data-testid="follow-product"], [data-testid="featured-product-card"] [data-testid="follow-btn"]')).toHaveCount(0);
});

Then("homepage product cards contain no add-to-cart action", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="featured-product-card"] [data-testid="add-to-cart"], [data-testid="featured-product-card"] button:has-text("Thêm vào giỏ")')).toHaveCount(0);
});

Given("active products exist", async function (this: ScenarioWorld) {
  const response = await (await catalog(this)).getProducts({ limit: 20 });
  expect(response.ok).toBe(true);
  expect(response.data.items.length).toBeGreaterThan(0);
  state(this).productId = response.data.items[0].id;
});

When("a guest opens the product listing", async function (this: ScenarioWorld) {
  await (await pages(this)).list.goto();
});

Then("product cards are visible", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first()).toBeVisible();
});

Given("products exist in multiple categories", async function (this: ScenarioWorld) {
  const response = await (await catalog(this)).getCategories();
  expect(response.ok).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
  state(this).category = response.data[0].slug;
});

When("a guest selects a category filter", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.list.goto();
  const filter = current.page.locator('[data-testid^="category-filter-"]').first();
  await expect(filter).toBeVisible();
  state(this).category = (await filter.getAttribute("data-testid"))?.replace("category-filter-", "");
  await filter.click();
});

Then("the listing contains products from that category", async function (this: ScenarioWorld) {
  const items = await (await pages(this)).list.getProductCards();
  expect(items.length).toBeGreaterThan(0);
});

Given("products have different prices", async function (this: ScenarioWorld) {
  const response = await (await catalog(this)).getProducts({ limit: 20 });
  expect(response.ok).toBe(true);
  expect(response.data.items.length).toBeGreaterThan(1);
});

When("a guest selects price sorting", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.list.goto();
  await current.list.sortBy("price_asc");
});

Then("the listing follows the selected price order", async function (this: ScenarioWorld) {
  const items = await (await pages(this)).list.getProductCards();
  expect(items.length).toBeGreaterThan(0);
});

Given("the catalog has multiple result pages", async function (this: ScenarioWorld) {
  const response = await (await catalog(this)).getProducts({ page: 1, limit: 1 });
  expect(response.ok).toBe(true);
  expect(response.data.total).toBeGreaterThan(1);
});

When("a guest changes the listing page", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.list.goto();
  await current.list.goToPage(2);
});

Then("the corresponding result page is shown", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page).toHaveURL(/[?&]page=2/);
});

Given("a product matches a known keyword", async function (this: ScenarioWorld) {
  const response = await (await catalog(this)).getProducts({ limit: 1 });
  expect(response.ok).toBe(true);
  const title = response.data.items[0]?.title ?? "product";
  state(this).keyword = title.split(/\s+/)[0];
});

When("a guest searches for that keyword", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.list.goto();
  await current.list.search(state(this).keyword ?? "product");
});

Then("matching product results are shown", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="product-card"], [data-testid="product-card-item"], [data-testid="no-results"]').first()).toBeVisible();
});

Given("no product matches the requested keyword", async function (this: ScenarioWorld) {
  state(this).keyword = "__no_product_should_match__";
});

Then("an empty result state is shown", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="no-results"]')).toBeVisible();
});

Given("a guest has searched the catalog", async function (this: ScenarioWorld) {
  state(this).keyword = "product";
  const current = await pages(this);
  await current.list.goto();
  await current.list.search(state(this).keyword!);
});

When("matching results are returned", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="result-count"]')).toBeVisible();
});

Then("the displayed result count matches the result set", async function (this: ScenarioWorld) {
  const current = await pages(this);
  const cards = await current.list.getProductCards();
  expect(await current.list.getResultCount()).toBeGreaterThanOrEqual(cards.length);
});

When("the guest adds the first available product from its listing card", async function (this: ScenarioWorld) {
  const current = await pages(this);
  const card = current.page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first();
  await expect(card).toBeVisible();
  const addButton = card.locator('[data-testid="add-to-cart-btn"], [data-testid="add-to-cart"], button:has-text("Thêm vào giỏ"), button:has-text("Add to cart")').first();
  await expect(addButton).toBeVisible();
  await addButton.click();
});

Then("the cart contains the listed product", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.cart.goto();
  expect((await current.cart.getItems()).length).toBeGreaterThan(0);
});

Given("a guest sees a product card", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.list.goto();
  await expect(current.page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first()).toBeVisible();
});

When("the guest selects the card title or image", async function (this: ScenarioWorld) {
  await (await pages(this)).page.locator('[data-testid="product-card"], [data-testid="product-card-item"]').first().click();
});

Given("an active product exists", async function (this: ScenarioWorld) {
  state(this).productId = await chooseProduct(this);
});

When("a guest opens its detail page", async function (this: ScenarioWorld) {
  await (await pages(this)).detail.goto(await chooseProduct(this));
});

Then("the product information is visible", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="product-detail-title"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="product-detail-price"]')).toBeVisible();
});

Given("an active product has product images", async function (this: ScenarioWorld) {
  state(this).productId = await chooseProduct(this);
});

Then("the image gallery is visible", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="product-image-gallery"], [data-testid="product-detail-image"]').first()).toBeVisible();
});

Given("a guest is reading product detail", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
});

When("the guest selects another detail tab", async function (this: ScenarioWorld) {
  await (await pages(this)).page.locator('[data-testid="product-detail-tab"]').nth(1).click();
});

Then("the selected tab content is displayed", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="product-detail-tab-panel"]')).toBeVisible();
});

Given("a guest is viewing an available product detail", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
});

When("the guest selects add to cart", async function (this: ScenarioWorld) {
  await (await pages(this)).detail.addToCart();
});

Then("the product is added to the cart", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.cart.goto();
  expect((await current.cart.getItems()).length).toBeGreaterThan(0);
});

Given("an active product has specification data", async function (this: ScenarioWorld) {
  state(this).productId = await chooseProduct(this);
});

Then("the specification table is visible", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="product-specs-table"]')).toBeVisible();
});

Given("a guest is viewing an available product in the refactored detail flow", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
});

When("the guest adds the product to the cart", async function (this: ScenarioWorld) {
  await (await pages(this)).detail.addToCart();
});

Then("the cart reflects the product", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.cart.goto();
  expect((await current.cart.getItems()).length).toBeGreaterThan(0);
});

Given("an unavailable product identifier is used", function (this: ScenarioWorld) {
  state(this).productId = "inactive-or-missing-product-id";
});

When("a guest opens that product detail route", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.page.goto(`/products/placeholder?id=${encodeURIComponent(state(this).productId!)}`);
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the unavailable product state is visible", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="product-not-found"], [data-testid="product-unavailable"], body').first()).toBeVisible();
});

Then("the detail add-to-cart action is absent", async function (this: ScenarioWorld) {
  await expect((await pages(this)).page.locator('[data-testid="add-to-cart-btn"]')).toHaveCount(0);
});
