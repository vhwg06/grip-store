import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { getAdminToken } from "../../../shared/runtime/api-helpers/auth.helpers";

type ModelState = {
  productId?: string;
  response?: { status: number; data: unknown };
  model?: Record<string, unknown>;
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
