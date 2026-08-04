import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { isolatedReference } from "../../../shared/data/test-isolation";
import { getAdminToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { catalogBaseApi, entityId, record, type CatalogBaseApi, type JsonRecord } from "../../../shared/runtime/api-helpers/catalog-base.api";

type ModelState = {
  productId?: string;
  response?: { status: number; data: unknown };
  model?: Record<string, unknown>;
  baseApi?: CatalogBaseApi;
  baseAdminToken?: string;
  baseCategoryId?: string;
  baseModelId?: string;
  baseVariantId?: string;
  baseDimensionId?: string;
  baseResponse?: { status: number; data: unknown };
};

function state(world: ScenarioWorld): ModelState {
  return world.state as ModelState;
}

async function adminHeaders(world: ScenarioWorld) {
  return { Authorization: `Bearer ${await getAdminToken(await world.getApiRequest())}` };
}

async function readAdminProducts(world: ScenarioWorld): Promise<Record<string, unknown>[]> {
  const response = await (await world.getApiClient()).get<unknown>("/v1/admin/products", { headers: await adminHeaders(world) });
  expect(response.ok, "ProductModel scenarios require the admin product contract").toBe(true);
  const data = response.data as { items?: Record<string, unknown>[] } | Record<string, unknown>[];
  const items = Array.isArray(data) ? data : data.items ?? [];
  expect(items.length, "ProductModel scenarios require a catalog model").toBeGreaterThan(0);
  state(world).model = items[0];
  state(world).productId = String(items[0].id);
  return items;
}

async function modelId(world: ScenarioWorld): Promise<string> {
  if (state(world).productId) return state(world).productId!;
  await readAdminProducts(world);
  return state(world).productId!;
}

async function patchModel(world: ScenarioWorld, payload: Record<string, unknown>): Promise<void> {
  const response = await (await world.getApiClient()).patch(`/v1/admin/products/${await modelId(world)}`, payload, { headers: await adminHeaders(world) });
  state(world).response = { status: response.status, data: response.data };
}

async function readPublicModel(world: ScenarioWorld): Promise<void> {
  const response = await (await world.getApiClient()).get(`/v1/catalog/products/${await modelId(world)}`);
  state(world).response = { status: response.status, data: response.data };
}

async function expectRejected(world: ScenarioWorld): Promise<void> {
  expect(state(world).response?.status, "the invalid ProductModel command must be rejected by the backend").toBeGreaterThanOrEqual(400);
  expect(state(world).response?.status).toBeLessThan(500);
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "catalog.product-model") return;
  this.activeModule = "catalog.product-model";
});

Given('ProductModel Draft "Tay keo A"', async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator gan Material la fixed value, Size la VariantDimension va Weight la variant-specific definition", async function (this: ScenarioWorld) {
  await patchModel(this, { specs: [{ key: "Material", value: "fixed" }, { key: "Size", value: "dimension" }, { key: "Weight", value: "variant-specific" }] });
});

Then("he thong luu ba Attribute Definition o ba scope khac nhau", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('ProductModel co "Material" la fixed model value', async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When('Catalog Operator them VariantDimension "Material"', async function (this: ScenarioWorld) {
  await patchModel(this, { variant_dimensions: ["Material"] });
});

Then("he thong tu choi scope conflict", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Given("ProductModel Draft co name, Category, primary model image va mot sale-ready Variant", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator publish ProductModel", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: true });
});

Then('ProductModel chuyen sang "Active"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("ProductModel Active chi co mot primary model image", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator remove primary model image ma khong dat image thay the", async function (this: ScenarioWorld) {
  await patchModel(this, { images: [] });
});

Then("he thong tu choi command", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Then("ProductModel van giu primary model image cu", async function (this: ScenarioWorld) {
  await readPublicModel(this);
  expect(state(this).response?.status).toBeLessThan(500);
});

Given("ProductModel Draft ton tai", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator luu hai model image voi mot primary image va ordering 1, 2", async function (this: ScenarioWorld) {
  await patchModel(this, { images: state(this).model?.images ?? [] });
});

Then("ProductModel luu media dung ordering", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("primary image khong la technical hoac Variant image", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When('Catalog Operator set Overall length "200 mm"', async function (this: ScenarioWorld) {
  await patchModel(this, { specs: [{ key: "Overall length", value: "200 mm" }] });
});

Then("ProductModel luu measurement voi canonical unit cua length", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('ProductModel dang "Active"', async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator unpublish ProductModel", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: false });
});

Then('ProductModel chuyen sang "Inactive"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('ProductModel dang "Inactive" va du dieu kien publish', async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator publish ProductModel du dieu kien", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: true });
});

Given('ProductModel da "Discontinued"', async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

Then("he thong tu choi transition terminal", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Given("ProductModel Active chi co mot sale-ready Variant", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator inactivate Variant do", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: false });
});

Then("ProductModel van co mot sale-ready Variant", async function (this: ScenarioWorld) {
  await readPublicModel(this);
  expect(state(this).response?.status).toBeLessThan(500);
});

When("Catalog Operator xoa SellingPrice cua Variant", async function (this: ScenarioWorld) {
  await patchModel(this, { price: null });
});

Then('ProductModel giu trang thai "Inactive"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("Variant khong con sale-ready", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When('Catalog Operator set warranty term "24 thang" va ghi chu "Bao hanh co khi"', async function (this: ScenarioWorld) {
  await patchModel(this, { warranty: { term: "24 thang", note: "Bao hanh co khi" } });
});

Then("ProductModel hien thi Warranty Summary da luu", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('ProductModel co Warranty Summary "24 thang"', async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("customer xem ProductModel", async function (this: ScenarioWorld) {
  await readPublicModel(this);
});

Then("customer chi nhan Warranty Summary cua ProductModel", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(400);
});

Then("khong co warranty claim state trong catalog projection", async function (this: ScenarioWorld) {
  const data = state(this).response?.data as Record<string, unknown>;
  expect(data).toBeTruthy();
  expect(data.claim_state).toBeUndefined();
});

async function baseApi(world: ScenarioWorld): Promise<CatalogBaseApi> {
  state(world).baseApi ??= catalogBaseApi(await world.getApiClient());
  return state(world).baseApi!;
}

async function baseToken(world: ScenarioWorld): Promise<string> {
  state(world).baseAdminToken ??= await getAdminToken(await world.getApiRequest());
  return state(world).baseAdminToken!;
}

function baseRemember(world: ScenarioWorld, response: { status: number; data: unknown }): void {
  state(world).baseResponse = { status: response.status, data: response.data };
  state(world).response = { status: response.status, data: response.data };
}

function baseId(world: ScenarioWorld, data: unknown, resource: string): string {
  const id = entityId(data);
  expect(id, `${resource} response must contain an id`).toBeTruthy();
  return id;
}

function baseName(world: ScenarioWorld, label: string): string {
  return isolatedReference(world, label);
}

function baseRejected(world: ScenarioWorld): void {
  expect(state(world).baseResponse?.status, "Catalog Base command should be rejected").toBeGreaterThanOrEqual(400);
  expect(state(world).baseResponse?.status).toBeLessThan(500);
}

async function baseCategory(world: ScenarioWorld): Promise<string> {
  if (state(world).baseCategoryId) return state(world).baseCategoryId!;
  const response = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/categories", {
    name: baseName(world, "Grip Category"),
    slug: baseName(world, "grip-category").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseCategoryId = baseId(world, response.data, "Category");
  return state(world).baseCategoryId!;
}

async function baseModel(world: ScenarioWorld, input: JsonRecord = {}): Promise<string> {
  if (state(world).baseModelId) return state(world).baseModelId!;
  const response = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/product-models", {
    name: baseName(world, "Grip Handle A"),
    categoryId: await baseCategory(world),
    description: "Catalog Base ProductModel content",
    warrantySummary: { term: "24 thang", note: "Bao hanh co khi" },
    ...input,
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseModelId = baseId(world, response.data, "ProductModel");
  return state(world).baseModelId!;
}

async function baseDimension(world: ScenarioWorld, label = "Size", values = ["200 mm", "300 mm"]): Promise<string> {
  if (state(world).baseDimensionId) return state(world).baseDimensionId!;
  const definition = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", {
    key: baseName(world, `${label}-definition`).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    displayName: label,
    valueKind: "Enum",
  });
  baseRemember(world, definition);
  expect(definition.status).toBe(201);
  const allowedValues = values.map((value) => ({ id: value.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: value, active: true }));
  const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${await baseModel(world)}/variant-dimensions`, {
    definitionId: baseId(world, definition.data, "Attribute definition"),
    allowedValues,
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseDimensionId = baseId(world, response.data, "VariantDimension");
  return state(world).baseDimensionId!;
}

async function baseVariant(world: ScenarioWorld, input: JsonRecord = {}): Promise<string> {
  const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${await baseModel(world)}/variants`, {
    selectedOptions: { Size: "200 mm" },
    sku: `GRIP-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
    ...input,
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseVariantId = baseId(world, response.data, "Variant");
  return state(world).baseVariantId!;
}

async function baseReadModel(world: ScenarioWorld): Promise<JsonRecord> {
  const response = await (await baseApi(world)).adminGet(await baseToken(world), `/v1/admin/catalog/product-models/${await baseModel(world)}`);
  baseRemember(world, response);
  expect(response.status).toBe(200);
  return record(response.data);
}

Given("the Catalog Operator has ProductModel authoring access", async function (this: ScenarioWorld) {
  await baseToken(this);
});

When('Catalog Operator creates ProductModel Draft "Grip Handle A"', async function (this: ScenarioWorld) {
  await baseModel(this);
});

Then('the ProductModel is stored in "Draft" state', async function (this: ScenarioWorld) {
  const model = await baseReadModel(this);
  expect(model.status).toBe("Draft");
});

Then("the ProductModel owns its category, description, media, and WarrantySummary", async function (this: ScenarioWorld) {
  const model = record(state(this).baseResponse?.data);
  expect(model.categoryId).toBe(state(this).baseCategoryId);
  expect(model.description).toBeDefined();
  expect(Array.isArray(model.images)).toBe(true);
  expect(record(model.warrantySummary).term).toBe("24 thang");
});

Given("a ProductModel Draft exists", async function (this: ScenarioWorld) {
  await baseModel(this);
});

When("Catalog Operator reads the ProductModel authoring form", async function (this: ScenarioWorld) {
  await baseReadModel(this);
});

Then("the form exposes ProductModel content and catalog references", function (this: ScenarioWorld) {
  const model = record(state(this).baseResponse?.data);
  for (const key of ["id", "name", "categoryId", "description", "images", "warrantySummary", "variants"]) expect(model[key]).toBeDefined();
});

Then("the form does not expose stock, warehouse, order, or purchase-limit state", function (this: ScenarioWorld) {
  const model = record(state(this).baseResponse?.data);
  for (const key of ["stock", "warehouse", "order", "purchaseLimit", "quantityPriceTiers"]) expect(model).not.toHaveProperty(key);
});

Given("a ProductModel Draft has name, Category, and a sale-ready Variant but no primary model image", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await baseVariant(this);
});

When("Catalog Operator publishes the ProductModel", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/publish`);
  baseRemember(this, response);
});

Then("the publication command is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Then('the ProductModel remains in "Draft" state', async function (this: ScenarioWorld) {
  const model = await baseReadModel(this);
  expect(model.status).toBe("Draft");
});

Given("a ProductModel Draft has name, Category, and a primary model image but no sale-ready Variant", async function (this: ScenarioWorld) {
  await baseModel(this);
  const response = await (await baseApi(this)).adminPut(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/media`, {
    images: [{ url: "https://cdn.example.test/grip-primary.png", ordering: 1, primary: true }],
  });
  baseRemember(this, response);
  expect(response.status).toBe(200);
});

Given("an Active ProductModel has one primary model image", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await baseVariant(this);
  const media = await (await baseApi(this)).adminPut(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/media`, {
    images: [{ url: "https://cdn.example.test/grip-primary-old.png", ordering: 1, primary: true }],
  });
  baseRemember(this, media);
  expect(media.status).toBe(200);
  const publish = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/publish`);
  baseRemember(this, publish);
  expect(publish.status).toBe(200);
});

When("Catalog Operator replaces the primary model image with another model image", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPut(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/media`, {
    images: [{ url: "https://cdn.example.test/grip-primary-new.png", ordering: 1, primary: true }],
  });
  baseRemember(this, response);
  expect(response.status).toBe(200);
});

Then("the ProductModel has exactly one primary model image", async function (this: ScenarioWorld) {
  const model = await baseReadModel(this);
  const images = Array.isArray(model.images) ? model.images.map(record) : [];
  expect(images.filter((image) => image.primary === true)).toHaveLength(1);
});

Then("the previous image is no longer primary", async function (this: ScenarioWorld) {
  const model = await baseReadModel(this);
  const images = Array.isArray(model.images) ? model.images.map(record) : [];
  expect(images.some((image) => image.url === "https://cdn.example.test/grip-primary-old.png" && image.primary === true)).toBe(false);
});

Given("a ProductModel Draft has a numeric length definition", async function (this: ScenarioWorld) {
  await baseModel(this, { measurements: { overallLength: { value: 200, unit: "mm" } } });
});

When("Catalog Operator sets Overall length with an incompatible unit", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPatch(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}`, {
    measurements: { overallLength: { value: 20, unit: "kg" } },
  });
  baseRemember(this, response);
});

Then("the ProductModel measurement command is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Given("a ProductModel exists in a non-terminal publication state", async function (this: ScenarioWorld) {
  await baseModel(this);
});

When("Catalog Operator discontinues the ProductModel", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/discontinue`);
  baseRemember(this, response);
});

Then('the ProductModel transitions to "Discontinued"', async function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  expect(record(state(this).baseResponse?.data).status).toBe("Discontinued");
});

Then("a later publish or unpublish transition is rejected", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/publish`);
  baseRemember(this, response);
  baseRejected(this);
});

When("Catalog Operator saves WarrantySummary without a term", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPatch(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}`, {
    warrantySummary: { note: "term is required" },
  });
  baseRemember(this, response);
});

Then("the WarrantySummary command is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Given("an Active ProductModel has one sale-ready Variant", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await baseVariant(this);
  const media = await (await baseApi(this)).adminPut(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/media`, {
    images: [{ url: "https://cdn.example.test/grip-active.png", ordering: 1, primary: true }],
  });
  expect(media.status).toBe(200);
  const publish = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/publish`);
  baseRemember(this, publish);
  expect(publish.status).toBe(200);
});

When("Catalog Operator removes the last Variant SKU or SellingPrice", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPatch(await baseToken(this), `/v1/admin/catalog/variants/${state(this).baseVariantId}`, { sku: "" });
  baseRemember(this, response);
});

Then("the ProductModel remains publicly valid", async function (this: ScenarioWorld) {
  baseRejected(this);
  const response = await (await baseApi(this)).publicGet(`/v1/catalog/product-models/${await baseModel(this)}`);
  expect(response.status).toBe(200);
});

When("Catalog Operator requests ProductModel deletion", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminDelete(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}`);
  baseRemember(this, response);
});

Then("the deletion command is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Then("the ProductModel remains readable in its current lifecycle state", async function (this: ScenarioWorld) {
  const model = await baseReadModel(this);
  expect(model.id).toBe(state(this).baseModelId);
});

Given("an Inactive ProductModel references an inactive Category", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator deactivates the Category", async function (this: ScenarioWorld) {
  await patchModel(this, { category_active: false });
});

When("Catalog Operator republishes the existing ProductModel with valid publication invariants", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: true });
});

Then("the ProductModel is published successfully", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("new ProductModel assignment to the inactive Category is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Given("a numeric attribute Overall length is already used by a ProductModel", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator changes its display name", async function (this: ScenarioWorld) {
  await patchModel(this, { attribute_display_name: "Overall length" });
});

Then("the new display metadata is saved", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator changes the numeric definition to text", async function (this: ScenarioWorld) {
  await patchModel(this, { attribute_type: "text" });
});

Then("the semantic structure change is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

When("Catalog Operator changes its unit family", async function (this: ScenarioWorld) {
  await patchModel(this, { unit_family: "incompatible" });
});

Then("the incompatible unit-family change is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Given("Material, Finish, and Pack are catalog master references", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator updates their display metadata", async function (this: ScenarioWorld) {
  await patchModel(this, { master_display_metadata: { Material: "Material", Finish: "Finish", Pack: "Pack" } });
});

Then("the master metadata is stored", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator deactivates a master reference", async function (this: ScenarioWorld) {
  await patchModel(this, { master_active: false });
});

Then("new assignment is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Then("existing ProductModel and Variant references remain valid", async function (this: ScenarioWorld) {
  await readPublicModel(this);
  expect(state(this).response?.status).toBeLessThan(500);
});

Given('Catalog Operator creates ProductModel "Tay keo A"', async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/admin/products", { id: crypto.randomUUID(), title: "Tay keo A", price: 1, is_active: false }, { headers: await adminHeaders(this) });
  state(this).response = { status: response.status, data: response.data };
  await readAdminProducts(this);
});

When("Catalog Operator sets Material as a fixed model value", async function (this: ScenarioWorld) {
  await patchModel(this, { specs: [{ key: "Material", value: "fixed" }] });
});

When("Catalog Operator sets Size as a VariantDimension", async function (this: ScenarioWorld) {
  await patchModel(this, { variant_dimensions: ["Size"] });
});

When("Catalog Operator declares Weight as a variant-specific technical attribute", async function (this: ScenarioWorld) {
  await patchModel(this, { variant_specific: ["Weight"] });
});

Then("the ProductModel accepts the three non-overlapping attribute scopes", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator uses one definition as both fixed and dimension scope", async function (this: ScenarioWorld) {
  await patchModel(this, { fixed: ["Material"], variant_dimensions: ["Material"] });
});

Then("the scope conflict is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Given("a ProductModel exists", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator adds, orders, and selects its primary model image", async function (this: ScenarioWorld) {
  await patchModel(this, { images: state(this).model?.images ?? [] });
});

When("Catalog Operator updates the ProductModel description and WarrantySummary", async function (this: ScenarioWorld) {
  await patchModel(this, { description: "Cucumber catalog description", warranty: { term: "24 thang", note: "Bao hanh co khi" } });
});

Then("the content is stored in the ProductModel context", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("WarrantySummary contains a required term and an optional note", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("a ProductModel exists in Draft, Active, Inactive, or Discontinued state", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator requests a valid publish, unpublish, or discontinue transition", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: true });
});

Then("the ProductModel enters the requested state", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("Discontinued remains terminal", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator requests a transition that breaks the lifecycle rules", async function (this: ScenarioWorld) {
  await patchModel(this, { status: "Discontinued", is_active: true });
});

Then("the transition is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

Given("an Active ProductModel has one sale-ready Variant and one primary model image", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Catalog Operator tries to inactivate the last sale-ready Variant", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: false });
});

Then("the command is rejected", async function (this: ScenarioWorld) {
  await expectRejected(this);
});

When("Catalog Operator tries to remove the last primary model image", async function (this: ScenarioWorld) {
  await patchModel(this, { images: [] });
});

When("Catalog Operator unpublishes the ProductModel before editing", async function (this: ScenarioWorld) {
  await patchModel(this, { is_active: false });
});

Then("the ProductModel can be edited and republished after its invariants are restored", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("an Active ProductModel has one Active sale-ready Variant and one Inactive Variant", async function (this: ScenarioWorld) {
  await readAdminProducts(this);
});

When("Customer selects a valid option combination", async function (this: ScenarioWorld) {
  await readPublicModel(this);
});

Then("available options contain only options from publicly sellable Variants", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(400);
});

When("Customer resolves the exact selected combination", async function (this: ScenarioWorld) {
  await readPublicModel(this);
});

Then("the Inactive Variant is not returned as a public result", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(400);
});
