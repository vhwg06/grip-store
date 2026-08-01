import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { getAdminToken, getUserToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { isolatedReference, requiredTestTenant } from "../../../shared/data/test-isolation";

type ProductAdministrationState = {
  adminToken?: string;
  userToken?: string;
  productId?: string;
  rootCategoryId?: string;
  childCategoryId?: string;
  response?: { status: number; data: unknown };
  form?: Record<string, unknown>;
  publishedArticleId?: string;
  draftArticleId?: string;
};

function state(world: ScenarioWorld): ProductAdministrationState {
  return world.state as ProductAdministrationState;
}

async function adminToken(world: ScenarioWorld): Promise<string> {
  state(world).adminToken ??= await getAdminToken(await world.getApiRequest());
  return state(world).adminToken!;
}

async function userToken(world: ScenarioWorld): Promise<string> {
  state(world).userToken ??= await getUserToken(await world.getApiRequest());
  return state(world).userToken!;
}

async function adminHeaders(world: ScenarioWorld) {
  return { Authorization: `Bearer ${await adminToken(world)}` };
}

async function firstCategory(world: ScenarioWorld): Promise<string> {
  const response = await (await world.getApiClient()).get<unknown>("/v1/catalog/categories");
  expect(response.status).toBe(200);
  const categories = Array.isArray(response.data) ? response.data : [];
  expect(categories.length).toBeGreaterThan(0);
  return String((categories[0] as Record<string, unknown>).id);
}

async function createProduct(world: ScenarioWorld, specs?: Array<{ key: string; value: string }>): Promise<void> {
  const tenant = requiredTestTenant();
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const response = await (await world.getApiClient()).post<Record<string, unknown>>("/v1/admin/products", {
    title: isolatedReference(world, `Cucumber catalog product ${suffix}`),
    sku: isolatedReference(world, `CUC-${suffix}`),
    tenant_id: tenant,
    price: 12345,
    category_id: await firstCategory(world),
    is_active: true,
    ...(specs ? { specs } : {}),
  }, { headers: await adminHeaders(world) });
  state(world).response = { status: response.status, data: response.data };
  expect([200, 201]).toContain(response.status);
  const payload = response.data as Record<string, unknown>;
  state(world).productId = String(payload.id ?? (payload.data as Record<string, unknown> | undefined)?.id);
  expect(state(world).productId).toBeTruthy();
}

async function readForm(world: ScenarioWorld): Promise<Record<string, unknown>> {
  const response = await (await world.getApiClient()).get<Record<string, unknown>>(
    `/v1/admin/products/${state(world).productId}/form`,
    { headers: await adminHeaders(world) },
  );
  expect(response.status).toBe(200);
  state(world).form = response.data;
  return response.data;
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "catalog.product") return;
  this.activeModule = "catalog.product";
});

When("an unauthenticated client reads the admin product catalog", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/products");
  state(this).response = { status: response.status, data: response.data };
});

Then("the admin product catalog response status is `401`", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

Given("a shopper access token is available", async function (this: ScenarioWorld) {
  await userToken(this);
});

When("the shopper reads the admin product catalog", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/products", {
    headers: { Authorization: `Bearer ${await userToken(this)}` },
  });
  state(this).response = { status: response.status, data: response.data };
});

Then("the admin product catalog response status is `403`", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(403);
});

Given("an admin access token is available", async function (this: ScenarioWorld) {
  await adminToken(this);
});

When("the admin reads the admin product catalog", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<unknown>("/v1/admin/products", { headers: await adminHeaders(this) });
  state(this).response = { status: response.status, data: response.data };
});

Then("the admin product catalog response status is `200`", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

function rows(world: ScenarioWorld): Array<Record<string, unknown>> {
  const payload = state(world).response?.data;
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  const record = payload as Record<string, unknown> | undefined;
  for (const key of ["products", "items", "data"]) {
    if (Array.isArray(record?.[key])) return record[key] as Array<Record<string, unknown>>;
  }
  return [];
}

Then("each admin product row exposes identity, category, stock, visibility, and ordering fields", async function (this: ScenarioWorld) {
  for (const row of rows(this)) {
    expect(typeof row.id).toBe("string");
    expect(typeof row.title).toBe("string");
    expect(row).toHaveProperty("category_id");
    expect(row).toHaveProperty("stock_count");
    expect(row).toHaveProperty("is_active");
    expect(row).toHaveProperty("sort_order");
  }
});

Then("each admin product row exposes media, visibility, and stock signals", async function (this: ScenarioWorld) {
  for (const row of rows(this)) {
    expect("image_url" in row || "images" in row).toBe(true);
    expect("is_active" in row).toBe(true);
    expect("stock_count" in row).toBe(true);
  }
});

When("the admin creates a sellable product with a category", async function (this: ScenarioWorld) {
  await createProduct(this);
});

Then("the product creation response status is successful", async function (this: ScenarioWorld) {
  expect([200, 201]).toContain(state(this).response?.status);
});

Then("the admin product form returns the created product and categories", async function (this: ScenarioWorld) {
  const form = await readForm(this);
  const product = form.product as Record<string, unknown>;
  expect(product.id).toBe(state(this).productId);
  expect(Array.isArray(form.categories)).toBe(true);
});

Given("an admin-created product exists", async function (this: ScenarioWorld) {
  await createProduct(this);
});

When("the admin updates its title, price, purchase limit, visibility, category, and description", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).patch(`/v1/admin/products/${state(this).productId}`, {
    title: `Updated Cucumber product ${Date.now()}`,
    price: 2222,
    purchase_limit: 3,
    visibility_level: 2,
    category_id: await firstCategory(this),
    description: "updated through the catalog product contract",
  }, { headers: await adminHeaders(this) });
  state(this).response = { status: response.status, data: response.data };
});

Then("the product update response status is successful", async function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

Then("the admin product form returns every updated commercial field", async function (this: ScenarioWorld) {
  const form = await readForm(this);
  const product = form.product as Record<string, unknown>;
  expect(product.title).toContain("Updated Cucumber product");
  expect(product.price).toBe(2222);
  expect(product.purchase_limit).toBe(3);
  expect(product.visibility_level).toBe(2);
  expect(product.description).toBe("updated through the catalog product contract");
});

When("the admin creates a root category and a child category", async function (this: ScenarioWorld) {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const root = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/admin/categories", {
    name: `Cucumber root ${suffix}`,
    slug: `cucumber-root-${suffix}`,
  }, { headers: await adminHeaders(this) });
  expect([200, 201]).toContain(root.status);
  state(this).rootCategoryId = String((root.data as Record<string, unknown>).id);
  const child = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/admin/categories", {
    name: `Cucumber child ${suffix}`,
    slug: `cucumber-child-${suffix}`,
    parent_id: state(this).rootCategoryId,
  }, { headers: await adminHeaders(this) });
  expect([200, 201]).toContain(child.status);
  state(this).childCategoryId = String((child.data as Record<string, unknown>).id);
});

When("the admin changes the root category position to `9`", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/admin/categories", {
    id: state(this).rootCategoryId,
    name: "Cucumber root reordered",
    position: 9,
  }, { headers: await adminHeaders(this) });
  state(this).response = { status: response.status, data: response.data };
  expect([200, 201]).toContain(response.status);
});

Then("the category read model preserves the parent relationship and position", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<unknown>("/v1/admin/categories", { headers: await adminHeaders(this) });
  expect(response.status).toBe(200);
  const categories = Array.isArray(response.data) ? response.data as Array<Record<string, unknown>> : [];
  const root = categories.find((item) => item.id === state(this).rootCategoryId);
  const child = categories.find((item) => item.id === state(this).childCategoryId);
  expect(root?.position).toBe(9);
  expect(child?.parent_id).toBe(state(this).rootCategoryId);
});

When("the admin reads its product form", async function (this: ScenarioWorld) {
  await readForm(this);
});

Then("the form returns product and category data", async function (this: ScenarioWorld) {
  expect(state(this).form?.product).toBeTruthy();
  expect(Array.isArray(state(this).form?.categories)).toBe(true);
});

Then("the form does not claim ownership of cards or inventory", async function (this: ScenarioWorld) {
  expect(state(this).form).not.toHaveProperty("cards");
  expect(state(this).form).not.toHaveProperty("inventory");
});

Given("an admin-created product and published and draft intro articles exist", async function (this: ScenarioWorld) {
  requiredTestTenant();
  await createProduct(this);
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  for (const status of ["published", "draft"] as const) {
    const response = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/content/articles", {
      title: `Cucumber intro ${status} ${suffix}`,
      slug: `cucumber-intro-${status}-${suffix}`,
      body: `Cucumber ${status} intro article`,
      status,
    }, { headers: await adminHeaders(this) });
    expect(response.status).toBe(201);
    const id = String((response.data as Record<string, unknown>).id);
    if (status === "published") state(this).publishedArticleId = id;
    else state(this).draftArticleId = id;
  }
});

async function linkIntroArticle(world: ScenarioWorld, articleId: string | null): Promise<void> {
  const response = await (await world.getApiClient()).patch(`/v1/admin/products/${state(world).productId}`, {
    introArticleId: articleId,
  }, { headers: await adminHeaders(world) });
  expect(response.status).toBe(200);
}

When("the admin links the published intro article to the product", async function (this: ScenarioWorld) {
  await linkIntroArticle(this, state(this).publishedArticleId!);
});

Then("the product form and public detail expose that published article", async function (this: ScenarioWorld) {
  const form = await readForm(this);
  const product = form.product as Record<string, unknown>;
  expect(product.intro_article_id).toBe(state(this).publishedArticleId);
  const publicResponse = await (await this.getApiClient()).get<Record<string, unknown>>(`/v1/catalog/products/${state(this).productId}`);
  expect(publicResponse.status).toBe(200);
  expect((publicResponse.data.intro_article as Record<string, unknown>).id).toBe(state(this).publishedArticleId);
});

When("the admin links the draft intro article to the product", async function (this: ScenarioWorld) {
  await linkIntroArticle(this, state(this).draftArticleId!);
});

Then("public product detail hides the draft article", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>(`/v1/catalog/products/${state(this).productId}`);
  expect(response.status).toBe(200);
  expect(response.data.intro_article ?? null).toBeNull();
});

When("the admin clears the product intro article link", async function (this: ScenarioWorld) {
  await linkIntroArticle(this, null);
});

Then("the product form has no intro article link", async function (this: ScenarioWorld) {
  const form = await readForm(this);
  expect((form.product as Record<string, unknown>).intro_article_id ?? null).toBeNull();
});

When("the admin creates a product with specifications", async function (this: ScenarioWorld) {
  await createProduct(this, [{ key: "Material", value: "Brass" }, { key: "Finish", value: "Gold" }]);
});

Then("the public product detail returns those specifications", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>(`/v1/catalog/products/${state(this).productId}`);
  expect(response.status).toBe(200);
  const specs = response.data.specs as Array<Record<string, unknown>>;
  expect(specs.some((item) => item.key === "Material" && item.value === "Brass")).toBe(true);
});

Given("an admin-created product has specification `KeyA`", async function (this: ScenarioWorld) {
  await createProduct(this, [{ key: "KeyA", value: "ValueA" }]);
});

When("the admin replaces its specifications with `KeyB`", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).patch(`/v1/admin/products/${state(this).productId}`, {
    specs: [{ key: "KeyB", value: "ValueB" }],
  }, { headers: await adminHeaders(this) });
  state(this).response = { status: response.status, data: response.data };
  expect(response.status).toBe(200);
});

async function publicSpecs(world: ScenarioWorld): Promise<Array<Record<string, unknown>>> {
  const response = await (await world.getApiClient()).get<Record<string, unknown>>(`/v1/catalog/products/${state(world).productId}`);
  expect(response.status).toBe(200);
  return response.data.specs as Array<Record<string, unknown>>;
}

Then("public product detail contains `KeyB`", async function (this: ScenarioWorld) {
  expect((await publicSpecs(this)).some((item) => item.key === "KeyB" && item.value === "ValueB")).toBe(true);
});

Then("public product detail does not contain `KeyA`", async function (this: ScenarioWorld) {
  expect((await publicSpecs(this)).some((item) => item.key === "KeyA")).toBe(false);
});

Given("an admin-created product has product detail records", async function (this: ScenarioWorld) {
  await createProduct(this, [{ key: "DeleteKey", value: "DeleteValue" }]);
});

When("the admin deletes the product", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete(`/v1/admin/products/${state(this).productId}`, { headers: await adminHeaders(this) });
  state(this).response = { status: response.status, data: response.data };
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
});

Then("public product detail responds with `404`", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get(`/v1/catalog/products/${state(this).productId}`);
  expect(response.status).toBe(404);
});

Then("product detail records are not publicly visible", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get(`/v1/catalog/products/${state(this).productId}`);
  expect(response.status).toBe(404);
});
