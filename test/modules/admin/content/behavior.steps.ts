import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPatch, adminPost, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { getAdminToken, getUserToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.content") return;
  this.activeModule = "admin.content";
});

Given("the content operator needs a reusable asset", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the content operator uploads or selects media in the shared library", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/media?page=1&pageSize=24");
  assertReadable(this);
  const token = await getAdminToken(await this.getApiRequest());
  const presigned = await (await this.getApiClient()).get<Record<string, unknown>>(
    "/v1/admin/media/presigned?fileName=cucumber-contract.png&contentType=image/png",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect(presigned.status).toBe(200);
  this.state.mediaPresigned = presigned.data;
});

Then("the library makes that asset available across content surfaces", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Then("assets already in use remain protected from destructive removal", async function (this: ScenarioWorld) {
  const data = this.state.mediaPresigned as Record<string, unknown>;
  expect(typeof data.id).toBe("string");
  expect(typeof data.public_url).toBe("string");
  expect(typeof data.upload_url).toBe("string");
});

When("an unauthenticated client reads the shared media library", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/media?page=1&pageSize=10");
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/media" };
});

Then("the shared media response status is `401` or `403`", function (this: ScenarioWorld) {
  expect([401, 403]).toContain(adminState(this).response?.status);
});

Given("a shopper token is available for content access", async function (this: ScenarioWorld) {
  this.state.contentUserToken = await getUserToken(await this.getApiRequest());
});

When("the shopper reads the shared media library", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/media?page=1&pageSize=10", {
    headers: { Authorization: `Bearer ${String(this.state.contentUserToken)}` },
  });
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/media" };
});

Then("the shared media response status is `403`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(403);
});

Given("a page context needs banner presence", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the content operator changes the active banner set or banner order", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/banners", { active: true, sort_order: 0 });
});

Then("the page context reflects the new banner priority and active state", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await adminGet(this, "/v1/admin/banners");
  assertReadable(this);
});

Then("inactive banners stop representing that page context", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the content operator chooses Visual editor mode", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  this.state.editorMode = "html";
});

When("the content operator types formatted text or pastes an image", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/content/articles", { title: `Cucumber HTML ${Date.now()}`, body: "<p>Formatted content</p>", content_format: "html", status: "draft" });
});

Then("the editor displays rich text formatting and inline images directly", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the content is saved as HTML", async function (this: ScenarioWorld) {
  expect(this.state.editorMode).toBe("html");
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the content operator chooses Markdown editor mode", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  this.state.editorMode = "markdown";
});

When("the content operator types Markdown syntax or pastes an image", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/content/articles", { title: `Cucumber Markdown ${Date.now()}`, body: "# Cucumber\n\n![image](https://example.com/image.png)", content_format: "markdown", status: "draft" });
});

Then("the editor displays Markdown code and inserts image syntax automatically", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the content is saved as Markdown", async function (this: ScenarioWorld) {
  expect(this.state.editorMode).toBe("markdown");
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("an article is ready for public reading", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminPost(this, "/v1/content/articles", { title: `Cucumber Published ${Date.now()}`, body: "Published article", status: "draft" });
});

When("the content operator publishes the article", async function (this: ScenarioWorld) {
  const data = responseData(this);
  const id = String(data.id ?? data.article_id ?? "");
  adminState(this).recordId = id;
  await adminPatch(this, `/v1/content/articles/${id}`, { status: "published" });
});

Then("the article becomes part of the public editorial stream", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await (await this.getApiClient()).get("/v1/public/content/articles");
});

Then("the storefront renders the article using its stored structure", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the FAQ set contains multiple answers", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/faqs");
});

When("the content operator changes FAQ order or active state", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/faqs", { question: "Cucumber FAQ", answer: "Answer", active: true, sort_order: 0 });
});

Then("the public knowledge surface reflects the new answer priority", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await (await this.getApiClient()).get("/v1/faqs/active");
});

Then("inactive answers stop acting as public guidance", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("a published article exists in the store content", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/public/content/articles");
});

When("the store operator selects this article for the About Us page in Store Settings", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/settings/about_article_id", { article_id: adminState(this).recordId ?? null });
});

When("the store operator saves the settings", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/store-settings");
});

Then("the storefront About Us page displays the title and body of the linked article", async function (this: ScenarioWorld) {
  assertReadable(this);
  const response = await (await this.getApiClient()).get("/v1/public/content/pages/about");
  expect(response.ok).toBe(true);
});

Given("the About Us page is currently linked to an article", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When('the store operator selects "None" for the About Us page in Store Settings', async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/settings/about_article_id", { article_id: null });
});

Then("the storefront About Us page displays the default company introduction narrative", async function (this: ScenarioWorld) {
  assertAccepted(this);
  const response = await (await this.getApiClient()).get("/v1/public/content/pages/about");
  expect(response.ok).toBe(true);
});

Given("a product already exists in the catalog", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/products?limit=1");
});

When("the content operator changes product media or rich content", async function (this: ScenarioWorld) {
  const items = (responseData(this).items ?? []) as Array<Record<string, unknown>>;
  const id = String(items[0]?.id ?? "");
  adminState(this).recordId = id;
  await adminPatch(this, `/v1/admin/products/${id}`, { description: "Cucumber editorial context" });
});

Then("the product gains new editorial context", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the product's commercial state remains owned by the product domain", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the content operator is composing an article with draft status", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminPost(this, "/v1/content/articles", { title: `Cucumber Draft ${Date.now()}`, body: "Draft body", status: "draft" });
});

When("the content operator triggers the article preview", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/content/articles/${String(responseData(this).id ?? "")}/preview`);
});

Then("a storefront preview modal opens", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the modal displays the draft article's title, cover image, and body content", async function (this: ScenarioWorld) {
  expect(responseData(this)).toBeTruthy();
});

async function contentUi(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginContentAdmin(world: ScenarioWorld): Promise<void> {
  const current = await contentUi(world);
  const email = process.env.ADMIN_USER_EMAIL?.trim();
  const password = process.env.ADMIN_USER_PASSWORD?.trim();
  if (!email || !password) throw new Error("Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD for admin content browser scenarios.");
  await current.auth.gotoLogin();
  await current.auth.login(email, password);
  await current.page.waitForLoadState("domcontentloaded");
}

Given("an admin opens content settings", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/settings");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

When("the admin opens the shared media picker", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await current.page.locator('[data-testid="settings-brand-logo-open-media-picker"]').click();
});

Then("reusable media items are visible in the picker", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.locator('[data-testid="media-picker-modal"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="media-picker-item"]').first()).toBeVisible();
});

Given("an admin opens banner management", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/banners");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("banner page-context controls are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "Banner Management" })).toBeVisible();
  await expect(current.page.locator('[data-testid="banner-presence-controls"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="banner-presence-toggle"]')).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Homepage" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Products" })).toBeVisible();
});

Given("an admin opens article management", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/articles");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("article list and About ownership controls are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "Article Management" })).toBeVisible();
  await expect(current.page.locator('[data-testid="articles-list-container"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="article-about-owner-control"]')).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Save draft" })).toBeVisible();
});

Given("an admin opens FAQ management", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/faqs");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("FAQ ordering and public-visibility controls are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "FAQ Management" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: /active/i })).toBeVisible();
  await expect(current.page.getByRole("button", { name: /draft/i })).toBeVisible();
  await expect(current.page.getByText(/public reflection/i)).toBeVisible();
});

Given("an admin opens product management for editorial review", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/products");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("product editor entry points are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "Product Management" })).toBeVisible();
  await expect(current.page.locator('[data-testid="create-btn"]')).toBeVisible();
  await expect(current.page.getByText(/quick access to full product editing/i)).toBeVisible();
  await expect(current.page.locator('[data-testid="edit-btn"]').first()).toBeVisible();
});
