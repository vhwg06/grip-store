import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { isolatedReference } from "../../../shared/data/test-isolation";
import { getAdminToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { CatalogApiHelper, type Product, type PaginatedResponse } from "../../../shared/runtime/api-helpers/catalog.api";
import { catalogBaseApi, entityId, listItems, record, type CatalogBaseApi, type JsonRecord } from "../../../shared/runtime/api-helpers/catalog-base.api";

type PublicQueryState = {
  api: CatalogApiHelper;
  list?: PaginatedResponse<Product>;
  product?: Product;
  category?: string;
  keyword?: string;
  search?: Product[];
  detail?: { status: number; data: unknown };
  buyMeta?: { status: number; data: unknown };
  baseApi?: CatalogBaseApi;
  baseToken?: string;
  baseCategoryId?: string;
  baseModelId?: string;
  baseVariantId?: string;
  baseDimensionId?: string;
  baseMaterialId?: string;
  baseFinishId?: string;
  baseResponse?: { status: number; data: unknown };
  baseSelected?: Record<string, string>;
};

function state(world: ScenarioWorld): PublicQueryState {
  return world.state as Partial<PublicQueryState> as PublicQueryState;
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

type PublicFixture = {
  modelId: string;
  variantId?: string;
  dimensionId?: string;
  materialId?: string;
  finishId?: string;
  selectedOptions: Record<string, string>;
};

async function baseApi(world: ScenarioWorld): Promise<CatalogBaseApi> {
  state(world).baseApi ??= catalogBaseApi(await world.getApiClient());
  return state(world).baseApi!;
}

async function baseToken(world: ScenarioWorld): Promise<string> {
  state(world).baseToken ??= await getAdminToken(await world.getApiRequest());
  return state(world).baseToken!;
}

function baseRemember(world: ScenarioWorld, response: { status: number; data: unknown }): void {
  state(world).baseResponse = { status: response.status, data: response.data };
}

function baseId(data: unknown, resource: string): string {
  const id = entityId(data);
  expect(id, `${resource} response must contain an id`).toBeTruthy();
  return id;
}

function baseName(world: ScenarioWorld, label: string): string {
  return isolatedReference(world, label);
}

async function createCategory(world: ScenarioWorld): Promise<string> {
  if (state(world).baseCategoryId) return state(world).baseCategoryId!;
  const response = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/categories", {
    name: baseName(world, "Public Category"),
    slug: baseName(world, "public-category").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
  });
  expect(response.status).toBe(201);
  state(world).baseCategoryId = baseId(response.data, "Category");
  return state(world).baseCategoryId!;
}

async function createMaster(world: ScenarioWorld, kind: "material" | "finish"): Promise<string> {
  const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/masters/${kind}`, { name: baseName(world, kind) });
  expect(response.status).toBe(201);
  return baseId(response.data, `${kind} master`);
}

async function createFixture(world: ScenarioWorld, options: {
  status?: "Draft" | "Active" | "Inactive" | "Discontinued";
  withVariant?: boolean;
  withMedia?: boolean;
  price?: number;
  values?: string[];
  fixedAttributes?: JsonRecord;
  withReferences?: boolean;
} = {}): Promise<PublicFixture> {
  const targetStatus = options.status ?? "Active";
  const withVariant = options.withVariant ?? true;
  const values = options.values ?? ["200 mm", "300 mm", "400 mm"];
  const materialId = options.withReferences ? await createMaster(world, "material") : undefined;
  const finishId = options.withReferences ? await createMaster(world, "finish") : undefined;
  const model = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/product-models", {
    name: baseName(world, `Public ProductModel ${targetStatus}`),
    categoryId: await createCategory(world),
    description: "Public Catalog Base projection",
    fixedAttributes: { ...(options.fixedAttributes ?? {}), ...(materialId ? { materialId } : {}), ...(finishId ? { finishId } : {}) },
  });
  expect(model.status).toBe(201);
  const modelId = baseId(model.data, "ProductModel");
  let dimensionId: string | undefined;
  let variantId: string | undefined;
  const selectedOptions = { Size: values[0] };
  if (withVariant) {
    const definition = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", {
      key: baseName(world, "public-size-definition").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      displayName: "Size",
      valueKind: "Enum",
    });
    expect(definition.status).toBe(201);
    const dimension = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/variant-dimensions`, {
      definitionId: baseId(definition.data, "Attribute definition"),
      allowedValues: values.map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, active: true })),
    });
    expect(dimension.status).toBe(201);
    dimensionId = baseId(dimension.data, "VariantDimension");
    const variant = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/variants`, {
      selectedOptions,
      sku: `PUB-${crypto.randomUUID()}`,
      sellingPrice: { amount: options.price ?? 400000, currency: "VND" },
    });
    expect(variant.status).toBe(201);
    variantId = baseId(variant.data, "Variant");
  }
  if (options.withMedia ?? withVariant) {
    const media = await (await baseApi(world)).adminPut(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/media`, {
      images: [{ url: `https://cdn.example.test/${modelId}.png`, ordering: 1, primary: true }],
    });
    expect(media.status).toBe(200);
  }
  if (targetStatus === "Active") {
    const publish = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/publish`);
    expect(publish.status).toBe(200);
  } else if (targetStatus === "Inactive") {
    const publish = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/publish`);
    expect(publish.status).toBe(200);
    const unpublish = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/unpublish`);
    expect(unpublish.status).toBe(200);
  } else if (targetStatus === "Discontinued") {
    const discontinue = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${modelId}/discontinue`);
    expect(discontinue.status).toBe(200);
  }
  return { modelId, variantId, dimensionId, materialId, finishId, selectedOptions };
}

async function activeFixture(world: ScenarioWorld, options: Parameters<typeof createFixture>[1] = {}): Promise<PublicFixture> {
  if (state(world).baseModelId) {
    return {
      modelId: state(world).baseModelId!,
      variantId: state(world).baseVariantId,
      dimensionId: state(world).baseDimensionId,
      materialId: state(world).baseMaterialId,
      finishId: state(world).baseFinishId,
      selectedOptions: state(world).baseSelected ?? { Size: "200 mm" },
    };
  }
  const fixture = await createFixture(world, { status: "Active", ...options });
  state(world).baseModelId = fixture.modelId;
  state(world).baseVariantId = fixture.variantId;
  state(world).baseDimensionId = fixture.dimensionId;
  state(world).baseMaterialId = fixture.materialId;
  state(world).baseFinishId = fixture.finishId;
  state(world).baseSelected = fixture.selectedOptions;
  return fixture;
}

Given("publicly sellable ProductModels have distinct Material, Finish, and SellingPrice values", async function (this: ScenarioWorld) {
  await activeFixture(this, { withReferences: true, price: 400000 });
});

When("the shopper filters the public catalog by Material, Finish, and SellingPrice", async function (this: ScenarioWorld) {
  const query = new URLSearchParams({ materialId: state(this).baseMaterialId!, finishId: state(this).baseFinishId!, minPrice: "100000", maxPrice: "500000" });
  const response = await (await baseApi(this)).publicGet(`/v1/catalog/product-models?${query.toString()}`);
  baseRemember(this, response);
});

Then("every returned ProductModel satisfies every requested filter", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  const items = listItems(state(this).baseResponse?.data);
  for (const item of items) {
    const fixed = record(item.fixedAttributes);
    expect(fixed.materialId).toBe(state(this).baseMaterialId);
    expect(fixed.finishId).toBe(state(this).baseFinishId);
    const variants = Array.isArray(item.variants) ? item.variants.map(record) : [];
    expect(variants.some((variant) => Number(record(variant.sellingPrice).amount) >= 100000 && Number(record(variant.sellingPrice).amount) <= 500000)).toBe(true);
  }
});

Then("no generic attribute filtering contract is exposed", function (this: ScenarioWorld) {
  const items = listItems(state(this).baseResponse?.data);
  for (const item of items) expect(item).not.toHaveProperty("genericAttributeFilters");
});

Given("an Active ProductModel has publicly sellable, inactive, and incompatible Variants", async function (this: ScenarioWorld) {
  const fixture = await activeFixture(this, { values: ["200 mm", "300 mm", "400 mm"] });
  const inactive = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${fixture.modelId}/variants`, {
    selectedOptions: { Size: "300 mm" }, sku: `PUB-${crypto.randomUUID()}`, sellingPrice: { amount: 400000, currency: "VND" },
  });
  expect(inactive.status).toBe(201);
  const inactiveId = baseId(inactive.data, "Variant");
  const deactivated = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/variants/${inactiveId}/inactivate`);
  expect(deactivated.status).toBe(200);
});

When("the shopper asks for available options after selecting one dimension value", async function (this: ScenarioWorld) {
  const selected = encodeURIComponent(JSON.stringify({ Size: "200 mm" }));
  const response = await (await baseApi(this)).publicGet(`/v1/catalog/product-models/${state(this).baseModelId}/options?selected=${selected}`);
  baseRemember(this, response);
});

Then("each returned option completes at least one publicly sellable Variant", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  expect(Array.isArray(record(state(this).baseResponse?.data).options)).toBe(true);
});

Then("options belonging only to inactive or incompatible Variants are absent", function (this: ScenarioWorld) {
  const options = record(state(this).baseResponse?.data).options as Array<Record<string, unknown>>;
  const labels = options.flatMap((option) => Array.isArray(option.values) ? option.values.map((value) => record(value).label) : []);
  expect(labels).not.toContain("300 mm");
  expect(labels).not.toContain("400 mm");
});

Given("an Active ProductModel has a publicly sellable canonical Variant combination", async function (this: ScenarioWorld) {
  await activeFixture(this, { values: ["200 mm", "300 mm"] });
});

When("the shopper resolves that exact selected combination", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).publicPost(`/v1/catalog/product-models/${state(this).baseModelId}/variants:resolve`, { selectedOptions: state(this).baseSelected ?? { Size: "200 mm" } });
  baseRemember(this, response);
});

Then("the public catalog returns that Variant", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  expect(entityId(state(this).baseResponse?.data)).toBe(state(this).baseVariantId);
});

When("the shopper resolves a missing or non-public combination", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).publicPost(`/v1/catalog/product-models/${state(this).baseModelId}/variants:resolve`, { selectedOptions: { Size: "999 mm" } });
  baseRemember(this, response);
});

Then("the public catalog does not return a Variant", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(404);
});

Given("the catalog contains Draft, Active, Inactive, and Discontinued ProductModels", async function (this: ScenarioWorld) {
  await createFixture(this, { status: "Draft", withVariant: false, withMedia: false });
  await createFixture(this, { status: "Active" });
  await createFixture(this, { status: "Inactive" });
  await createFixture(this, { status: "Discontinued" });
});

When("the shopper reads the public ProductModel list", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).publicGet("/v1/catalog/product-models");
  baseRemember(this, response);
});

Then("only Active ProductModels are returned", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  for (const item of listItems(state(this).baseResponse?.data)) expect(item.status).toBe("Active");
});

Then("every returned ProductModel has at least one publicly sellable Variant", function (this: ScenarioWorld) {
  for (const item of listItems(state(this).baseResponse?.data)) {
    const variants = Array.isArray(item.variants) ? item.variants.map(record) : [];
    expect(variants.some((variant) => variant.status === "Active" && variant.saleReady === true)).toBe(true);
  }
});

Then("stock and warehouse state are absent from the Catalog Base projection", function (this: ScenarioWorld) {
  for (const item of listItems(state(this).baseResponse?.data)) {
    for (const key of ["stock", "warehouse", "order", "purchaseLimit"]) expect(item).not.toHaveProperty(key);
  }
});

Given("publicly sellable ProductModels have distinct Material and Finish references", async function (this: ScenarioWorld) {
  await activeFixture(this, { withReferences: true });
});

When("the shopper filters by a Material and a Finish reference", async function (this: ScenarioWorld) {
  const query = new URLSearchParams({ materialId: state(this).baseMaterialId!, finishId: state(this).baseFinishId! });
  const response = await (await baseApi(this)).publicGet(`/v1/catalog/product-models?${query.toString()}`);
  baseRemember(this, response);
});

Then("every returned ProductModel matches both reference filters", function (this: ScenarioWorld) {
  for (const item of listItems(state(this).baseResponse?.data)) {
    const fixed = record(item.fixedAttributes);
    expect(fixed.materialId).toBe(state(this).baseMaterialId);
    expect(fixed.finishId).toBe(state(this).baseFinishId);
  }
});

Given("publicly sellable Variants have different current SellingPrice values", async function (this: ScenarioWorld) {
  await activeFixture(this, { price: 400000 });
});

When("the shopper filters by a SellingPrice range", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).publicGet("/v1/catalog/product-models?minPrice=300000&maxPrice=500000");
  baseRemember(this, response);
});

Then("every returned ProductModel has a publicly sellable Variant in that range", function (this: ScenarioWorld) {
  for (const item of listItems(state(this).baseResponse?.data)) {
    const variants = Array.isArray(item.variants) ? item.variants.map(record) : [];
    expect(variants.some((variant) => Number(record(variant.sellingPrice).amount) >= 300000 && Number(record(variant.sellingPrice).amount) <= 500000)).toBe(true);
  }
});

Given("an Active ProductModel has publicly sellable Variants and catalog media", async function (this: ScenarioWorld) {
  await activeFixture(this, { withMedia: true });
});

When("the shopper reads the public ProductModel detail", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).publicGet(`/v1/catalog/product-models/${state(this).baseModelId}`);
  baseRemember(this, response);
});

Then("the detail exposes model content, media, options, and current SellingPrice", function (this: ScenarioWorld) {
  const detail = record(state(this).baseResponse?.data);
  expect(detail.name).toBeDefined();
  expect(Array.isArray(detail.images)).toBe(true);
  expect(Array.isArray(detail.variants)).toBe(true);
  expect(record((detail.variants as unknown[])[0]).sellingPrice).toBeDefined();
});

Then("the detail does not expose stock, warehouse, order, or warranty-claim state", function (this: ScenarioWorld) {
  const detail = record(state(this).baseResponse?.data);
  for (const key of ["stock", "warehouse", "order", "purchaseLimit", "warrantyClaim", "claimState"]) expect(detail).not.toHaveProperty(key);
});

Given("an Active ProductModel has no publicly sellable Variant compatible with the selected values", async function (this: ScenarioWorld) {
  await activeFixture(this, { values: ["200 mm", "300 mm"] });
});

When("the shopper asks for available options", async function (this: ScenarioWorld) {
  const selected = encodeURIComponent(JSON.stringify({ Size: "400 mm" }));
  const response = await (await baseApi(this)).publicGet(`/v1/catalog/product-models/${state(this).baseModelId}/options?selected=${selected}`);
  baseRemember(this, response);
});

Then("the available option projection is empty", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  const options = record(state(this).baseResponse?.data).options;
  expect(options).toEqual([]);
});

Given('a publicly sellable Variant has a numeric Size canonicalized to `200 mm`', async function (this: ScenarioWorld) {
  await activeFixture(this, { values: ["200 mm"] });
});

When('the shopper resolves the equivalent Size representation `20 cm`', async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).publicPost(`/v1/catalog/product-models/${state(this).baseModelId}/variants:resolve`, { selectedOptions: { Size: "20 cm" } });
  baseRemember(this, response);
});

Then("the public catalog returns the same Variant", function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  expect(entityId(state(this).baseResponse?.data)).toBe(state(this).baseVariantId);
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
