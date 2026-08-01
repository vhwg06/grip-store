import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { CatalogApiHelper, type Product, type PaginatedResponse } from "../../../shared/runtime/api-helpers/catalog.api";

type PublicQueryState = {
  api: CatalogApiHelper;
  list?: PaginatedResponse<Product>;
  product?: Product;
  category?: string;
  keyword?: string;
  search?: Product[];
  detail?: { status: number; data: unknown };
  buyMeta?: { status: number; data: unknown };
};

function state(world: ScenarioWorld): PublicQueryState {
  const current = world.state as Partial<PublicQueryState>;
  if (!current.api) current.api = new CatalogApiHelper(world.getApiClient() as never);
  return current as PublicQueryState;
}

async function api(world: ScenarioWorld): Promise<CatalogApiHelper> {
  const current = state(world);
  current.api ??= new CatalogApiHelper(await world.getApiClient());
  return current.api;
}

async function loadProducts(world: ScenarioWorld, params?: Parameters<CatalogApiHelper["getProducts"]>[0]) {
  const response = await (await api(world)).getProducts(params);
  expect(response.ok, "public catalog API must be reachable").toBe(true);
  state(world).list = response.data;
  return response.data;
}

async function chooseProduct(world: ScenarioWorld): Promise<Product> {
  if (state(world).product) return state(world).product!;
  const list = await loadProducts(world, { limit: 20 });
  expect(list.items.length, "a public product is required").toBeGreaterThan(0);
  state(world).product = list.items[0];
  return state(world).product!;
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "catalog.public-query") return;
  this.activeModule = "catalog.public-query";
});

Given("active and inactive catalog products are available to query", async function (this: ScenarioWorld) {
  await loadProducts(this, { limit: 20 });
});

Given("the public catalog can return products", async function (this: ScenarioWorld) {
  await loadProducts(this, { limit: 20 });
});

When("the shopper reads the public product list", async function (this: ScenarioWorld) {
  await loadProducts(this);
});

Then("the public product list response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).list).toBeTruthy();
});

Then("the public product list contains `items`, `page`, `limit`, and `total`", async function (this: ScenarioWorld) {
  const list = state(this).list! as unknown as Record<string, unknown>;
  for (const key of ["items", "page", "limit", "total"]) expect(list[key]).toBeDefined();
});

Then("inactive catalog products are absent from the public product list", async function (this: ScenarioWorld) {
  expect(state(this).list!.items.every((item) => item.active !== false)).toBe(true);
});

When("the shopper reads page `1` with limit `5`", async function (this: ScenarioWorld) {
  await loadProducts(this, { page: 1, limit: 5 });
});

Then("the public product list contains no more than `5` items", async function (this: ScenarioWorld) {
  expect(state(this).list!.items.length).toBeLessThanOrEqual(5);
});

Given("an active public category exists", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getCategories();
  expect(response.ok).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
  state(this).category = response.data[0].slug;
});

When("the shopper reads the public product list for that category", async function (this: ScenarioWorld) {
  await loadProducts(this, { category: state(this).category, limit: 20 });
});

Then("every returned public product belongs to that category", async function (this: ScenarioWorld) {
  expect(state(this).list!.items.every((item) => item.category_id === state(this).category)).toBe(true);
});

Given("the public catalog contains products with different prices", async function (this: ScenarioWorld) {
  const list = await loadProducts(this, { limit: 20 });
  expect(new Set(list.items.map((item) => item.price)).size).toBeGreaterThan(1);
});

When("the shopper reads the public product list sorted by ascending price", async function (this: ScenarioWorld) {
  await loadProducts(this, { sort: "price_asc", limit: 20 });
});

Then("returned public product prices are in ascending order", async function (this: ScenarioWorld) {
  const prices = state(this).list!.items.map((item) => item.price);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

Given("a public product has a searchable title keyword", async function (this: ScenarioWorld) {
  const product = await chooseProduct(this);
  state(this).keyword = product.title.split(/\s+/)[0];
});

When("the shopper searches the public catalog by that keyword", async function (this: ScenarioWorld) {
  const response = await (await api(this)).search(state(this).keyword!);
  expect(response.ok).toBe(true);
  state(this).search = response.data;
});

Then("the public search response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).search).toBeDefined();
});

Then("every matching result contains the searched keyword", async function (this: ScenarioWorld) {
  const keyword = state(this).keyword!.toLowerCase();
  expect(state(this).search!.every((item) => item.title.toLowerCase().includes(keyword))).toBe(true);
});

Given("no public product has the reserved missing keyword", async function (this: ScenarioWorld) {
  state(this).keyword = "zzzznonexistentproduct99999";
});

When("the shopper searches the public catalog by the reserved missing keyword", async function (this: ScenarioWorld) {
  const response = await (await api(this)).search(state(this).keyword!);
  expect(response.ok).toBe(true);
  state(this).search = response.data;
});

Then("the public search result is an empty array", async function (this: ScenarioWorld) {
  expect(state(this).search).toEqual([]);
});

Given("an active public product exists", async function (this: ScenarioWorld) {
  await chooseProduct(this);
});

Given("an active public product has public specification data", async function (this: ScenarioWorld) {
  const product = await chooseProduct(this);
  const response = await (await api(this)).getProduct(product.id);
  expect(response.ok).toBe(true);
  expect((response.data as unknown as Record<string, unknown>).specs).toBeDefined();
  state(this).product = response.data;
});

When("the shopper reads its public product detail", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getProduct((await chooseProduct(this)).id);
  state(this).detail = { status: response.status, data: response.data };
});

Then("the public product detail response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).detail?.status).toBe(200);
});

Then("public product detail contains the product identity and core fields", async function (this: ScenarioWorld) {
  const data = state(this).detail!.data as Record<string, unknown>;
  expect(data.id).toBe((await chooseProduct(this)).id);
  for (const key of ["title", "price", "description"]) expect(data[key]).toBeDefined();
});

Then("public product detail contains images", async function (this: ScenarioWorld) {
  expect(Array.isArray((state(this).detail!.data as Record<string, unknown>).images)).toBe(true);
});

Then("public product detail contains specifications", async function (this: ScenarioWorld) {
  expect((state(this).detail!.data as Record<string, unknown>).specs).toBeDefined();
});

Then("public specifications contain at least one key and value", async function (this: ScenarioWorld) {
  const specs = (state(this).detail!.data as Record<string, unknown>).specs;
  expect(Array.isArray(specs) ? specs.length : Object.keys((specs ?? {}) as object).length).toBeGreaterThan(0);
});

Given("a public product identifier does not exist", async function (this: ScenarioWorld) {
  state(this).product = { id: "non-existent-product-12345" } as Product;
});

Given("an inactive or unavailable public product identifier is used", async function (this: ScenarioWorld) {
  state(this).product = { id: "inactive-or-missing-product-id" } as Product;
});

When("the shopper reads that public product detail", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getProduct(state(this).product!.id);
  state(this).detail = { status: response.status, data: response.data };
});

Then("the public product detail response status is `404`", async function (this: ScenarioWorld) {
  expect(state(this).detail?.status).toBe(404);
});

When("the shopper reads its public buy metadata", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getBuyMeta((await chooseProduct(this)).id);
  state(this).buyMeta = { status: response.status, data: response.data };
});

Then("the public buy metadata response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).buyMeta?.status).toBe(200);
});

Then("public buy metadata contains product identity, availability, and stock", async function (this: ScenarioWorld) {
  const data = state(this).buyMeta!.data as Record<string, unknown>;
  expect(data.product_id).toBeDefined();
  expect(typeof data.available).toBe("boolean");
  expect(data.stock).toBeDefined();
});

When("the shopper reads public catalog categories", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getCategories();
  state(this).search = response.data as unknown as Product[];
  expect(response.status).toBe(200);
});

Then("the public categories response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).search).toBeDefined();
});

Then("every public category has an id, name, and slug", async function (this: ScenarioWorld) {
  const categories = state(this).search as unknown as Array<Record<string, unknown>>;
  expect(categories.every((category) => category.id && category.name && category.slug)).toBe(true);
});

When("the shopper reads public catalog settings", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getSettings();
  state(this).detail = { status: response.status, data: response.data };
});

Then("the public settings response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).detail?.status).toBe(200);
});

Then("public settings contain site name and currency", async function (this: ScenarioWorld) {
  const data = state(this).detail!.data as Record<string, unknown>;
  expect(data.site_name).toBeDefined();
  expect(data.currency).toBeDefined();
});

When("the shopper reads the public catalog announcement", async function (this: ScenarioWorld) {
  const response = await (await api(this)).getAnnouncement();
  state(this).detail = { status: response.status, data: response.data };
});

Then("the public announcement response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).detail?.status).toBe(200);
});

Then("the public announcement is null or contains identity, content, and active state", async function (this: ScenarioWorld) {
  const data = state(this).detail!.data;
  if (data === null) return;
  const announcement = data as Record<string, unknown>;
  expect(announcement.id).toBeDefined();
  expect(announcement.content).toBeDefined();
  expect(typeof announcement.active).toBe("boolean");
});
