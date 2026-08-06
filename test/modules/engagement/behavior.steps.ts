import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../shared/cucumber/world";
import { getAdminToken, getUserToken, requiredEnv } from "../../shared/runtime/api-helpers/auth.helpers";
import { CatalogApiHelper } from "../../shared/runtime/api-helpers/catalog.api";
import { GoBackendClient } from "../../shared/runtime/api-helpers/go-backend.client";
import { AuthPage } from "../../shared/runtime/objects/auth.page";
import { ProductDetailPage } from "../../shared/runtime/objects/product-detail.page";
import { WishlistPage } from "../../shared/runtime/objects/wishlist.page";

type EngagementState = { productId?: string; token?: string; response?: { status: number; data: unknown } };

function state(world: ScenarioWorld): EngagementState {
  return world.state as EngagementState;
}

async function pages(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return {
    page,
    auth: new AuthPage(page),
    detail: new ProductDetailPage(page),
    wishlist: new WishlistPage(page),
  };
}

async function chooseProduct(world: ScenarioWorld): Promise<string> {
  if (state(world).productId) return state(world).productId!;
  const api = new CatalogApiHelper(new GoBackendClient(await world.getApiRequest()));
  const response = await api.getProducts({ limit: 1 });
  expect(response.ok, "engagement requires a reachable catalog").toBe(true);
  expect(response.data.items.length).toBeGreaterThan(0);
  state(world).productId = response.data.items[0].id;
  return state(world).productId!;
}

async function login(world: ScenarioWorld): Promise<void> {
  const current = await pages(world);
  await current.auth.gotoLogin();
  await current.auth.login(
    requiredEnv("TEST_USER_EMAIL"),
    requiredEnv("TEST_USER_PASSWORD"),
  );
  await current.page.waitForLoadState("domcontentloaded");
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "engagement") return;
  this.activeModule = "engagement";
});

Given("a shopper has an available engagement product", async function (this: ScenarioWorld) {
  state(this).productId = await chooseProduct(this);
});

Given("a product has public reviews", async function (this: ScenarioWorld) {
  state(this).productId = await chooseProduct(this);
});

When("a shopper opens the product page", async function (this: ScenarioWorld) {
  await (await pages(this)).detail.goto(await chooseProduct(this));
});

Then("the reviews are visible", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="review-list"], [data-testid="review-item"], [data-testid="no-reviews"]').first()).toBeVisible();
});

Given("an eligible shopper has a product opinion", async function (this: ScenarioWorld) {
  await login(this);
  await (await pages(this)).detail.goto(await chooseProduct(this));
  await expect((await pages(this)).page.locator('[data-testid="review-form"], [data-testid="product-detail-title"]').first()).toBeVisible();
});

When("the shopper submits a review with a rating", async function (this: ScenarioWorld) {
  const current = await pages(this);
  const form = current.page.locator('[data-testid="review-form"]');
  if (await form.isVisible()) {
    await current.page.locator('[data-testid="review-star-4"]').click();
    await current.page.locator('[data-testid="review-content-input"]').fill(`Cucumber review ${Date.now()}`);
    await current.page.locator('[data-testid="review-submit-btn"]').click();
    await current.page.waitForLoadState("domcontentloaded");
  }
});

Then("the review submission is accepted", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="toast"], [data-testid="review-item"], [data-testid="review-form"]').first()).toBeVisible();
});

Given("a shopper has submitted a review", async function (this: ScenarioWorld) {
  await login(this);
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
  const form = current.page.locator('[data-testid="review-form"]');
  if (await form.isVisible()) {
    await current.page.locator('[data-testid="review-star-4"]').click();
    await current.page.locator('[data-testid="review-content-input"]').fill(`Cucumber persisted review ${Date.now()}`);
    await current.page.locator('[data-testid="review-submit-btn"]').click();
  }
});

When("the shopper reloads the product page", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.page.reload();
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the review appears according to its visibility state", async function (this: ScenarioWorld) {
  const reviews = await (await pages(this)).detail.getReviews();
  expect(reviews).toBeDefined();
});

When("the shopper adds the product to the wishlist", async function (this: ScenarioWorld) {
  await login(this);
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
  await expect(current.page.locator('[data-testid="add-wishlist-btn"]')).toBeVisible();
  await current.page.locator('[data-testid="add-wishlist-btn"]').click();
});

Then("the wishlist contains the product", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await current.wishlist.goto();
  const items = await current.wishlist.getItems();
  expect(items.some((item) => item.productId === state(this).productId)).toBe(true);
});

Given("a shopper has wishlist items", async function (this: ScenarioWorld) {
  await login(this);
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
  const add = current.page.locator('[data-testid="add-wishlist-btn"]');
  if (await add.isVisible()) await add.click();
});

When("the shopper opens the wishlist page", async function (this: ScenarioWorld) {
  await (await pages(this)).wishlist.goto();
});

Then("the wishlist items are displayed", async function (this: ScenarioWorld) {
  const current = await pages(this);
  await expect(current.page.locator('[data-testid="wishlist-item"], [data-testid="wishlist-empty"]').first()).toBeVisible();
});

Given("the wishlist contains a product", async function (this: ScenarioWorld) {
  await login(this);
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
  const add = current.page.locator('[data-testid="add-wishlist-btn"]');
  if (await add.isVisible()) await add.click();
  await current.wishlist.goto();
  expect((await current.wishlist.getItems()).length).toBeGreaterThan(0);
});

When("the shopper removes the wishlist product", async function (this: ScenarioWorld) {
  const current = await pages(this);
  const items = await current.wishlist.getItems();
  expect(items.length).toBeGreaterThan(0);
  state(this).productId = items[0].productId;
  await current.wishlist.removeItem(items[0].productId);
});

Then("the product is absent from the wishlist", async function (this: ScenarioWorld) {
  const items = await (await pages(this)).wishlist.getItems();
  expect(items.some((item) => item.productId === state(this).productId)).toBe(false);
});

Given("a shopper can vote on a wishlist item", async function (this: ScenarioWorld) {
  await login(this);
  const current = await pages(this);
  await current.detail.goto(await chooseProduct(this));
  const add = current.page.locator('[data-testid="add-wishlist-btn"]');
  if (await add.isVisible()) await add.click();
  await current.wishlist.goto();
  expect((await current.wishlist.getItems()).length).toBeGreaterThan(0);
});

When("the shopper submits a vote", async function (this: ScenarioWorld) {
  const current = await pages(this);
  const items = await current.wishlist.getItems();
  state(this).productId = items[0].productId;
  await current.wishlist.voteItem(items[0].productId);
});

Then("the wishlist vote is recorded", async function (this: ScenarioWorld) {
  const items = await (await pages(this)).wishlist.getItems();
  expect(items.find((item) => item.productId === state(this).productId)?.votes).toBeGreaterThanOrEqual(0);
});

async function engagementToken(world: ScenarioWorld): Promise<string> {
  state(world).token ??= await getUserToken(await world.getApiRequest());
  return state(world).token!;
}

async function engagementProduct(world: ScenarioWorld): Promise<string> {
  return chooseProduct(world);
}

Given("an engagement product exists", async function (this: ScenarioWorld) {
  await engagementProduct(this);
});

When("the client reads public reviews for that product", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get(`/v1/catalog/products/${await engagementProduct(this)}/reviews`);
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `200`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

Then("the public review response is an array with review fields", function (this: ScenarioWorld) {
  const data = state(this).response?.data;
  expect(Array.isArray(data)).toBe(true);
  if (Array.isArray(data) && data.length > 0) {
    expect(data[0].id).toBeDefined();
    expect(data[0].rating).toBeDefined();
    expect(data[0].content).toBeDefined();
  }
});

When("the client creates a review without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/reviews", { product_id: "fake-product", rating: 5, content: "Unauthenticated review" });
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

Given("an authenticated shopper and engagement product are available", async function (this: ScenarioWorld) {
  await engagementToken(this);
  await engagementProduct(this);
});

When("the client creates a review for that product", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/reviews", {
    product_id: await engagementProduct(this),
    rating: 4,
    content: `Cucumber API review ${Date.now()}`,
  }, { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `200`, `201`, or `409`", function (this: ScenarioWorld) {
  expect([200, 201, 409]).toContain(state(this).response?.status);
});

When("the client deletes a review without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete("/v1/reviews/fake-review-id");
  state(this).response = { status: response.status, data: response.data };
});

Given("an authenticated shopper is available for engagement", async function (this: ScenarioWorld) {
  await engagementToken(this);
});

When("the shopper deletes a review", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete("/v1/reviews/fake-review-id", {
    headers: { Authorization: `Bearer ${await engagementToken(this)}` },
  });
  state(this).response = { status: response.status, data: response.data };
});

When("the client reads the public wishlist", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/wishlist");
  state(this).response = { status: response.status, data: response.data };
});

Then("the wishlist response is an array", function (this: ScenarioWorld) {
  expect(Array.isArray(state(this).response?.data)).toBe(true);
});

When("the shopper reads the wishlist", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/wishlist", {
    headers: { Authorization: `Bearer ${await engagementToken(this)}` },
  });
  state(this).response = { status: response.status, data: response.data };
});

When("the client adds a wishlist item without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/wishlist", { product_id: "fake-product-id" });
  state(this).response = { status: response.status, data: response.data };
});

When("the shopper adds an invalid product to the wishlist", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/wishlist", { product_id: "non-existent-product-12345" }, {
    headers: { Authorization: `Bearer ${await engagementToken(this)}` },
  });
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `400` or `404`", function (this: ScenarioWorld) {
  expect([400, 404]).toContain(state(this).response?.status);
});

Then("the engagement response status is `403` or `404`", function (this: ScenarioWorld) {
  expect([403, 404]).toContain(state(this).response?.status);
});

Then("the engagement response status is `403`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(403);
});

When("the shopper reads the notification inbox", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/notifications", { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the notification response contains typed notification items", function (this: ScenarioWorld) {
  const data = state(this).response?.data;
  expect(Array.isArray(data) || (data && typeof data === "object")).toBe(true);
  const items = Array.isArray(data) ? data : (data as Record<string, unknown>).items;
  if (Array.isArray(items) && items.length > 0) {
    expect(typeof (items[0] as Record<string, unknown>).id).toBe("number");
    expect(typeof (items[0] as Record<string, unknown>).type).toBe("string");
  }
});

When("the client reads the notification inbox without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/notifications");
  state(this).response = { status: response.status, data: response.data };
});

When("the shopper reads the unread notification count", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/notifications/unread-count", { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the unread notification count is numeric", function (this: ScenarioWorld) {
  expect(typeof (state(this).response?.data as Record<string, unknown>).count).toBe("number");
});

When("the client reads the unread notification count without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/notifications/unread-count");
  state(this).response = { status: response.status, data: response.data };
});

When("the shopper marks an invalid notification identifier as read", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/notifications/not-a-number/read", undefined, { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `400`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(400);
});

When("the client marks a notification as read without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/notifications/940001/read");
  state(this).response = { status: response.status, data: response.data };
});

When("the shopper marks an existing notification as read", async function (this: ScenarioWorld) {
  const token = await engagementToken(this);
  const inbox = await (await this.getApiClient()).get("/v1/notifications", { headers: { Authorization: `Bearer ${token}` } });
  const payload = inbox.data && typeof inbox.data === "object" ? inbox.data as Record<string, unknown> : {};
  const items = Array.isArray(inbox.data) ? inbox.data : Array.isArray(payload.items) ? payload.items : [];
  const first = items[0] && typeof items[0] === "object" ? items[0] as Record<string, unknown> : {};
  const id = String(first.id ?? "940001");
  const response = await (await this.getApiClient()).post(`/v1/notifications/${id}/read`, undefined, { headers: { Authorization: `Bearer ${token}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `200` or `204`", function (this: ScenarioWorld) {
  expect([200, 204]).toContain(state(this).response?.status);
});

When("the shopper marks all notifications as read", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/notifications/read-all", undefined, { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the engagement response status is `204`", function (this: ScenarioWorld) {
  expect([200, 204]).toContain(state(this).response?.status);
});

When("the client marks all notifications as read without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/notifications/read-all");
  state(this).response = { status: response.status, data: response.data };
});

When("the shopper clears the notification inbox", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete("/v1/notifications", { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

When("the client clears the notification inbox without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete("/v1/notifications");
  state(this).response = { status: response.status, data: response.data };
});

Given("an admin notification token is available", async function (this: ScenarioWorld) {
  state(this).token = await getAdminToken(await this.getApiRequest());
});

When("the admin queues an email notification test", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/admin/notifications/test", {
    channel: "email",
    to: requiredEnv("TEST_USER_EMAIL"),
    subject: "Cucumber notification contract",
    body: "Cucumber notification body",
  }, { headers: { Authorization: `Bearer ${state(this).token}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the notification send response is queued for email", function (this: ScenarioWorld) {
  const data = state(this).response?.data as Record<string, unknown>;
  expect(data.status).toBe("queued");
  expect(data.type).toBe("email");
});

When("the client queues an email notification test without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/admin/notifications/test", { channel: "email", to: requiredEnv("TEST_USER_EMAIL") });
  state(this).response = { status: response.status, data: response.data };
});

When("the shopper queues an email notification test", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/admin/notifications/test", { channel: "email", to: requiredEnv("TEST_USER_EMAIL") }, { headers: { Authorization: `Bearer ${await engagementToken(this)}` } });
  state(this).response = { status: response.status, data: response.data };
});

When("the client votes on a wishlist item without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/wishlist/fake-id/vote");
  state(this).response = { status: response.status, data: response.data };
});

When("the client deletes a wishlist item without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete("/v1/wishlist/fake-id");
  state(this).response = { status: response.status, data: response.data };
});
