import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { isolatedReference } from "../../../shared/data/test-isolation";
import { getAdminToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { catalogBaseApi, entityId, record, type CatalogBaseApi, type CatalogMasterKind, type JsonRecord } from "../../../shared/runtime/api-helpers/catalog-base.api";

type MasterDataState = {
  api?: CatalogBaseApi;
  adminToken?: string;
  response?: { status: number; data: unknown };
  categoryId?: string;
  childCategoryId?: string;
  definitionId?: string;
  enumValueId?: string;
  masterKind?: CatalogMasterKind;
  masterId?: string;
  masterIds?: Partial<Record<CatalogMasterKind, string>>;
  modelId?: string;
  variantId?: string;
  existingData?: JsonRecord;
};

function state(world: ScenarioWorld): MasterDataState {
  return world.state as MasterDataState;
}

async function api(world: ScenarioWorld): Promise<CatalogBaseApi> {
  state(world).api ??= catalogBaseApi(await world.getApiClient());
  return state(world).api!;
}

async function adminToken(world: ScenarioWorld): Promise<string> {
  state(world).adminToken ??= await getAdminToken(await world.getApiRequest());
  return state(world).adminToken!;
}

function save(world: ScenarioWorld, response: { status: number; data: unknown }): void {
  state(world).response = { status: response.status, data: response.data };
}

function idOrFail(world: ScenarioWorld, value: unknown, name: string): string {
  const id = entityId(value);
  expect(id, `${name} response must contain an id`).toBeTruthy();
  return id;
}

function suffix(world: ScenarioWorld, label: string): string {
  return isolatedReference(world, `${label}-${Date.now()}`);
}

function expectSuccess(world: ScenarioWorld, accepted: number[] = [200, 201]): void {
  expect(accepted).toContain(state(world).response?.status);
}

function expectRejected(world: ScenarioWorld): void {
  expect(state(world).response?.status).toBeGreaterThanOrEqual(400);
  expect(state(world).response?.status).toBeLessThan(500);
}

async function createCategory(world: ScenarioWorld, active = true): Promise<string> {
  const response = await (await api(world)).adminPost(await adminToken(world), "/v1/admin/catalog/categories", {
    name: suffix(world, "category"),
    slug: suffix(world, "category-slug").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    active,
  });
  save(world, response);
  expectSuccess(world, [201]);
  return idOrFail(world, response.data, "category");
}

async function createDefinition(world: ScenarioWorld, input: JsonRecord): Promise<string> {
  const response = await (await api(world)).adminPost(await adminToken(world), "/v1/admin/catalog/attribute-definitions", {
    key: suffix(world, "attribute").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    displayName: suffix(world, "Attribute"),
    ...input,
  });
  save(world, response);
  expectSuccess(world, [201]);
  return idOrFail(world, response.data, "attribute definition");
}

async function createMaster(world: ScenarioWorld, kind: CatalogMasterKind, input: JsonRecord = {}): Promise<string> {
  const response = await (await api(world)).adminPost(await adminToken(world), `/v1/admin/catalog/masters/${kind}`, {
    name: suffix(world, kind),
    ...input,
  });
  save(world, response);
  expectSuccess(world, [201]);
  state(world).masterKind = kind;
  return idOrFail(world, response.data, `${kind} master`);
}

async function createModel(world: ScenarioWorld, input: JsonRecord = {}): Promise<string> {
  const categoryId = state(world).categoryId ??= await createCategory(world);
  const response = await (await api(world)).adminPost(await adminToken(world), "/v1/admin/catalog/product-models", {
    name: suffix(world, "ProductModel"),
    categoryId,
    ...input,
  });
  save(world, response);
  expectSuccess(world, [201]);
  return idOrFail(world, response.data, "ProductModel");
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "catalog.master-data") return;
  this.activeModule = "catalog.master-data";
});

Given("the Catalog Operator has catalog master-data access", async function (this: ScenarioWorld) {
  await adminToken(this);
});

When("Catalog Operator creates a root Category and a child Category", async function (this: ScenarioWorld) {
  state(this).categoryId = await createCategory(this);
  const response = await (await api(this)).adminPost(await adminToken(this), "/v1/admin/catalog/categories", {
    name: suffix(this, "child-category"),
    slug: suffix(this, "child-category-slug").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    parentId: state(this).categoryId,
  });
  save(this, response);
  expectSuccess(this, [201]);
  state(this).childCategoryId = idOrFail(this, response.data, "child category");
});

When("Catalog Operator changes the root Category position to `9`", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPatch(await adminToken(this), `/v1/admin/catalog/categories/${state(this).categoryId}`, { position: 9 });
  save(this, response);
});

Then("the Category read model preserves classification hierarchy and position", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet<unknown>(await adminToken(this), "/v1/admin/catalog/categories");
  expect(response.status).toBe(200);
  const rows = Array.isArray(response.data) ? response.data : record(response.data).items;
  expect(Array.isArray(rows)).toBe(true);
  const root = (rows as JsonRecord[]).find((item) => item.id === state(this).categoryId);
  const child = (rows as JsonRecord[]).find((item) => item.id === state(this).childCategoryId);
  expect(root?.position).toBe(9);
  expect(child?.parentId).toBe(state(this).categoryId);
});

Then("the Category does not own an attribute template or publication rule", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet<unknown>(await adminToken(this), "/v1/admin/catalog/categories");
  expect(response.status).toBe(200);
  const category = (Array.isArray(response.data) ? response.data : [])
    .find((item) => record(item).id === state(this).categoryId) as JsonRecord | undefined;
  expect(category).toBeTruthy();
  expect(category).not.toHaveProperty("attributeTemplate");
  expect(category).not.toHaveProperty("publicationRule");
});

Given("an existing ProductModel references a Category", async function (this: ScenarioWorld) {
  state(this).categoryId = await createCategory(this);
  state(this).modelId = await createModel(this);
});

When("Catalog Operator deactivates that Category", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/categories/${state(this).categoryId}/deactivate`);
  save(this, response);
});

Then("new ProductModel assignment to that Category is rejected", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), "/v1/admin/catalog/product-models", {
    name: suffix(this, "rejected-model"),
    categoryId: state(this).categoryId,
  });
  save(this, response);
  expectRejected(this);
});

Then("the existing ProductModel reference remains valid for republishing", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet(await adminToken(this), `/v1/admin/catalog/product-models/${state(this).modelId}`);
  expect(response.status).toBe(200);
  state(this).existingData = record(response.data);
});

Then("Category deletion is rejected", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminDelete(await adminToken(this), `/v1/admin/catalog/categories/${state(this).categoryId}`);
  save(this, response);
  expectRejected(this);
});

Then("the existing ProductModel reference remains readable", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet(await adminToken(this), `/v1/admin/catalog/product-models/${state(this).modelId}`);
  expect(response.status).toBe(200);
});

When("Catalog Operator defines a valid Scalar Number attribute with a compatible unit", async function (this: ScenarioWorld) {
  state(this).definitionId = await createDefinition(this, { valueKind: "Scalar", dataType: "Number", unitFamily: "length", unit: "mm" });
});

Then("the attribute definition is stored with its typed semantic fields", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet<JsonRecord[]>(await adminToken(this), "/v1/admin/catalog/attribute-definitions");
  expect(response.status).toBe(200);
  const definition = response.data.find((item) => item.id === state(this).definitionId);
  expect(definition?.valueKind).toBeDefined();
  expect(definition?.dataType).toBeDefined();
});

When("Catalog Operator defines a valid Enum attribute with selectable values", async function (this: ScenarioWorld) {
  state(this).definitionId = await createDefinition(this, { valueKind: "Enum" });
  const response = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/attribute-definitions/${state(this).definitionId}/enum-values`, { key: suffix(this, "enum-key"), label: suffix(this, "Enum value") });
  save(this, response);
  expectSuccess(this, [201]);
  state(this).enumValueId = idOrFail(this, response.data, "enum value");
});

Then("Enum values can be deactivated without deleting historical references", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/attribute-definitions/${state(this).definitionId}/enum-values/${state(this).enumValueId}/deactivate`);
  save(this, response);
  expect([200, 204]).toContain(response.status);
});

When("Catalog Operator defines a valid Reference attribute targeting Material, Finish, or Pack", async function (this: ScenarioWorld) {
  state(this).definitionId = await createDefinition(this, { valueKind: "Reference", referenceTarget: "Material" });
});

Then("the definition exposes exactly one reference target", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet<JsonRecord[]>(await adminToken(this), "/v1/admin/catalog/attribute-definitions");
  expect(response.status).toBe(200);
  const definition = response.data.find((item) => item.id === state(this).definitionId)!;
  expect(["Material", "Finish", "Pack"]).toContain(definition.referenceTarget);
  expect(definition).not.toHaveProperty("dataType");
});

When("Catalog Operator defines a Reference attribute with a numeric data type", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), "/v1/admin/catalog/attribute-definitions", { key: suffix(this, "invalid-reference"), valueKind: "Reference", referenceTarget: "Material", dataType: "Number" });
  save(this, response);
});

Then("the attribute definition is rejected", function (this: ScenarioWorld) {
  expectRejected(this);
});

When("Catalog Operator defines a numeric Scalar attribute with an incompatible unit", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), "/v1/admin/catalog/attribute-definitions", { key: suffix(this, "invalid-unit"), valueKind: "Scalar", dataType: "Number", unitFamily: "length", unit: "kg" });
  save(this, response);
});

Given("a numeric attribute definition is used by a ProductModel", async function (this: ScenarioWorld) {
  state(this).definitionId = await createDefinition(this, { valueKind: "Scalar", dataType: "Number", unitFamily: "length", unit: "mm" });
  state(this).modelId = await createModel(this, { fixedAttributes: { [state(this).definitionId]: "200 mm" } });
});

When("Catalog Operator changes its display name, description, or ordering", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPatch(await adminToken(this), `/v1/admin/catalog/attribute-definitions/${state(this).definitionId}`, { displayName: suffix(this, "renamed"), description: "updated display metadata", ordering: 2 });
  save(this, response);
});

Then("the display metadata is saved", function (this: ScenarioWorld) {
  expectSuccess(this);
});

When("Catalog Operator changes its value kind, data type, reference target, or unit family", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPatch(await adminToken(this), `/v1/admin/catalog/attribute-definitions/${state(this).definitionId}`, { dataType: "Text", unitFamily: "mass" });
  save(this, response);
});

Then("the Catalog Base semantic structure change is rejected", function (this: ScenarioWorld) {
  expectRejected(this);
});

When("Catalog Operator deactivates the used attribute definition", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/attribute-definitions/${state(this).definitionId}/deactivate`);
  save(this, response);
});

Then("new ProductModel assignment to the definition is rejected", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), "/v1/admin/catalog/product-models", { name: suffix(this, "invalid-definition-model"), categoryId: state(this).categoryId ?? await createCategory(this), fixedAttributes: { [state(this).definitionId!]: "300 mm" } });
  save(this, response);
  expectRejected(this);
});

Then("existing ProductModel values remain readable", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet(await adminToken(this), `/v1/admin/catalog/product-models/${state(this).modelId}`);
  expect(response.status).toBe(200);
  expect(record(response.data).fixedAttributes).toBeDefined();
});

Given("Material, Finish, and Pack are referenced by existing catalog data", async function (this: ScenarioWorld) {
  state(this).masterIds = {
    material: await createMaster(this, "material"),
    finish: await createMaster(this, "finish"),
    pack: await createMaster(this, "pack", { sellingUnit: "Box", quantity: 10, baseUnit: "Piece" }),
  };
  state(this).masterKind = "material";
  state(this).masterId = state(this).masterIds.material;
  state(this).definitionId = await createDefinition(this, { valueKind: "Reference", referenceTarget: "Material" });
  state(this).modelId = await createModel(this, { fixedAttributes: { [state(this).definitionId]: state(this).masterId } });
  const variantDefinition = await createDefinition(this, { valueKind: "Reference", referenceTarget: "Material" });
  const dimension = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/product-models/${state(this).modelId}/variant-dimensions`, {
    definitionId: variantDefinition,
    allowedValues: [{ id: state(this).masterId, label: "Material", active: true }],
  });
  expect(dimension.status).toBe(201);
  const variant = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/product-models/${state(this).modelId}/variants`, {
    selectedOptions: { Material: state(this).masterId },
    sku: `MASTER-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
  });
  expect(variant.status).toBe(201);
  state(this).variantId = idOrFail(this, variant.data, "Variant");
});

When("Catalog Operator deactivates one master reference", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), `/v1/admin/catalog/masters/${state(this).masterKind}/${state(this).masterId}/deactivate`);
  save(this, response);
});

Then("new assignment of that reference is rejected", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPost(await adminToken(this), "/v1/admin/catalog/product-models", { name: suffix(this, "inactive-master-model"), categoryId: state(this).categoryId ?? await createCategory(this), fixedAttributes: { [state(this).definitionId!]: state(this).masterId } });
  save(this, response);
  expectRejected(this);
});

Then("existing ProductModel and Variant references remain valid after master deactivation", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminGet(await adminToken(this), `/v1/admin/catalog/product-models/${state(this).modelId}`);
  expect(response.status).toBe(200);
  const variant = await (await api(this)).adminGet(await adminToken(this), `/v1/admin/catalog/variants/${state(this).variantId}`);
  expect(variant.status).toBe(200);
});

When("Catalog Operator updates Finish display metadata and swatch media", async function (this: ScenarioWorld) {
  state(this).masterKind = "finish";
  state(this).masterId = await createMaster(this, "finish", { swatchMedia: ["https://cdn.example.test/catalog/swatch.png"] });
  const response = await (await api(this)).adminPatch(await adminToken(this), `/v1/admin/catalog/masters/finish/${state(this).masterId}`, { description: "Finish swatch", swatchMedia: ["https://cdn.example.test/catalog/swatch-updated.png"] });
  save(this, response);
});

Then("the Finish master exposes its saved swatch media", function (this: ScenarioWorld) {
  expectSuccess(this);
  expect(record(state(this).response?.data).swatchMedia).toEqual(["https://cdn.example.test/catalog/swatch-updated.png"]);
});

Given("a Pack has selling unit, quantity, and base unit metadata", async function (this: ScenarioWorld) {
  state(this).masterKind = "pack";
  state(this).masterId = await createMaster(this, "pack", { sellingUnit: "Box", quantity: 10, baseUnit: "Piece" });
});

When("Catalog Operator updates the Pack display metadata", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPatch(await adminToken(this), `/v1/admin/catalog/masters/pack/${state(this).masterId}`, { description: "Pack display metadata" });
  save(this, response);
});

Then("the Pack keeps its selling-unit metadata as the referenced source of truth", function (this: ScenarioWorld) {
  expectSuccess(this);
  const value = record(state(this).response?.data);
  expect(value.sellingUnit).toBe("Box");
  expect(value.quantity).toBe(10);
  expect(value.baseUnit).toBe("Piece");
});

When("Catalog Operator updates the Pack quantity or base unit", async function (this: ScenarioWorld) {
  const response = await (await api(this)).adminPatch(await adminToken(this), `/v1/admin/catalog/masters/pack/${state(this).masterId}`, { quantity: 12, baseUnit: "Piece" });
  save(this, response);
});

Then("the Pack projection changes its selling-unit metadata", function (this: ScenarioWorld) {
  expectSuccess(this);
  expect(record(state(this).response?.data).quantity).toBe(12);
});

Then("the Catalog Base does not create stock or quantity-price state", function (this: ScenarioWorld) {
  const value = record(state(this).response?.data);
  expect(value).not.toHaveProperty("stock");
  expect(value).not.toHaveProperty("quantityPriceTiers");
});
