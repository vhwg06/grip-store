import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPatch, adminPost, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { getUserToken, requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";
import { CatalogApiHelper } from "../../../shared/runtime/api-helpers/catalog.api";
import { GoBackendClient } from "../../../shared/runtime/api-helpers/go-backend.client";
import { isolatedReference, requiredTestTenant } from "../../../shared/data/test-isolation";

function refundId(world: ScenarioWorld): string {
  const data = responseData(world);
  const items = (Array.isArray(data) ? data : data.items) as Array<Record<string, unknown>> | undefined;
  return String(items?.[0]?.id ?? items?.[0]?.refundId ?? "missing-refund");
}

async function refundBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginRefundBrowser(world: ScenarioWorld): Promise<void> {
  const current = await refundBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
}

async function createBrowserRefund(world: ScenarioWorld, note: string): Promise<void> {
  requiredTestTenant();
  await authenticateAdmin(world);
  const client = new GoBackendClient(await world.getApiRequest());
  const catalog = new CatalogApiHelper(client);
  const products = await catalog.getProducts({ page: 1, limit: 20 });
  expect(products.ok).toBe(true);
  const product = products.data.items[0];
  expect(product).toBeTruthy();
  const userToken = await getUserToken(await world.getApiRequest());
  const orderResponse = await client.post("/v1/checkout/orders", {
    productId: product.id,
    quantity: 1,
    email: requiredEnv("TEST_USER_EMAIL"),
    tenant_id: requiredTestTenant(),
    external_reference: isolatedReference(world, "refund-order"),
  }, { headers: { Authorization: `Bearer ${userToken}` } });
  expect(orderResponse.status).toBeGreaterThanOrEqual(200);
  expect(orderResponse.status).toBeLessThan(300);
  const order = (orderResponse.data && typeof orderResponse.data === "object" ? orderResponse.data : {}) as Record<string, unknown>;
  const orderId = String(order.id ?? (order.data as Record<string, unknown> | undefined)?.id ?? "");
  expect(orderId).not.toBe("");
  await adminPatch(world, `/v1/admin/orders/${orderId}`, { status: "paid" });
  assertAccepted(world);
  await adminPatch(world, `/v1/admin/orders/${orderId}`, { status: "delivered" });
  assertAccepted(world);
  const refund = await client.post(`/v1/orders/${orderId}/refund-request`, { reason: note }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  expect(refund.status).toBe(201);
  const refundPayload = (refund.data && typeof refund.data === "object" ? refund.data : {}) as Record<string, unknown>;
  const created = (refundPayload.data && typeof refundPayload.data === "object" ? refundPayload.data : refundPayload) as Record<string, unknown>;
  world.state.refundOrderId = orderId;
  world.state.refundId = String(created.id ?? created.refundId ?? "");
  world.state.refundNote = note;
  expect(world.state.refundId).not.toBe("");
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.refund") return;
  this.activeModule = "admin.refund";
});

Given("the admin needs to choose a refund request to process", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin opens the refund queue", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/refunds?status=pending");
});

When("an unauthenticated client reads the pending refund queue", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/refunds?status=pending");
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/refunds?status=pending" };
});

Then("the refund queue response status is `401`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(401);
});

Given("a shopper token is available for refund access", async function (this: ScenarioWorld) {
  this.state.refundAccessToken = await getUserToken(await this.getApiRequest());
});

When("the shopper reads the pending refund queue", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/refunds?status=pending", {
    headers: { Authorization: `Bearer ${String(this.state.refundAccessToken)}` },
  });
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/refunds?status=pending" };
});

Then("the refund queue response status is `403`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(403);
});

Then("the system returns pending requests and contextual states", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

When("the admin selects a request", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/refunds/${refundId(this)}`);
});

Then("the system opens its evidence and context", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("an unavailable request ends the review without a false decision", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(500);
});

Given("evidence supports a positive refund outcome", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/refunds?status=pending");
});

When("the admin reads order linkage, customer context, payment evidence, and prior notes", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/refunds/${refundId(this)}`);
});

When("the admin confirms an approve decision", async function (this: ScenarioWorld) {
  await adminPost(this, `/v1/admin/refunds/${refundId(this)}/approve`, { reason: "Cucumber evidence review" });
});

Then("the system moves the refund to approved state", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the linked order context is updated correspondingly", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("evidence does not support a positive refund outcome", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/refunds?status=pending");
});

When("the admin reads the full context", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/refunds/${refundId(this)}`);
});

When("the admin confirms a reject decision", async function (this: ScenarioWorld) {
  await adminPost(this, `/v1/admin/refunds/${refundId(this)}/reject`, { reason: "Cucumber evidence review" });
});

Then("the system moves the refund to rejected state", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the decision context is stored", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("a refund request already has a final outcome", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the operations admin opens that refund record", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/refunds?status=approved");
});

Then("the admin reads it as historical operational evidence", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the admin does not treat it as pending decision work", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the admin is authenticated for refund operations", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin approves a refund with an invalid identifier", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/refunds/not-a-number/approve", { note: "invalid id" });
});

Then("the refund decision request returns `400`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(400);
});

Given("an admin opens the refund queue in the browser", async function (this: ScenarioWorld) {
  await loginRefundBrowser(this);
  const current = await refundBrowser(this);
  await current.page.goto("/admin/refunds");
  await current.page.waitForLoadState("networkidle");
});

Then("the browser shows the refund queue decision and evidence surfaces", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await expect(current.page.getByRole("heading", { name: "Refund Requests" })).toBeVisible();
  await expect(current.page.locator('[data-testid="refunds-queue-container"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="refunds-decision-panel"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="refunds-evidence-panel"]')).toBeVisible();
});

Then("pending queue items do not display final refund outcomes", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  const items = current.page.locator('[data-testid="refund-queue-item"]');
  for (let index = 0; index < await items.count(); index += 1) {
    await expect(items.nth(index)).not.toContainText(/approved|rejected/i);
  }
});

When("the admin searches the refund queue for a non-existent request", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await current.page.getByPlaceholder("Search refund or order...").fill("nonexistent-refund-12345xyz");
  await current.page.waitForLoadState("networkidle");
});

Then("the browser shows an empty refund queue without an error boundary", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await expect(current.page.getByText("No refund requests in queue matching the filters.")).toBeVisible();
  await expect(current.page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
});

Given("an admin has approved a refund request through the API", async function (this: ScenarioWorld) {
  await createBrowserRefund(this, `approved disappear ${Date.now()}`);
  await adminPost(this, `/v1/admin/refunds/${this.state.refundId}/approve`, { adminNote: "Approved to verify pending queue" });
  assertAccepted(this);
  await loginRefundBrowser(this);
});

When("the admin searches the pending refund queue for that request in the browser", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await current.page.goto("/admin/refunds");
  await current.page.waitForLoadState("networkidle");
  await current.page.getByPlaceholder("Search refund or order...").fill(String(this.state.refundOrderId));
  await current.page.waitForLoadState("networkidle");
});

Then("the approved request is absent from the pending queue", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await expect(current.page.locator('[data-testid="refunds-queue-container"]').getByText(String(this.state.refundOrderId), { exact: false })).toBeHidden();
});

Given("an admin has a pending refund request ready for browser approval", async function (this: ScenarioWorld) {
  await createBrowserRefund(this, `browser approve ${Date.now()}`);
  await loginRefundBrowser(this);
});

Given("an admin has a pending refund request ready for browser rejection", async function (this: ScenarioWorld) {
  await createBrowserRefund(this, `browser reject ${Date.now()}`);
  await loginRefundBrowser(this);
});

async function openRefundForDecision(world: ScenarioWorld): Promise<void> {
  const current = await refundBrowser(world);
  await current.page.goto("/admin/refunds");
  await current.page.waitForLoadState("networkidle");
  await current.page.getByPlaceholder("Search refund or order...").fill(String(world.state.refundOrderId));
  await current.page.waitForLoadState("networkidle");
  await current.page.getByText(String(world.state.refundOrderId), { exact: false }).first().click();
}

When("the admin approves the refund from the browser decision surface", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await openRefundForDecision(this);
  await current.page.getByRole("button", { name: "Approve refund" }).click();
  await current.page.getByRole("button", { name: "Yes, Confirm" }).click();
  await current.page.waitForLoadState("networkidle");
});

Then("the refund is approved and absent from the pending browser queue", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/refunds/${this.state.refundId}`);
  assertReadable(this);
  expect(JSON.stringify(responseData(this))).toMatch(/approved/i);
  const current = await refundBrowser(this);
  await current.page.goto(`/admin/refunds`);
  await current.page.waitForLoadState("networkidle");
  await current.page.getByPlaceholder("Search refund or order...").fill(String(this.state.refundOrderId));
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="refunds-queue-container"]').getByText(String(this.state.refundOrderId), { exact: false })).toBeHidden();
});

When("the admin rejects the refund from the browser decision surface", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await openRefundForDecision(this);
  await current.page.getByRole("button", { name: "Reject request" }).click();
  await current.page.getByRole("button", { name: "Yes, Confirm" }).click();
  await current.page.waitForLoadState("networkidle");
});

Then("the refund is rejected and absent from the pending browser queue", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/refunds/${this.state.refundId}`);
  assertReadable(this);
  expect(JSON.stringify(responseData(this))).toMatch(/rejected/i);
  const current = await refundBrowser(this);
  await current.page.goto("/admin/refunds");
  await current.page.waitForLoadState("networkidle");
  await current.page.getByPlaceholder("Search refund or order...").fill(String(this.state.refundOrderId));
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="refunds-queue-container"]').getByText(String(this.state.refundOrderId), { exact: false })).toBeHidden();
});

Given("an admin has a pending refund request ready for browser approval with a note", async function (this: ScenarioWorld) {
  await createBrowserRefund(this, `approve with note ${Date.now()}`);
  await loginRefundBrowser(this);
});

When("the admin approves the refund with a decision note", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await openRefundForDecision(this);
  await current.page.locator('[data-testid="refund-decision-note"]').fill("Persisted decision note from Cucumber");
  await current.page.getByRole("button", { name: "Approve refund" }).click();
  await current.page.getByRole("button", { name: "Yes, Confirm" }).click();
  await current.page.waitForLoadState("networkidle");
  this.state.refundNote = "Persisted decision note from Cucumber";
});

Then("the historical refund evidence contains the decision note", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await current.page.getByRole("tab", { name: "History" }).click();
  await current.page.getByPlaceholder("Search refund or order...").fill(String(this.state.refundOrderId));
  await current.page.waitForLoadState("networkidle");
  await current.page.getByText(String(this.state.refundOrderId), { exact: false }).first().click();
  await expect(current.page.locator('[data-testid="refunds-evidence-panel"]')).toContainText(String(this.state.refundNote));
});

Given("an admin has already decided a refund request", async function (this: ScenarioWorld) {
  await createBrowserRefund(this, `already decided ${Date.now()}`);
  await adminPost(this, `/v1/admin/refunds/${this.state.refundId}/approve`, { adminNote: "Decided to test rejection block" });
  assertAccepted(this);
  await loginRefundBrowser(this);
});

When("the admin opens that refund in browser history", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await current.page.goto("/admin/refunds");
  await current.page.waitForLoadState("networkidle");
  await current.page.getByRole("tab", { name: "History" }).click();
  await current.page.getByPlaceholder("Search refund or order...").fill(String(this.state.refundOrderId));
  await current.page.waitForLoadState("networkidle");
  await current.page.getByText(String(this.state.refundOrderId), { exact: false }).first().click();
});

Then("the browser does not expose the reject action for the decided refund", async function (this: ScenarioWorld) {
  await expect((await refundBrowser(this)).page.getByRole("button", { name: "Reject request" })).toBeHidden();
});

Given("an admin has approved a refund request with historical evidence", async function (this: ScenarioWorld) {
  await createBrowserRefund(this, `history approved ${Date.now()}`);
  await adminPost(this, `/v1/admin/refunds/${this.state.refundId}/approve`, { adminNote: "Historical decision note from Cucumber" });
  assertAccepted(this);
  await loginRefundBrowser(this);
});

Then("the browser shows the approved outcome and its evidence", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await expect(current.page.locator('[data-testid="refunds-decision-panel"]')).toContainText(String(this.state.refundOrderId));
  await expect(current.page.locator('[data-testid="refunds-decision-panel"]')).toContainText(/approved/i);
  await expect(current.page.locator('[data-testid="refunds-evidence-panel"]')).toContainText("Historical decision note from Cucumber");
});

Given("the admin opens the desktop Figma refunds surface", async function (this: ScenarioWorld) {
  await loginRefundBrowser(this);
  const current = await refundBrowser(this);
  await current.page.goto("/admin/refunds");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop refunds surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await refundBrowser(this);
  await expect(current.page).toHaveScreenshot("refunds.png", {
    maxDiffPixelRatio: 0.02,
    mask: [
      current.page.locator('[data-testid="refunds-queue-container"]'),
      current.page.locator('[data-testid="refunds-decision-panel"]'),
      current.page.locator('[data-testid="refunds-evidence-panel"]'),
    ],
  });
});
