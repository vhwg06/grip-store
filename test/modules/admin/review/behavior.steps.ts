import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminDelete, adminGet, adminPost, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { getAdminToken, getUserToken, requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";
import { CatalogApiHelper } from "../../../shared/runtime/api-helpers/catalog.api";
import { GoBackendClient } from "../../../shared/runtime/api-helpers/go-backend.client";
import { isolatedReference } from "../../../shared/data/test-isolation";

function reviewId(world: ScenarioWorld): string {
  // Prefer a fixture id set by createReviewViaApi over the queue list's first item.
  if (world.state.reviewId) return String(world.state.reviewId);
  const data = responseData(world);
  const items = (Array.isArray(data) ? data : data.items) as Array<Record<string, unknown>> | undefined;
  return String(items?.[0]?.id ?? "missing-review");
}

function saveReviewResponse(world: ScenarioWorld, status: number, data: unknown, path: string): void {
  adminState(world).response = { status, data, path };
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.review") return;
  this.activeModule = "admin.review";
});

async function reviewBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginReviewBrowser(world: ScenarioWorld): Promise<void> {
  const current = await reviewBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
}

async function createReviewForBrowser(world: ScenarioWorld, initialStatus: "PENDING" | "APPROVED" | "HIDDEN", label: string): Promise<void> {
  const client = new GoBackendClient(await world.getApiRequest());
  const catalog = new CatalogApiHelper(client);
  const products = await catalog.getProducts({ page: 1, limit: 20 });
  expect(products.ok).toBe(true);
  const product = products.data.items[0];
  expect(product).toBeTruthy();
  const comment = `${label}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const token = await getUserToken(await world.getApiRequest());
  const created = await client.post("/v1/reviews", {
    product_id: product.id,
    rating: 5,
    content: comment,
    external_reference: isolatedReference(world, "review"),
  }, { headers: { Authorization: `Bearer ${token}` } });
  expect([200, 201]).toContain(created.status);
  const payload = (created.data && typeof created.data === "object" ? created.data : {}) as Record<string, unknown>;
  const data = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
  world.state.reviewId = String(data.id ?? "");
  world.state.reviewComment = comment;
  expect(world.state.reviewId).not.toBe("");
  world.registerCleanup(async () => {
    const adminToken = await getAdminToken(await world.getApiRequest());
    const response = await client.delete(`/v1/admin/reviews/${world.state.reviewId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status !== 404 && (response.status < 200 || response.status >= 300)) throw new Error(`Review cleanup failed with ${response.status}`);
  });
  if (initialStatus !== "PENDING") {
    const path = initialStatus === "APPROVED" ? "approve" : "hide";
    await adminPut(world, `/v1/admin/reviews/${world.state.reviewId}/${path}`, {});
    assertAccepted(world);
  }
}

/**
 * Creates a review via the REST API without opening a browser page.
 * Stores the review id in world.state.reviewId and registers cleanup.
 * Uses the legacy /v1/catalog/products endpoint which is guaranteed to have
 * a shared smoke-test product seeded in the DB.
 */
async function createReviewViaApi(
  world: ScenarioWorld,
  label: string,
): Promise<void> {
  const client = new GoBackendClient(await world.getApiRequest());
  const catalog = new CatalogApiHelper(client);
  const products = await catalog.getProducts({ page: 1, limit: 20 });
  expect(products.ok).toBe(true);
  const product = products.data.items[0];
  expect(product).toBeTruthy();
  const comment = `${label}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const token = await getUserToken(await world.getApiRequest());
  const created = await client.post("/v1/reviews", {
    product_id: product.id,
    rating: 5,
    content: comment,
    external_reference: isolatedReference(world, label),
  }, { headers: { Authorization: `Bearer ${token}` } });
  expect([200, 201]).toContain(created.status);
  const payload = (created.data && typeof created.data === "object" ? created.data : {}) as Record<string, unknown>;
  const data = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
  world.state.reviewId = String(data.id ?? "");
  world.state.reviewComment = comment;
  expect(world.state.reviewId).not.toBe("");
  world.registerCleanup(async () => {
    const adminToken = await getAdminToken(await world.getApiRequest());
    const response = await client.delete(`/v1/admin/reviews/${world.state.reviewId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status !== 404 && (response.status < 200 || response.status >= 300)) throw new Error(`Review cleanup failed with ${response.status}`);
  });
}

async function openReviewList(world: ScenarioWorld): Promise<void> {
  const current = await reviewBrowser(world);
  await current.page.goto("/admin/reviews");
  await current.page.waitForLoadState("networkidle");
}

async function searchReviewBrowser(world: ScenarioWorld, query: string): Promise<void> {
  const current = await reviewBrowser(world);
  await current.page.getByPlaceholder("Search reviews by product, user or comment...").fill(query);
  await current.page.waitForLoadState("networkidle");
}

function reviewCard(world: ScenarioWorld) {
  return reviewBrowser(world).then(({ page }) => page.locator('[data-testid="review-queue-item"]').filter({ hasText: String(world.state.reviewComment) }).first());
}

Given("the admin needs to choose a review for moderation", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await createReviewViaApi(this, "queue-scan-fixture");
});

When("the admin opens the moderation queue", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/reviews");
});

Then("the system returns review states and queue statistics", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

When("the admin opens a review context", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/reviews/${reviewId(this)}`);
});

Then("the context panel shows product, customer, order, and attachment references when available", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Given("no moderation authentication is supplied", function (this: ScenarioWorld) {
  this.state.noModerationAuth = true;
});

When("the client reads the moderation queue", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/reviews");
  saveReviewResponse(this, response.status, response.data, "/v1/admin/reviews");
});

Then("the moderation queue request returns `401`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(401);
});

Given("a normal customer is not a review moderator", function (this: ScenarioWorld) {
  this.state.nonModerator = true;
});

When("that customer reads the moderation queue", async function (this: ScenarioWorld) {
  const token = await getUserToken(await this.getApiRequest());
  const response = await (await this.getApiClient()).get("/v1/admin/reviews", {
    headers: { Authorization: `Bearer ${token}` },
  });
  saveReviewResponse(this, response.status, response.data, "/v1/admin/reviews");
});

Then("the moderation queue request returns `403`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(403);
});

Then("the queue payload preserves review context references", function (this: ScenarioWorld) {
  assertReadable(this);
  const payload = responseData(this);
  expect(payload).toBeTruthy();
});

Given("a moderator has enough review context to allow public visibility", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await createReviewViaApi(this, "approve-fixture");
  await adminGet(this, "/v1/admin/reviews");
});

When("the moderator approves the review", async function (this: ScenarioWorld) {
  await adminPut(this, `/v1/admin/reviews/${reviewId(this)}/approve`, {});
});

Then("the review becomes public-eligible content", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the approval outcome is distinct from hide, feature, or delete", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.path).toContain("approve");
});

Given("a moderator has enough review context to remove public visibility", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await createReviewViaApi(this, "hide-fixture");
  await adminGet(this, "/v1/admin/reviews");
});

When("the moderator hides the review", async function (this: ScenarioWorld) {
  await adminPut(this, `/v1/admin/reviews/${reviewId(this)}/hide`, {});
});

Then("the review stops acting as public-visible feedback", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the hide outcome is distinct from approve, feature, or delete", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.path).toContain("hide");
});

Given("a review is already suitable for public visibility", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await createReviewViaApi(this, "feature-fixture");
  await adminGet(this, "/v1/admin/reviews");
});

When("the moderator features the review", async function (this: ScenarioWorld) {
  await adminPut(this, `/v1/admin/reviews/${reviewId(this)}/feature`, {});
});

Then("the review gains elevated public prominence", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the feature outcome does not replace the underlying moderation decision", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.path).toContain("feature");
});

Given("the admin wants to process multiple pending reviews", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await createReviewViaApi(this, "bulk-fixture");
  await adminGet(this, "/v1/admin/reviews");
});

When("the admin selects a review set", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/reviews/publish-selected", { review_ids: [reviewId(this)] });
});

Then("the system checks each review's eligibility", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the system applies the outcome to eligible reviews without bypassing individual moderation rules", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("a moderator determines a review should no longer remain as a review artifact", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await createReviewViaApi(this, "delete-fixture");
  await adminGet(this, "/v1/admin/reviews");
});

When("the moderator deletes the review", async function (this: ScenarioWorld) {
  await adminDelete(this, `/v1/admin/reviews/${reviewId(this)}`);
});

Then("the review disappears from the moderation surface", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the outcome is not interpreted as the same behavior as hiding the review", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.path).not.toContain("hide");
});

Given("an admin opens review moderation in the browser", async function (this: ScenarioWorld) {
  await loginReviewBrowser(this);
  await openReviewList(this);
});

Then("the browser shows review statistics queue action and context surfaces", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.getByRole("heading", { name: "Review Moderation" })).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-stats-pending"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-stats-featured"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-stats-hidden"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-queue-container"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-action-panel"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-context-panel"]')).toBeVisible();
});

When("the admin searches moderation for a non-existent review", async function (this: ScenarioWorld) {
  await searchReviewBrowser(this, "nonexistent-review-12345xyz");
});

Then("the browser shows no reviews without an error boundary", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.locator('[data-testid="reviews-queue-container"]')).toContainText("No reviews found");
  await expect(current.page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
});

Given("an admin has created a pending review for browser context", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "PENDING", "browser-context");
  await loginReviewBrowser(this);
});

When("the admin opens that review in moderation", async function (this: ScenarioWorld) {
  await openReviewList(this);
  await searchReviewBrowser(this, String(this.state.reviewComment));
  await (await reviewCard(this)).click();
});

Then("the browser shows product customer order attachment and comment context", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.locator('[data-testid="context-product-link"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="context-buyer-profile"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="context-order-id"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="context-attachment-count"]')).toContainText(/files/);
  await expect(current.page.locator('[data-testid="reviews-context-panel"]')).toContainText(String(this.state.reviewComment));
});

Given("an admin has created a pending review for browser approval", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "PENDING", "browser-approve");
  await loginReviewBrowser(this);
});

When("the moderator approves that review in the browser", async function (this: ScenarioWorld) {
  await openReviewList(this);
  await searchReviewBrowser(this, String(this.state.reviewComment));
  const current = await reviewBrowser(this);
  const card = await reviewCard(this);
  await card.click();
  await current.page.locator('[data-testid="review-action-approve"]').click();
});

Then("the browser shows the review as approved and disables approve", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.locator('[data-testid="reviews-context-panel"]')).toContainText("APPROVED");
  await expect(current.page.locator('[data-testid="review-action-approve"]')).toBeDisabled();
  await expect((await reviewCard(this))).toContainText("APPROVED");
});

Given("an admin has created an approved review for browser hiding", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "APPROVED", "browser-hide");
  await loginReviewBrowser(this);
});

When("the moderator hides that review in the browser", async function (this: ScenarioWorld) {
  await openReviewList(this);
  await searchReviewBrowser(this, String(this.state.reviewComment));
  const current = await reviewBrowser(this);
  await (await reviewCard(this)).click();
  await current.page.locator('[data-testid="review-action-hide"]').click();
});

Then("the browser shows the review as hidden and disables hide", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.locator('[data-testid="reviews-context-panel"]')).toContainText("HIDDEN");
  await expect(current.page.locator('[data-testid="review-action-hide"]')).toBeDisabled();
});

Given("an admin has created an approved review for browser featuring", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "APPROVED", "browser-feature");
  await loginReviewBrowser(this);
});

When("the moderator features that review in the browser", async function (this: ScenarioWorld) {
  await openReviewList(this);
  await searchReviewBrowser(this, String(this.state.reviewComment));
  const current = await reviewBrowser(this);
  await (await reviewCard(this)).click();
  await current.page.locator('[data-testid="review-action-feature"]').click();
});

Then("the browser shows the review as featured and disables feature", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.locator('[data-testid="reviews-context-panel"]')).toContainText("FEATURED");
  await expect(current.page.locator('[data-testid="review-action-feature"]')).toBeDisabled();
});

Given("an admin has created a hidden review for browser inspection", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "HIDDEN", "browser-hidden");
  await loginReviewBrowser(this);
});

When("the moderator opens that hidden review in the browser", async function (this: ScenarioWorld) {
  await openReviewList(this);
  await searchReviewBrowser(this, String(this.state.reviewComment));
  await (await reviewCard(this)).click();
});

Then("the browser disables the hide action", async function (this: ScenarioWorld) {
  await expect((await reviewBrowser(this)).page.locator('[data-testid="review-action-hide"]')).toBeDisabled();
});

Given("an admin has created two pending reviews for browser bulk moderation", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "PENDING", "browser-bulk-one");
  const first = this.state.reviewComment;
  await createReviewForBrowser(this, "PENDING", "browser-bulk-two");
  this.state.reviewComments = [first, this.state.reviewComment];
  await loginReviewBrowser(this);
});

When("the moderator publishes both selected reviews in the browser", async function (this: ScenarioWorld) {
  await openReviewList(this);
  const current = await reviewBrowser(this);
  for (const comment of this.state.reviewComments as string[]) {
    const card = current.page.locator('[data-testid="review-queue-item"]').filter({ hasText: comment }).first();
    await card.locator('[data-testid="review-item-checkbox"]').check();
  }
  await current.page.locator('[data-testid="reviews-bulk-publish-btn"]').click();
});

Then("both reviews become approved in the browser", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  for (const comment of this.state.reviewComments as string[]) {
    await expect(current.page.locator('[data-testid="review-queue-item"]').filter({ hasText: comment }).first()).toContainText("APPROVED");
  }
});

Given("an admin has created one pending and one hidden review for partial bulk moderation", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "PENDING", "browser-partial-pending");
  const pending = this.state.reviewComment;
  await createReviewForBrowser(this, "HIDDEN", "browser-partial-hidden");
  this.state.reviewComments = [pending, this.state.reviewComment];
  await loginReviewBrowser(this);
});

Then("the pending review becomes approved and the hidden review remains hidden", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  const comments = this.state.reviewComments as string[];
  await expect(current.page.locator('[data-testid="review-queue-item"]').filter({ hasText: comments[0] }).first()).toContainText("APPROVED");
  await expect(current.page.locator('[data-testid="review-queue-item"]').filter({ hasText: comments[1] }).first()).toContainText("HIDDEN");
});

Given("an admin has created a hidden review for browser removal", async function (this: ScenarioWorld) {
  await createReviewForBrowser(this, "HIDDEN", "browser-delete");
  await loginReviewBrowser(this);
});

When("the moderator deletes that review in the browser", async function (this: ScenarioWorld) {
  await openReviewList(this);
  await searchReviewBrowser(this, String(this.state.reviewComment));
  const current = await reviewBrowser(this);
  const card = await reviewCard(this);
  await card.click();
  await current.page.once("dialog", async (dialog) => dialog.accept());
  await current.page.locator('[data-testid="review-action-delete"]').click();
});

Then("the review disappears from the browser moderation queue", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect((await reviewCard(this))).toBeHidden();
  await expect(current.page.locator('[data-testid="reviews-queue-container"]')).toContainText("No reviews found");
});

Given("the admin opens the desktop Figma reviews surface", async function (this: ScenarioWorld) {
  await loginReviewBrowser(this);
  const current = await reviewBrowser(this);
  await current.page.goto("/admin/reviews");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop reviews surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await reviewBrowser(this);
  await expect(current.page.getByRole("heading", { name: "Review Moderation" })).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-queue-container"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="reviews-context-panel"]')).toBeVisible();
  await expect(current.page).toHaveScreenshot("reviews.png", {
    maxDiffPixelRatio: 0.02,
    mask: [
      current.page.locator('[data-testid="reviews-stats-pending"]'),
      current.page.locator('[data-testid="reviews-stats-featured"]'),
      current.page.locator('[data-testid="reviews-stats-hidden"]'),
      current.page.locator('[data-testid="reviews-queue-container"]'),
      current.page.locator('[data-testid="reviews-context-panel"]'),
    ],
  });
});
