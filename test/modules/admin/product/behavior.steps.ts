import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { getAdminToken, requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";
import { AdminPage } from "../../../shared/runtime/objects/admin.page";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { ProductListPage } from "../../../shared/runtime/objects/product-list.page";
import { requiredTestTenant } from "../../../shared/data/test-isolation";

type AdminProductUiState = {
  productName?: string;
  productId?: string;
};

function state(world: ScenarioWorld): AdminProductUiState {
  return world.state as AdminProductUiState;
}

async function ui(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, admin: new AdminPage(page), auth: new AuthPage(page), list: new ProductListPage(page) };
}

async function login(world: ScenarioWorld): Promise<void> {
  const current = await ui(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.product") return;
  this.activeModule = "admin.product";
});

Given("an admin opens the product creation form", async function (this: ScenarioWorld) {
  await login(this);
  const current = await ui(this);
  await current.page.goto("/admin/product/new");
  await current.page.waitForLoadState("networkidle");
});

When("the admin creates a product with two specifications", async function (this: ScenarioWorld) {
  requiredTestTenant();
  const current = await ui(this);
  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  state(this).productName = `Cucumber admin product ${unique}`;
  await current.page.locator('[data-testid="field-title"]').fill(state(this).productName!);
  await current.page.locator('[data-testid="field-price"]').fill("199.99");
  await current.page.locator("#slug").fill(`cucumber-admin-${unique}`);
  const addSpec = current.page.locator('[data-testid="add-spec-row-btn"]');
  await addSpec.click();
  await current.page.locator('[data-testid="spec-key-0"]').fill("Material");
  await current.page.locator('[data-testid="spec-value-0"]').fill("Aluminum");
  await addSpec.click();
  await current.page.locator('[data-testid="spec-key-1"]').fill("Length");
  await current.page.locator('[data-testid="spec-value-1"]').fill("125mm");
  await current.page.locator('[data-testid="save-btn"]').click();
  await current.page.waitForLoadState("networkidle");
});

Then("the created product can be found through the public catalog", async function (this: ScenarioWorld) {
  const current = await ui(this);
  const response = await this.getApiClient().then((client) => client.get<unknown>("/v1/catalog/products?limit=100"));
  expect(response.status).toBe(200);
  const payload = response.data as { items?: Array<{ id?: string; title?: string }> };
  const found = (payload.items ?? []).find((item) => item.title === state(this).productName);
  expect(found?.id).toBeTruthy();
  state(this).productId = found!.id;
  await current.page.goto(`/products/placeholder?id=${encodeURIComponent(state(this).productId!)}`);
  await current.page.waitForLoadState("networkidle");
});

Then("storefront detail renders both saved specifications", async function (this: ScenarioWorld) {
  const current = await ui(this);
  await expect(current.page.locator('[data-testid="product-specs-table"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="spec-val-Material"]')).toHaveText("Aluminum");
  await expect(current.page.locator('[data-testid="spec-val-Length"]')).toHaveText("125mm");
});

When("the admin selects an image for the product media field", async function (this: ScenarioWorld) {
  const current = await ui(this);
  await current.page.locator('input[data-testid="media-file-input"]').first().setInputFiles({
    name: "cucumber-product.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ", "base64"),
  });
});

Then("the media preview card and image are visible", async function (this: ScenarioWorld) {
  const current = await ui(this);
  await expect(current.page.locator('[data-testid="media-preview-image"]').first()).toBeVisible();
  await expect(current.page.locator('[data-testid="media-preview-card"]').first()).toBeVisible();
});

Then("the product save action remains enabled", async function (this: ScenarioWorld) {
  await expect((await ui(this)).page.locator('[data-testid="save-btn"]')).toBeEnabled();
});

Given("an admin opens the product list", async function (this: ScenarioWorld) {
  await login(this);
  const current = await ui(this);
  await current.admin.goto();
  await current.admin.navigateTo("products");
});

Then("each product row exposes toggle, edit, and delete actions", async function (this: ScenarioWorld) {
  const current = await ui(this);
  await expect(current.page.locator('[data-testid="admin-table"], [data-testid="admin-table-empty"]')).toBeVisible();
  const row = current.page.locator("[data-item-id]").first();
  await expect(row).toBeVisible();
  await expect(row.locator('[data-testid="toggle-btn"]')).toBeVisible();
  await expect(row.locator('[data-testid="edit-btn"]')).toBeVisible();
  await expect(row.locator('[data-testid="delete-btn"]')).toBeVisible();
});

When("the admin toggles a product row and confirms deletion", async function (this: ScenarioWorld) {
  const current = await ui(this);
  const row = current.page.locator("[data-item-id]").first();
  await row.locator('[data-testid="toggle-btn"]').click();
  await current.page.waitForLoadState("networkidle");
  await row.locator('[data-testid="delete-btn"]').click();
  const confirm = current.page.locator('[data-testid="confirm-delete-btn"]');
  if (await confirm.isVisible()) await confirm.click();
  await current.page.waitForLoadState("networkidle");
});

Then("the product list remains available after the lifecycle actions", async function (this: ScenarioWorld) {
  await expect((await ui(this)).page.locator('[data-testid="admin-table"], [data-testid="admin-table-empty"]')).toBeVisible();
});

Then("product visibility and stock health filters are visible", async function (this: ScenarioWorld) {
  const current = await ui(this);
  await expect(current.page.getByRole("button", { name: "Visible" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Hidden" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Low stock" })).toBeVisible();
});

Given("an admin opens an existing product editor", async function (this: ScenarioWorld) {
  await login(this);
  const response = await (await this.getApiClient()).get<unknown>("/v1/admin/products", {
    headers: { Authorization: `Bearer ${await getAdminToken(await this.getApiRequest())}` },
  });
  expect(response.status).toBe(200);
  const payload = response.data as { items?: Array<{ id?: string }> };
  const productId = payload.items?.[0]?.id;
  expect(productId).toBeTruthy();
  state(this).productId = productId;
  const current = await ui(this);
  await current.page.goto(`/admin/product/edit/placeholder?id=${encodeURIComponent(productId!)}`);
  await current.page.waitForLoadState("networkidle");
});

When("the admin selects a published intro article and saves the link", async function (this: ScenarioWorld) {
  const current = await ui(this);
  const articleResponse = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/content/articles", {
    title: `Cucumber UI intro ${Date.now()}`,
    slug: `cucumber-ui-intro-${Date.now()}`,
    body: "Cucumber UI intro body",
    status: "published",
  }, { headers: { Authorization: `Bearer ${await getAdminToken(await this.getApiRequest())}` } });
  expect(articleResponse.status).toBe(201);
  const articleId = String((articleResponse.data as Record<string, unknown>).id);
  await current.page.locator("#intro-article-select").selectOption(articleId);
  await current.page.getByRole("button", { name: "Save link" }).click();
});

Then("the product form persists the linked article", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>(`/v1/admin/products/${state(this).productId}/form`, {
    headers: { Authorization: `Bearer ${await getAdminToken(await this.getApiRequest())}` },
  });
  expect(response.status).toBe(200);
  expect((response.data.product as Record<string, unknown>).intro_article_id).toBeTruthy();
});

Then("the editor exposes a return path to the linked article", async function (this: ScenarioWorld) {
  await expect((await ui(this)).page.getByRole("link", { name: "Edit linked article" })).toBeVisible();
});

Given("an admin opens category management", async function (this: ScenarioWorld) {
  await login(this);
  const current = await ui(this);
  await current.page.goto("/admin/categories");
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator("#cat-sort").first()).toBeVisible();
});

When("the admin saves a category position", async function (this: ScenarioWorld) {
  const current = await ui(this);
  await current.page.locator("#cat-sort").first().fill("1");
  await current.page.getByRole("button", { name: "Save Changes" }).click();
  await current.page.waitForLoadState("networkidle");
});

Then("the category read model preserves that position", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<unknown>("/v1/admin/categories", {
    headers: { Authorization: `Bearer ${await getAdminToken(await this.getApiRequest())}` },
  });
  expect(response.status).toBe(200);
  const rows = Array.isArray(response.data) ? response.data as Array<Record<string, unknown>> : [];
  expect(rows.some((row) => row.position === 1)).toBe(true);
});
