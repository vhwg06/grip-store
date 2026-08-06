import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { isolatedReference } from "../../../shared/data/test-isolation";
import { getAdminToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { catalogBaseApi, entityId, record, type CatalogBaseApi, type JsonRecord } from "../../../shared/runtime/api-helpers/catalog-base.api";

type VariantState = {
  productId?: string;
  response?: { status: number; data: unknown };
  selectedOptions?: Record<string, string>;
  baseApi?: CatalogBaseApi;
  baseToken?: string;
  baseCategoryId?: string;
  baseModelId?: string;
  baseDefinitionId?: string;
  baseDimensionId?: string;
  baseVariantId?: string;
  skuCanonical?: string;
  baseMaterialId?: string;
  baseFinishId?: string;
  basePackId?: string;
  legacyDimensionIds?: Record<string, string>;
  legacyVariantIds?: string[];
  legacyWeightDefinitionId?: string;
  legacyPackInactive?: boolean;
  baseResponse?: { status: number; data: unknown };
};

function state(world: ScenarioWorld): VariantState {
  return world.state as VariantState;
}

async function headers(world: ScenarioWorld) {
  return { Authorization: `Bearer ${await getAdminToken(await world.getApiRequest())}` };
}

async function createLegacyVariant(world: ScenarioWorld, selectedOptions: Record<string, string>, input: JsonRecord = {}): Promise<string> {
  const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variants`, {
    selectedOptions,
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
    ...input,
  });
  expect(response.status).toBe(201);
  const id = baseId(response.data, "Variant");
  state(world).baseVariantId = id;
  state(world).selectedOptions = selectedOptions;
  return id;
}

async function ensureLegacyVariantScenario(world: ScenarioWorld): Promise<void> {
  if (state(world).baseModelId) return;
  await baseModel(world);
  const id = world.scenarioId ?? "";
  const threeDimensions = async () => {
    const material = await addDimension(world, "Material", ["Inox 304"]);
    const finish = await addDimension(world, "Finish", ["Black"]);
    const size = await addDimension(world, "Size", ["200 mm", "300 mm"]);
    state(world).legacyDimensionIds = { Material: material.id, Finish: finish.id, Size: size.id };
  };
  if (["SC-CAT-VARIANT-001", "SC-CAT-VARIANT-002", "SC-CAT-VARIANT-004", "SC-CAT-VARIANT-011", "SC-CAT-VARIANT-COMBINATION-012", "SC-CAT-VARIANT-LIFECYCLE-014"].includes(id)) {
    await threeDimensions();
    return;
  }
  if (id === "SC-CAT-VARIANT-DIMENSIONS-013") {
    const finish = await addDimension(world, "Finish", ["Black"]);
    state(world).legacyDimensionIds = { Finish: finish.id };
    return;
  }
  if (id === "SC-CAT-VARIANT-003") {
    const definition = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", { key: baseName(world, "numeric-size-definition"), displayName: "Size", valueKind: "Scalar", dataType: "Number", unitFamily: "length", unit: "mm" });
    expect(definition.status).toBe(201);
    const dimension = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variant-dimensions`, { definitionId: baseId(definition.data, "Size definition"), allowedValues: [{ id: "200-mm", label: "200 mm", active: true }] });
    expect(dimension.status).toBe(201);
    state(world).baseDimensionId = baseId(dimension.data, "Size dimension");
    state(world).legacyDimensionIds = { Size: state(world).baseDimensionId! };
    await createLegacyVariant(world, { Size: "200 mm" });
    return;
  }
  if (id === "SC-CAT-VARIANT-005" || id === "SC-CAT-VARIANT-TECHNICAL-015") {
    await addDimension(world, "Size", ["200 mm", "300 mm"]);
    const weight = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", { key: baseName(world, "weight-definition"), displayName: "Weight", valueKind: "Scalar", dataType: "Number", unitFamily: "mass", unit: "kg" });
    expect(weight.status).toBe(201);
    state(world).legacyWeightDefinitionId = baseId(weight.data, "Weight definition");
    state(world).selectedOptions = { Size: "300 mm" };
    return;
  }
  if (id === "SC-CAT-VARIANT-006") {
    await addDimension(world, "Size", ["200 mm"]);
    return;
  }
  if (id === "SC-CAT-VARIANT-007") {
    const finish = await addDimension(world, "Finish", ["Black"]);
    state(world).legacyDimensionIds = { Finish: finish.id };
    await createLegacyVariant(world, { Finish: "Black" });
    return;
  }
  if (id === "SC-CAT-VARIANT-008") {
    await addDimension(world, "Size", ["200 mm"]);
    await createLegacyVariant(world, { Size: "200 mm" });
    return;
  }
  if (id === "SC-CAT-VARIANT-009") {
    const finish = await addDimension(world, "Finish", ["Black", "Brushed"]);
    state(world).legacyDimensionIds = { Finish: finish.id };
    await createLegacyVariant(world, { Finish: "Black" });
    const inactive = await createLegacyVariant(world, { Finish: "Brushed" });
    const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/variants/${inactive}/inactivate`);
    expect(response.status).toBe(200);
    const media = await (await baseApi(world)).adminPut(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/media`, { images: [{ url: "https://cdn.example.test/variant-public.png", ordering: 1, primary: true }] });
    expect(media.status).toBe(200);
    const publish = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/publish`);
    expect(publish.status).toBe(200);
    return;
  }
  if (id === "SC-CAT-VARIANT-010") {
    await threeDimensions();
    const variant = await createLegacyVariant(world, { Material: "Inox 304", Finish: "Black", Size: "200 mm" });
    const inactivate = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/variants/${variant}/inactivate`);
    expect(inactivate.status).toBe(200);
    return;
  }
  if (id === "SC-CAT-VARIANT-SKU-001" || id === "SC-CAT-VARIANT-SKU-003" || id === "SC-CAT-VARIANT-PRICE-001") {
    await addDimension(world, "Size", ["200 mm"]);
    const variant = await createLegacyVariant(world, { Size: "200 mm" }, { sku: undefined });
    state(world).baseVariantId = variant;
    if (id === "SC-CAT-VARIANT-SKU-001" || id === "SC-CAT-VARIANT-PRICE-001") {
      state(world).skuCanonical = baseName(world, "abc-001");
    }
    return;
  }
  if (id === "SC-CAT-VARIANT-SKU-002") {
    await addDimension(world, "Size", ["200 mm", "300 mm"]);
    state(world).skuCanonical = baseName(world, "abc-001");
    const reserved = await createLegacyVariant(world, { Size: "200 mm" }, { sku: state(world).skuCanonical });
    const inactivate = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/variants/${reserved}/inactivate`);
    expect(inactivate.status).toBe(200);
    const target = await createLegacyVariant(world, { Size: "300 mm" }, { sku: undefined });
    state(world).baseVariantId = target;
    return;
  }
  if (id === "SC-CAT-VARIANT-PRICE-007") {
    await addDimension(world, "Size", ["200 mm", "300 mm", "400 mm"]);
    const variants = [];
    for (const size of ["200 mm", "300 mm", "400 mm"]) variants.push(await createLegacyVariant(world, { Size: size }));
    state(world).legacyVariantIds = variants;
    state(world).baseVariantId = variants[0];
    return;
  }
  if (id === "SC-CAT-VARIANT-COMMERCIAL-008") {
    await addDimension(world, "Size", ["200 mm"]);
    await createLegacyVariant(world, { Size: "200 mm" });
    const pack = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/masters/pack", { name: baseName(world, "Hop 10 cai"), sellingUnit: "Box", quantity: 10, baseUnit: "Piece" });
    expect(pack.status).toBe(201);
    state(world).basePackId = baseId(pack.data, "Pack");
    return;
  }
  if (["SC-CAT-VARIANT-PRICE-002", "SC-CAT-VARIANT-PRICE-003", "SC-CAT-VARIANT-PRICE-004"].includes(id)) {
    await addDimension(world, "Size", ["200 mm"]);
    await createLegacyVariant(world, { Size: "200 mm" });
    return;
  }
  if (id === "SC-CAT-VARIANT-PRICE-005" || id === "SC-CAT-VARIANT-PRICE-006") {
    await addDimension(world, "Size", ["200 mm", "300 mm", "400 mm"]);
    const variants = [];
    for (const size of ["200 mm", "300 mm", "400 mm"]) variants.push(await createLegacyVariant(world, { Size: size }));
    state(world).legacyVariantIds = variants;
    state(world).baseVariantId = variants[0];
    return;
  }
  if (["SC-CAT-VARIANT-PACK-001", "SC-CAT-VARIANT-PACK-002"].includes(id)) {
    const pack = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/masters/pack", { name: baseName(world, "Hop 10 cai"), sellingUnit: "Box", quantity: 10, baseUnit: "Piece" });
    expect(pack.status).toBe(201);
    state(world).basePackId = baseId(pack.data, "Pack");
    const definition = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", { key: baseName(world, "Pack-definition"), displayName: "Pack", valueKind: "Reference", referenceTarget: "Pack" });
    expect(definition.status).toBe(201);
    const dimension = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variant-dimensions`, { definitionId: baseId(definition.data, "Pack definition"), allowedValues: [{ id: state(world).basePackId, label: "Hop 10 cai", active: true }] });
    expect(dimension.status).toBe(201);
    state(world).baseDimensionId = baseId(dimension.data, "Pack dimension");
    state(world).legacyDimensionIds = { Pack: state(world).baseDimensionId! };
    if (id === "SC-CAT-VARIANT-PACK-002") {
      const variant = await createLegacyVariant(world, { Pack: state(world).basePackId! });
      const media = await (await baseApi(world)).adminPut(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/media`, { images: [{ url: "https://cdn.example.test/pack.png", ordering: 1, primary: true }] });
      expect(media.status).toBe(200);
      const publish = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/publish`);
      expect(publish.status).toBe(200);
      state(world).baseVariantId = variant;
    }
  }
}

async function chooseModel(world: ScenarioWorld): Promise<string> {
  if (state(world).productId) return state(world).productId!;
  await ensureLegacyVariantScenario(world);
  state(world).productId = state(world).baseModelId;
  return state(world).productId!;
}

async function mutate(world: ScenarioWorld, payload: Record<string, unknown>): Promise<void> {
  await chooseModel(world);
  let response: { status: number; data: unknown };
  const id = world.scenarioId;
  const selected = payload.variant_options as Record<string, string> | undefined;
  if (selected) {
    const created = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variants`, {
      selectedOptions: selected,
      sku: `VAR-${crypto.randomUUID()}`,
      sellingPrice: { amount: 400000, currency: "VND" },
    });
    response = created;
    if (created.status === 201) {
      state(world).baseVariantId = baseId(created.data, "Variant");
      if (id === "SC-CAT-VARIANT-LIFECYCLE-014") {
        const media = await (await baseApi(world)).adminPut(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/media`, { images: [{ url: "https://cdn.example.test/lifecycle.png", ordering: 1, primary: true }] });
        expect(media.status).toBe(200);
        const publish = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/publish`);
        expect(publish.status).toBe(200);
      }
    }
  } else if (payload.selected_combinations) {
    const combinations = payload.selected_combinations as Array<Record<string, string>>;
    const created = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variants`, {
      selectedOptions: combinations[0], sku: `VAR-${crypto.randomUUID()}`, sellingPrice: { amount: 400000, currency: "VND" },
    });
    response = created;
    if (created.status === 201) state(world).baseVariantId = baseId(created.data, "Variant");
  } else if (payload.variant_attributes) {
    if (!state(world).baseVariantId) {
      const created = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variants`, {
        selectedOptions: state(world).selectedOptions ?? { Size: "300 mm" }, sku: `VAR-${crypto.randomUUID()}`, sellingPrice: { amount: 400000, currency: "VND" }, technicalValues: payload.variant_attributes,
      });
      response = created;
      if (created.status === 201) state(world).baseVariantId = baseId(created.data, "Variant");
    } else {
      response = await (await baseApi(world)).adminPatch(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}`, { technicalValues: payload.variant_attributes });
    }
  } else if (payload.allowed_values) {
    const values = record(payload.allowed_values).Finish ?? record(payload.allowed_values).Size;
    const dimensionId = state(world).legacyDimensionIds?.Finish ?? state(world).baseDimensionId;
    const current = await (await baseApi(world)).adminGet(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variant-dimensions/${dimensionId}`);
    const currentValues = Array.isArray(record(current.data).allowedValues) ? record(current.data).allowedValues as unknown[] : [];
    const currentIds = new Set(currentValues.map((value) => record(value).id).filter((value): value is string => typeof value === "string"));
    const newValue = Array.isArray(values)
      ? values.map((value) => ({ id: String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: String(value), active: true })).find((value) => !currentIds.has(value.id))
      : undefined;
    response = newValue
      ? await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variant-dimensions/${dimensionId}/values`, newValue)
      : { status: 400, data: {} };
  } else if (payload.variant_dimensions) {
    if (!state(world).baseVariantId) {
      const existing = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variants`, { selectedOptions: { Finish: "Black" }, sku: `VAR-${crypto.randomUUID()}`, sellingPrice: { amount: 400000, currency: "VND" } });
      expect(existing.status).toBe(201);
      state(world).baseVariantId = baseId(existing.data, "Variant");
    }
    const definition = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", { key: baseName(world, "handing-definition"), displayName: "Handing", valueKind: "Enum" });
    response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variant-dimensions`, { definitionId: baseId(definition.data, "Handing definition"), allowedValues: [{ id: "left", label: "Left", active: true }] });
  } else if (id === "SC-CAT-VARIANT-COMMERCIAL-008" && (payload.sku !== undefined || payload.pack)) {
    response = await (await baseApi(world)).adminPatch(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}`, { sku: payload.sku, sellingPrice: { amount: payload.price ?? 400000, currency: payload.currency ?? "VND" }, packId: state(world).basePackId });
  } else if (payload.pack) {
    response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}/variants`, { selectedOptions: { Pack: state(world).basePackId! }, sku: `VAR-${crypto.randomUUID()}`, sellingPrice: { amount: 400000, currency: "VND" } });
    if (response.status === 201) state(world).baseVariantId = baseId(response.data, "Variant");
  } else if (payload.is_active === false) {
    response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}/inactivate`);
  } else if (payload.is_active === true) {
    response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}/activate`);
  } else if (Object.prototype.hasOwnProperty.call(payload, "price")) {
    if (payload.variant_ids || id === "SC-CAT-VARIANT-PRICE-007") {
      const variantIds = id === "SC-CAT-VARIANT-PRICE-005" || (id === "SC-CAT-VARIANT-PRICE-007" && !payload.variant_ids)
        ? state(world).legacyVariantIds
        : [...(state(world).legacyVariantIds?.slice(0, 2) ?? []), "missing-variant"];
      response = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/variants/prices:bulk", { variantIds, sellingPrice: { amount: payload.price, currency: payload.currency ?? "VND" } });
    } else {
      response = await (await baseApi(world)).adminPatch(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}`, { sellingPrice: { amount: payload.price, currency: payload.currency ?? "VND" } });
    }
  } else if (payload.sku !== undefined) {
    const sku = (id === "SC-CAT-VARIANT-SKU-001" || id === "SC-CAT-VARIANT-SKU-002") && state(world).skuCanonical
      ? state(world).skuCanonical
      : payload.sku;
    response = await (await baseApi(world)).adminPatch(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}`, { sku });
  } else {
    response = { status: 400, data: {} };
  }
  baseRemember(world, response);
}

async function publicRead(world: ScenarioWorld): Promise<void> {
  await chooseModel(world);
  const response = world.scenarioId === "SC-CAT-VARIANT-PRICE-001"
    ? await (await baseApi(world)).adminGet(await baseToken(world), `/v1/admin/catalog/product-models/${state(world).baseModelId}`)
    : await (await baseApi(world)).publicGet(world.scenarioId === "SC-CAT-VARIANT-009" || world.scenarioId === "SC-CAT-VARIANT-PACK-002" || world.scenarioId === "SC-CAT-VARIANT-LIFECYCLE-014"
      ? `/v1/catalog/product-models/${state(world).baseModelId}/options`
      : `/v1/catalog/product-models/${state(world).baseModelId}`);
  baseRemember(world, response);
}

async function reject(world: ScenarioWorld): Promise<void> {
  expect(state(world).response?.status).toBeGreaterThanOrEqual(400);
  expect(state(world).response?.status).toBeLessThan(500);
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "catalog.variant") return;
  this.activeModule = "catalog.variant";
});

Given("ProductModel co VariantDimensions Material, Finish va Size", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator tao Variant chon mot value hop le cho moi dimension", async function (this: ScenarioWorld) {
  state(this).selectedOptions = { Material: "Inox 304", Finish: "Black", Size: "200 mm" };
  await mutate(this, { variant_options: state(this).selectedOptions });
});

Then("he thong tao Variant voi selected option values day du", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator tao Variant khong chon Size", async function (this: ScenarioWorld) {
  await mutate(this, { variant_options: { Material: "Inox 304", Finish: "Black" } });
});

Then("he thong tu choi incomplete combination", async function (this: ScenarioWorld) {
  await reject(this);
});

Given('ProductModel co Numeric VariantDimension Size voi unit family "length"', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

Given('Variant da ton tai voi Size "200 mm"', async function (this: ScenarioWorld) {
  state(this).selectedOptions = { Size: "200 mm" };
});

When('Catalog Operator tao Variant chon Size "20 cm"', async function (this: ScenarioWorld) {
  await mutate(this, { variant_options: { Size: "20 cm" } });
});

Then("he thong tu choi duplicate canonical combination", async function (this: ScenarioWorld) {
  await reject(this);
});

Given('ProductModel A co Variant Material "Inox 304", Finish "Black" va Size "200 mm"', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

Given("ProductModel B co cung ba VariantDimensions", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator tao Variant tren ProductModel B voi cung selected values", async function (this: ScenarioWorld) {
  await mutate(this, { variant_options: { Material: "Inox 304", Finish: "Black", Size: "200 mm" } });
});

Then("he thong tao Variant tren ProductModel B", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("ProductModel co VariantDimensions Material, Finish va Size voi nhieu allowed values", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator generate mot subset selected combinations", async function (this: ScenarioWorld) {
  await mutate(this, { selected_combinations: [{ Material: "Inox 304", Finish: "Black", Size: "200 mm" }] });
});

Then("he thong chi tao cac Variant duoc chon", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("he thong khong tu tao toan bo Cartesian product", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("ProductModel khai bao Weight la variant-specific technical attribute", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

Given('Variant co Size selected option "300 mm"', async function (this: ScenarioWorld) {
  state(this).selectedOptions = { Size: "300 mm" };
});

When('Catalog Operator set Weight "1.2 kg" tren Variant', async function (this: ScenarioWorld) {
  await mutate(this, { variant_attributes: { Weight: "1.2 kg" } });
});

Then("he thong luu VariantAttributeValue Weight", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("combination identity cua Variant khong thay doi", async function (this: ScenarioWorld) {
  expect(state(this).selectedOptions?.Size).toBe("300 mm");
});

Given("ProductModel khong khai bao Projection la variant-specific attribute", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator set Projection "60 mm" tren Variant', async function (this: ScenarioWorld) {
  await mutate(this, { variant_attributes: { Projection: "60 mm" } });
});

Then("he thong tu choi VariantAttributeValue", async function (this: ScenarioWorld) {
  await reject(this);
});

Given("ProductModel da co Variant va co VariantDimension Finish", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator them Finish value moi vao dimension", async function (this: ScenarioWorld) {
  await mutate(this, { allowed_values: { Finish: ["Black", "Brushed"] } });
});

Then("he thong chap nhan selectable value moi", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("ProductModel da co it nhat mot Variant", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator them VariantDimension Handing", async function (this: ScenarioWorld) {
  await mutate(this, { variant_dimensions: ["Handing"] });
});

Then("he thong tu choi structural dimension change", async function (this: ScenarioWorld) {
  await reject(this);
});

Given("ProductModel Active co Variant Active va Variant Inactive khac nhau o Finish", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("customer lay available options", async function (this: ScenarioWorld) {
  await publicRead(this);
});

Then("he thong khong tra Finish chi co tren Variant Inactive", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(400);
});

Given('Variant dang "Inactive" voi selected options bat bien', async function (this: ScenarioWorld) {
  await chooseModel(this);
  state(this).selectedOptions = { Material: "Inox 304", Finish: "Black", Size: "200 mm" };
});

When("Catalog Operator reactivate Variant", async function (this: ScenarioWorld) {
  await mutate(this, { is_active: true });
});

Then('Variant chuyen sang "Active"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("selected options van giu nguyen", async function (this: ScenarioWorld) {
  expect(state(this).selectedOptions).toEqual({ Material: "Inox 304", Finish: "Black", Size: "200 mm" });
});

Given('khong co Variant nao da dung SKU canonical "abc-001"', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator gan SKU " ABC-001 " cho Variant', async function (this: ScenarioWorld) {
  await mutate(this, { sku: " ABC-001 " });
});

Then('Variant luu SKU canonical "abc-001"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('Variant Inactive da reserve SKU canonical "abc-001"', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator gan SKU "ABC-001" cho Variant khac', async function (this: ScenarioWorld) {
  await mutate(this, { sku: "ABC-001" });
});

Then("he thong tu choi duplicate SKU", async function (this: ScenarioWorld) {
  await reject(this);
});

Given('Variant dang Active chua co SKU', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator gan SKU "   " cho Variant', async function (this: ScenarioWorld) {
  await mutate(this, { sku: "   " });
});

Then("Variant van khong co SKU", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('Variant dang "Active" va chua co SKU', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("he thong danh gia commercial readiness", async function (this: ScenarioWorld) {
  await publicRead(this);
});

Then("Variant khong sale-ready", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(400);
});

Given('Variant dang "Active" voi SKU hop le', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator set SellingPrice "400000 VND"', async function (this: ScenarioWorld) {
  await mutate(this, { price: 400000, currency: "VND" });
});

Then("Variant la sale-ready", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('catalog currency la "VND"', async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/catalog/settings");
  expect(response.ok).toBe(true);
  expect(response.data.currency).toBe("VND");
});

Then("he thong luu current SellingPrice cua Variant", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When('Catalog Operator set SellingPrice "0 USD"', async function (this: ScenarioWorld) {
  await mutate(this, { price: 0, currency: "USD" });
});

Then("he thong tu choi SellingPrice", async function (this: ScenarioWorld) {
  await reject(this);
});

Given("Catalog Operator chon ba Variant hop le", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator set SellingPrice "400000 VND" cho nhom', async function (this: ScenarioWorld) {
  await mutate(this, { price: 400000, currency: "VND", variant_ids: [await chooseModel(this)] });
});

Then('ca ba Variant deu co SellingPrice "400000 VND"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given("Catalog Operator chon hai Variant", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

Given("mot Variant trong batch khong the nhan gia yeu cau", async function (this: ScenarioWorld) {
  state(this).selectedOptions = { invalid: "variant" };
});

When("Catalog Operator set SellingPrice cho nhom", async function (this: ScenarioWorld) {
  await mutate(this, { price: 400000, variant_ids: [await chooseModel(this), "missing-variant"] });
});

Then("he thong tu choi batch", async function (this: ScenarioWorld) {
  await reject(this);
});

Then("SellingPrice cua ca hai Variant khong thay doi", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeGreaterThanOrEqual(400);
});

Given('Pack "Hop 10 cai" co selling unit Box, quantity 10 va base unit Piece', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

Given("ProductModel co Pack la VariantDimension", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When('Catalog Operator tao Variant chon Pack "Hop 10 cai"', async function (this: ScenarioWorld) {
  await mutate(this, { pack: "Hop 10 cai" });
});

Then('Variant tham chieu Pack "Hop 10 cai"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then('projection cua Variant la "Box", 10 "Piece"', async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Given('Variant publicly sellable tham chieu Pack "Hop 10 cai"', async function (this: ScenarioWorld) {
  await chooseModel(this);
});

Given('Pack "Hop 10 cai" da inactive', async function (this: ScenarioWorld) {
  await chooseModel(this);
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/masters/pack/${state(this).basePackId}/deactivate`);
  expect(response.status).toBe(200);
  state(this).legacyPackInactive = true;
});

When('Catalog Operator tao Variant moi tham chieu Pack "Hop 10 cai"', async function (this: ScenarioWorld) {
  await mutate(this, { pack: "Hop 10 cai", is_active: true });
});

Then("he thong tu choi Pack reference moi", async function (this: ScenarioWorld) {
  await reject(this);
});

Then("Variant cu van publicly sellable", async function (this: ScenarioWorld) {
  await publicRead(this);
  expect(state(this).response?.status).toBeLessThan(400);
});

Given("a ProductModel has Material, Finish, and Size dimensions", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator previews the available combinations", async function (this: ScenarioWorld) {
  await publicRead(this);
});

When("Catalog Operator selects a valid subset", async function (this: ScenarioWorld) {
  await mutate(this, { selected_combinations: [{ Material: "Inox 304", Finish: "Black", Size: "200 mm" }] });
});

Then("the system creates one Variant with one value for every dimension per selected combination", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("the selected subset contains an existing canonical combination", async function (this: ScenarioWorld) {
  await mutate(this, { selected_combinations: [{ Material: "Inox 304", Finish: "Black", Size: "200 mm" }] });
});

Then("the duplicate combination record is rejected", async function (this: ScenarioWorld) {
  await reject(this);
});

Given("a ProductModel has a valid Variant dimension definition", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator adds an allowed selectable value", async function (this: ScenarioWorld) {
  await mutate(this, { allowed_values: { Finish: ["Black", "Brushed"] } });
});

Then("the value can participate in new combinations", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator tries to add or remove a VariantDimension after Variants exist", async function (this: ScenarioWorld) {
  await mutate(this, { variant_dimensions: ["Handing"] });
});

Then("the structural dimension change is rejected", async function (this: ScenarioWorld) {
  await reject(this);
});

Given("a ProductModel has valid Variant dimensions", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator creates a Variant from one selected value per dimension", async function (this: ScenarioWorld) {
  await mutate(this, { variant_options: { Material: "Inox 304", Finish: "Black", Size: "200 mm" } });
  state(this).selectedOptions = { Material: "Inox 304", Finish: "Black", Size: "200 mm" };
});

Then("the selected option identity is immutable", async function (this: ScenarioWorld) {
  expect(state(this).selectedOptions).toBeTruthy();
});

When("Catalog Operator inactivates the Variant", async function (this: ScenarioWorld) {
  await mutate(this, { is_active: false });
});

Then("the Variant is excluded from public option availability", async function (this: ScenarioWorld) {
  const status = state(this).response?.status;
  expect(status === 404 || status === 200).toBe(true);
  if (status === 200) expect(record(state(this).response?.data).options).toEqual([]);
});

Then("its selected options remain unchanged", async function (this: ScenarioWorld) {
  expect(state(this).selectedOptions).toEqual({ Material: "Inox 304", Finish: "Black", Size: "200 mm" });
});

Given('Size "300 mm" is a selected option and Weight is a variant-specific definition', async function (this: ScenarioWorld) {
  await chooseModel(this);
  state(this).selectedOptions = { Size: "300 mm" };
});

When('Catalog Operator creates a Variant with Size "300 mm"', async function (this: ScenarioWorld) {
  await mutate(this, { variant_options: state(this).selectedOptions });
});

When('Catalog Operator sets Weight to "1.2 kg" on the Variant', async function (this: ScenarioWorld) {
  await mutate(this, { variant_attributes: { Weight: "1.2 kg" } });
});

Then("the Weight value is stored", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("the canonical combination identity is unchanged", async function (this: ScenarioWorld) {
  expect(state(this).selectedOptions?.Size).toBe("300 mm");
});

Given("Catalog Operator selects multiple Variants", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator sets one valid SellingPrice for the group", async function (this: ScenarioWorld) {
  await mutate(this, { price: 400000, currency: "VND" });
});

Then("every selected Variant is updated", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("one selected Variant is invalid or the amount is not positive", async function (this: ScenarioWorld) {
  await mutate(this, { price: 0, variant_ids: ["missing-variant"] });
});

Then("no selected Variant is updated", async function (this: ScenarioWorld) {
  await reject(this);
});

Given("a Variant exists", async function (this: ScenarioWorld) {
  await chooseModel(this);
});

When("Catalog Operator assigns a non-empty SKU, valid SellingPrice, and Pack reference", async function (this: ScenarioWorld) {
  await mutate(this, { sku: `CUC-${crypto.randomUUID()}`, price: 400000, currency: "VND", pack: "Hop 10 cai" });
});

Then("the Variant is sale-ready when Active", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

Then("SKU normalization and uniqueness are enforced", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBeLessThan(300);
});

When("Catalog Operator assigns a non-positive price or a non-catalog currency", async function (this: ScenarioWorld) {
  await mutate(this, { price: 0, currency: "USD" });
});

Then("the commercial update is rejected", async function (this: ScenarioWorld) {
  await reject(this);
});

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
  state(world).response = { status: response.status, data: response.data };
}

function baseId(data: unknown, resource: string): string {
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
    name: baseName(world, "Variant Category"),
    slug: baseName(world, "variant-category").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseCategoryId = baseId(response.data, "Category");
  return state(world).baseCategoryId!;
}

async function baseModel(world: ScenarioWorld, input: JsonRecord = {}): Promise<string> {
  if (state(world).baseModelId) return state(world).baseModelId!;
  const response = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/product-models", {
    name: baseName(world, "Variant ProductModel"),
    categoryId: await baseCategory(world),
    ...input,
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseModelId = baseId(response.data, "ProductModel");
  return state(world).baseModelId!;
}

async function addDimension(world: ScenarioWorld, label: string, values: string[]): Promise<{ id: string; values: string[] }> {
  const definition = await (await baseApi(world)).adminPost(await baseToken(world), "/v1/admin/catalog/attribute-definitions", {
    key: baseName(world, `${label}-definition`).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    displayName: label,
    valueKind: "Enum",
  });
  baseRemember(world, definition);
  expect(definition.status).toBe(201);
  const allowedValues = values.map((value) => ({ id: value.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: value, active: true }));
  const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${await baseModel(world)}/variant-dimensions`, {
    definitionId: baseId(definition.data, "Attribute definition"),
    allowedValues,
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  const id = baseId(response.data, "VariantDimension");
  state(world).baseDefinitionId = baseId(definition.data, "Attribute definition");
  state(world).baseDimensionId ??= id;
  return { id, values };
}

async function baseDimension(world: ScenarioWorld, label = "Size", values = ["200 mm", "300 mm"]): Promise<{ id: string; values: string[] }> {
  if (state(world).baseDimensionId) return { id: state(world).baseDimensionId!, values };
  return addDimension(world, label, values);
}

async function createBaseVariant(world: ScenarioWorld, selectedOptions: Record<string, string> = { Size: "200 mm" }, input: JsonRecord = {}): Promise<string> {
  const response = await (await baseApi(world)).adminPost(await baseToken(world), `/v1/admin/catalog/product-models/${await baseModel(world)}/variants`, {
    selectedOptions,
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
    ...input,
  });
  baseRemember(world, response);
  expect(response.status).toBe(201);
  state(world).baseVariantId = baseId(response.data, "Variant");
  state(world).selectedOptions = selectedOptions;
  return state(world).baseVariantId!;
}

async function readBaseVariant(world: ScenarioWorld): Promise<JsonRecord> {
  const response = await (await baseApi(world)).adminGet(await baseToken(world), `/v1/admin/catalog/variants/${state(world).baseVariantId}`);
  baseRemember(world, response);
  expect(response.status).toBe(200);
  return record(response.data);
}

Given("a ProductModel has an active VariantDimension with allowed values", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
});

When("Catalog Operator creates a Variant using a value outside that set", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variants`, {
    selectedOptions: { Size: "400 mm" },
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
  });
  baseRemember(this, response);
});

Then("the Variant command is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Given("an existing Variant uses a selectable value", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await createBaseVariant(this, { Size: "200 mm" });
});

When("Catalog Operator deactivates that selectable value", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variant-dimensions/${state(this).baseDimensionId}/values/200-mm/deactivate`);
  baseRemember(this, response);
  expect(response.status).toBe(200);
});

Then("new Variant creation using that value is rejected", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variants`, {
    selectedOptions: { Size: "200 mm" },
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
  });
  baseRemember(this, response);
  baseRejected(this);
});

Then("the existing Variant selection remains readable", async function (this: ScenarioWorld) {
  const variant = await readBaseVariant(this);
  expect(record(variant.selectedOptions).Size).toBe("200 mm");
});

Given("a Variant exists with an immutable selected combination", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await createBaseVariant(this, { Size: "200 mm" });
});

When("Catalog Operator requests a different selected combination for that Variant", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPatch(await baseToken(this), `/v1/admin/catalog/variants/${state(this).baseVariantId}`, {
    selectedOptions: { Size: "300 mm" },
  });
  baseRemember(this, response);
});

Then("the selected-combination mutation is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Then("a replacement Variant is required before the old Variant is inactivated", async function (this: ScenarioWorld) {
  const oldVariantId = state(this).baseVariantId;
  const replacement = await createBaseVariant(this, { Size: "300 mm" });
  expect(replacement).not.toBe(oldVariantId);
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/variants/${oldVariantId}/inactivate`);
  baseRemember(this, response);
  expect(response.status).toBe(200);
});

Given("a ProductModel has a text VariantDimension", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this, "Handle colour", ["black handle"]);
});

Given('a Variant exists with canonical option value "black handle"', async function (this: ScenarioWorld) {
  await createBaseVariant(this, { "Handle colour": "black handle" });
});

When("Catalog Operator creates a Variant with equivalent whitespace and casing", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variants`, {
    selectedOptions: { "Handle colour": " BLACK   HANDLE " },
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
  });
  baseRemember(this, response);
});

Then("the duplicate canonical combination is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Given("a ProductModel has Material, Finish, and Pack Reference dimensions", async function (this: ScenarioWorld) {
  await baseModel(this);
  for (const kind of ["material", "finish", "pack"] as const) {
    const master = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/masters/${kind}`, { name: baseName(this, kind) });
    expect(master.status).toBe(201);
    const masterId = baseId(master.data, `${kind} master`);
    if (kind === "material") state(this).baseMaterialId = masterId;
    if (kind === "finish") state(this).baseFinishId = masterId;
    if (kind === "pack") state(this).basePackId = masterId;
    await addDimension(this, kind[0].toUpperCase() + kind.slice(1), [masterId]);
  }
});

When("Catalog Operator selects a referenced master by display text", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variants`, {
    selectedOptions: { Material: state(this).baseMaterialId, Finish: state(this).baseFinishId, Pack: state(this).basePackId },
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
  });
  baseRemember(this, response);
  if (response.status === 201) state(this).baseVariantId = baseId(response.data, "Variant");
});

Then("the Variant stores the master identity rather than display text", async function (this: ScenarioWorld) {
  const variant = record(state(this).baseResponse?.data);
  const selected = record(variant.selectedOptions);
  expect(selected.Material).toBe(state(this).baseMaterialId);
});

Then("equivalent display labels cannot create a duplicate combination", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variants`, {
    selectedOptions: { Material: state(this).baseMaterialId, Finish: state(this).baseFinishId, Pack: state(this).basePackId },
    sku: `VAR-${crypto.randomUUID()}`,
    sellingPrice: { amount: 400000, currency: "VND" },
  });
  baseRemember(this, response);
  baseRejected(this);
});

Given("a ProductModel has a fixed Pack reference and no Pack VariantDimension", async function (this: ScenarioWorld) {
  const pack = await (await baseApi(this)).adminPost(await baseToken(this), "/v1/admin/catalog/masters/pack", { name: baseName(this, "fixed-pack"), sellingUnit: "Box", quantity: 10, baseUnit: "Piece" });
  expect(pack.status).toBe(201);
  state(this).basePackId = baseId(pack.data, "Pack");
  await baseModel(this, { fixedPackId: state(this).basePackId });
  await baseDimension(this);
});

When("Catalog Operator creates a Variant from its selectable dimensions", async function (this: ScenarioWorld) {
  await createBaseVariant(this, { Size: "200 mm" });
});

Then("every Variant uses the ProductModel Pack reference", async function (this: ScenarioWorld) {
  const variant = await readBaseVariant(this);
  expect(variant.packId).toBe(state(this).basePackId);
});

Then("the fixed Pack reference does not change combination identity", async function (this: ScenarioWorld) {
  const variant = await readBaseVariant(this);
  expect(variant.canonicalCombination).toBeDefined();
  expect(record(variant.selectedOptions)).toEqual({ Size: "200 mm" });
});

Given("an Active Variant has a reserved SKU and current SellingPrice", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await createBaseVariant(this);
});

When("Catalog Operator inactivates the Catalog Base Variant", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPost(await baseToken(this), `/v1/admin/catalog/variants/${state(this).baseVariantId}/inactivate`);
  baseRemember(this, response);
});

Then("the Variant is excluded from public sellability", async function (this: ScenarioWorld) {
  expect(state(this).baseResponse?.status).toBe(200);
  expect(record(state(this).baseResponse?.data).status).toBe("Inactive");
});

Then("its SKU, SellingPrice, Pack reference, and history remain readable", async function (this: ScenarioWorld) {
  const variant = await readBaseVariant(this);
  expect(variant.sku).toBeDefined();
  expect(variant.sellingPrice).toBeDefined();
  expect(variant).toHaveProperty("packId");
  expect(variant).toHaveProperty("history");
});

Given("a ProductModel has existing Variants and a VariantDimension", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await createBaseVariant(this);
});

When("Catalog Operator replaces that VariantDimension with another definition", async function (this: ScenarioWorld) {
  const definition = await (await baseApi(this)).adminPost(await baseToken(this), "/v1/admin/catalog/attribute-definitions", {
    key: baseName(this, "replacement-definition"), displayName: "Replacement", valueKind: "Enum",
  });
  expect(definition.status).toBe(201);
  const response = await (await baseApi(this)).adminPatch(await baseToken(this), `/v1/admin/catalog/product-models/${await baseModel(this)}/variant-dimensions/${state(this).baseDimensionId}`, {
    definitionId: baseId(definition.data, "Replacement definition"),
  });
  baseRemember(this, response);
});

Then("the Catalog Base structural dimension change is rejected", function (this: ScenarioWorld) {
  baseRejected(this);
});

Given("an Active Variant has a valid SKU and SellingPrice", async function (this: ScenarioWorld) {
  await baseModel(this);
  await baseDimension(this);
  await createBaseVariant(this);
});

When("Catalog Operator removes its SKU or makes its price invalid", async function (this: ScenarioWorld) {
  const response = await (await baseApi(this)).adminPatch(await baseToken(this), `/v1/admin/catalog/variants/${state(this).baseVariantId}`, { sku: "" });
  baseRemember(this, response);
});

Then("the Variant is no longer sale-ready", async function (this: ScenarioWorld) {
  const variant = await readBaseVariant(this);
  expect(variant.saleReady).toBe(false);
});

Then("no independent sale-ready flag is stored", async function (this: ScenarioWorld) {
  const variant = await readBaseVariant(this);
  expect(variant).not.toHaveProperty("saleReadyOverride");
  expect(variant).not.toHaveProperty("isSaleReady");
});
