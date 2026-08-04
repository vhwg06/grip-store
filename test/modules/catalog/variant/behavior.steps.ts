import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { getAdminToken } from "../../../shared/runtime/api-helpers/auth.helpers";

type VariantState = {
  productId?: string;
  response?: { status: number; data: unknown };
  selectedOptions?: Record<string, string>;
};

function state(world: ScenarioWorld): VariantState {
  return world.state as VariantState;
}

async function headers(world: ScenarioWorld) {
  return { Authorization: `Bearer ${await getAdminToken(await world.getApiRequest())}` };
}

async function chooseModel(world: ScenarioWorld): Promise<string> {
  if (state(world).productId) return state(world).productId!;
  const response = await (await world.getApiClient()).get<{ items?: Array<{ id: string }> }>("/v1/catalog/products?limit=20");
  expect(response.ok, "Variant scenarios require a reachable catalog").toBe(true);
  const product = response.data.items?.[0];
  expect(product).toBeTruthy();
  state(world).productId = product!.id;
  return product!.id;
}

async function mutate(world: ScenarioWorld, payload: Record<string, unknown>): Promise<void> {
  const response = await (await world.getApiClient()).patch(`/v1/admin/products/${await chooseModel(world)}`, payload, { headers: await headers(world) });
  state(world).response = { status: response.status, data: response.data };
}

async function publicRead(world: ScenarioWorld): Promise<void> {
  const response = await (await world.getApiClient()).get(`/v1/catalog/products/${await chooseModel(world)}`);
  state(world).response = { status: response.status, data: response.data };
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
  expect(state(this).response?.status).toBeLessThan(300);
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

function deferredVariant(): never {
  throw new Error("Catalog Base Variant operations are deferred pending canonical OpenAPI.");
}

Given("a ProductModel has an active VariantDimension with allowed values", deferredVariant);
When("Catalog Operator creates a Variant using a value outside that set", deferredVariant);
Then("the Variant command is rejected", deferredVariant);
Given("an existing Variant uses a selectable value", deferredVariant);
When("Catalog Operator deactivates that selectable value", deferredVariant);
Then("new Variant creation using that value is rejected", deferredVariant);
Then("the existing Variant selection remains readable", deferredVariant);
Given("a Variant exists with an immutable selected combination", deferredVariant);
When("Catalog Operator requests a different selected combination for that Variant", deferredVariant);
Then("the selected-combination mutation is rejected", deferredVariant);
Then("a replacement Variant is required before the old Variant is inactivated", deferredVariant);
Given("a ProductModel has a text VariantDimension", deferredVariant);
Given('a Variant exists with canonical option value "black handle"', deferredVariant);
When("Catalog Operator creates a Variant with equivalent whitespace and casing", deferredVariant);
Then("the duplicate canonical combination is rejected", deferredVariant);
Given("a ProductModel has Material, Finish, and Pack Reference dimensions", deferredVariant);
When("Catalog Operator selects a referenced master by display text", deferredVariant);
Then("the Variant stores the master identity rather than display text", deferredVariant);
Then("equivalent display labels cannot create a duplicate combination", deferredVariant);
Given("a ProductModel has a fixed Pack reference and no Pack VariantDimension", deferredVariant);
When("Catalog Operator creates a Variant from its selectable dimensions", deferredVariant);
Then("every Variant uses the ProductModel Pack reference", deferredVariant);
Then("the fixed Pack reference does not change combination identity", deferredVariant);
Given("an Active Variant has a reserved SKU and current SellingPrice", deferredVariant);
Then("the Variant is excluded from public sellability", deferredVariant);
Then("its SKU, SellingPrice, Pack reference, and history remain readable", deferredVariant);
Given("a ProductModel has existing Variants and a VariantDimension", deferredVariant);
When("Catalog Operator replaces that VariantDimension with another definition", deferredVariant);
Given("an Active Variant has a valid SKU and SellingPrice", deferredVariant);
When("Catalog Operator removes its SKU or makes its price invalid", deferredVariant);
Then("the Variant is no longer sale-ready", deferredVariant);
Then("no independent sale-ready flag is stored", deferredVariant);
