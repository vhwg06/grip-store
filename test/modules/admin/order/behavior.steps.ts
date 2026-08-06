import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import {
  adminGet,
  adminDelete,
  adminPatch,
  adminState,
  assertAccepted,
  assertReadable,
  assertRejected,
  authenticateAdmin,
  responseData,
} from "../../../shared/cucumber/admin-runtime";
import { getUserToken, requiredEnv, testApiBaseUrl } from "../../../shared/runtime/api-helpers/auth.helpers";
import { CatalogApiHelper } from "../../../shared/runtime/api-helpers/catalog.api";
import { GoBackendClient } from "../../../shared/runtime/api-helpers/go-backend.client";
import { isolatedReference } from "../../../shared/data/test-isolation";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";

type JsonRecord = Record<string, unknown>;

type OrderScenarioState = {
  selectedOrderId?: string;
  selectedCustomerId?: string;
  selectedCustomerQuery?: string;
  initialStatus?: string;
  orderId?: string;
  orderStatus?: string;
  detailBefore?: JsonRecord;
  detailAfter?: JsonRecord;
  queueRows?: JsonRecord[];
  historyRows?: JsonRecord[];
  refundSignal?: unknown;
  pendingRefundRows?: JsonRecord[];
  orderContext?: JsonRecord;
};

function state(world: ScenarioWorld): OrderScenarioState {
  const current = world.state.order as OrderScenarioState | undefined;
  if (current) return current;
  const created: OrderScenarioState = {};
  world.state.order = created;
  return created;
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function field(source: JsonRecord, ...names: string[]): unknown {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(source, name)) return source[name];
  }
  return undefined;
}

function nestedCustomerId(source: JsonRecord): unknown {
  const customer = record(field(source, "customer"));
  return field(source, "customerId", "customer_id") ?? field(customer, "id", "customerId", "customer_id");
}

function orderId(source: JsonRecord): string | undefined {
  const value = field(source, "id", "orderId", "order_id", "orderNumber", "order_number");
  return value === undefined || value === null ? undefined : String(value);
}

function status(source: JsonRecord): string | undefined {
  const value = field(source, "status", "orderStatus", "order_status");
  return value === undefined || value === null ? undefined : String(value).toUpperCase();
}

function rowsFrom(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is JsonRecord => Boolean(item && typeof item === "object"));
  const source = record(value);
  for (const key of ["items", "orders", "results", "rows", "data"]) {
    const nested = source[key];
    if (Array.isArray(nested)) return rowsFrom(nested);
  }
  return [];
}

function timelineFrom(source: JsonRecord): JsonRecord[] {
  return rowsFrom(field(source, "timeline", "orderTimeline", "order_timeline"));
}

function actionValues(source: JsonRecord): unknown[] | undefined {
  const value = field(source, "allowedActions", "allowed_actions", "availableActions", "available_actions", "actions");
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([name]) => name);
  return [value];
}

function saveRawResponse(world: ScenarioWorld, statusCode: number, data: unknown, path: string): void {
  adminState(world).response = { status: statusCode, data, path };
}

async function client(world: ScenarioWorld): Promise<GoBackendClient> {
  return new GoBackendClient(await world.getApiRequest());
}

async function browser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginBrowser(world: ScenarioWorld): Promise<void> {
  const current = await browser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
}

async function createPendingOrder(world: ScenarioWorld): Promise<void> {
  await authenticateAdmin(world);
  const api = new CatalogApiHelper(await client(world));
  const products = await api.getProducts({ page: 1, limit: 20 });
  expect(products.ok, "creating an order requires a reachable public catalog").toBe(true);
  const product = products.data.items.find((candidate) => (candidate.stock ?? 0) > 0 && candidate.active !== false);
  expect(product, "creating an order requires an available product").toBeTruthy();

  const userToken = await getUserToken(await world.getApiRequest());
  const response = await (await client(world)).post("/v1/checkout/orders", {
    product_id: product.id,
    quantity: 1,
    email: requiredEnv("TEST_USER_EMAIL"),
    external_reference: isolatedReference(world, "order"),
  }, { headers: { Authorization: `Bearer ${userToken}` } });
  expect(response.status, "order creation must be accepted").toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  const created = record(response.data);
  const id = orderId(created);
  expect(id, "created order must expose an id").toBeTruthy();
  expect(status(created)).toBe("PENDING");
  state(world).orderId = id;
  state(world).orderStatus = "PENDING";
}

function assertOrderRow(row: JsonRecord): void {
  expect(orderId(row), "queue row must expose order identity").toBeTruthy();
  expect(status(row), "queue row must expose server status").toBeTruthy();
  expect(field(row, "amount", "totalAmount", "total_amount", "total"), "queue row must expose total").not.toBeUndefined();
  expect(field(row, "customerId", "customer_id", "customerEmail", "customer_email", "customer"), "queue row must expose customer context").not.toBeUndefined();
  expect(actionValues(row), "queue row must expose server action signals").not.toBeUndefined();
}

function assertOrderDetail(source: JsonRecord): void {
  expect(orderId(source), "order detail must expose order identity").toBeTruthy();
  expect(status(source), "order detail must expose server status").toBeTruthy();
  expect(Array.isArray(field(source, "items")), "order detail must expose items").toBe(true);
  expect(Array.isArray(field(source, "timeline", "orderTimeline", "order_timeline")), "order detail must expose timeline").toBe(true);
  expect(field(source, "paymentMethod", "payment_method", "payment"), "order detail must expose payment context").not.toBeUndefined();
  expect(field(source, "customerId", "customer_id", "customerEmail", "customer_email", "customer"), "order detail must expose customer context").not.toBeUndefined();
  expect(field(source, "note", "notes"), "order detail must expose note context").not.toBeUndefined();
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.order") return;
  this.activeModule = "admin.order";
});

Given("an operations admin is authenticated for order operations", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

Given("the order queue contains orders with server states and action signals", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders?page=1&pageSize=20");
  assertReadable(this);
  const rows = rowsFrom(responseData(this));
  expect(rows.length, "the queue precondition requires at least one order").toBeGreaterThan(0);
  state(this).queueRows = rows;
});

When("the admin reads page 1 of the order queue", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders?page=1&pageSize=20");
});

Then("each queue row exposes its order identity, status, customer, total, and allowed actions", async function (this: ScenarioWorld) {
  assertReadable(this);
  const rows = rowsFrom(responseData(this));
  expect(rows.length).toBeGreaterThan(0);
  rows.forEach(assertOrderRow);
  state(this).queueRows = rows;
  state(this).selectedOrderId = orderId(rows[0]);
  state(this).initialStatus = status(rows[0]);
});

When("the admin filters the order queue by a non-existent order identifier", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders?q=nonexistent-order-12345xyz&page=1&pageSize=20");
});

Then("the queue returns an empty result without an error boundary", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(rowsFrom(responseData(this))).toHaveLength(0);
});

Given("the existing order `test-order-0001` has a known server status", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0001");
  assertReadable(this);
  state(this).selectedOrderId = "test-order-0001";
  state(this).initialStatus = status(responseData(this));
  expect(state(this).initialStatus).toBeTruthy();
});

When("the admin filters the order queue for `test-order-0001`", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders?q=test-order-0001&page=1&pageSize=20");
});

Then("the matching queue row preserves that server status", async function (this: ScenarioWorld) {
  assertReadable(this);
  const rows = rowsFrom(responseData(this));
  expect(rows.length).toBeGreaterThan(0);
  const matching = rows.find((row) => orderId(row) === "test-order-0001") ?? rows[0];
  expect(status(matching)).toBe(state(this).initialStatus);
});

Then("the filter request does not mutate the order", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0001");
  assertReadable(this);
  expect(status(responseData(this))).toBe(state(this).initialStatus);
});

Given("no admin authentication is supplied", function (this: ScenarioWorld) {
  state(this).selectedOrderId = undefined;
});

When("the client reads the admin order queue", async function (this: ScenarioWorld) {
  const response = await (await client(this)).get("/v1/admin/orders?page=1&pageSize=20");
  saveRawResponse(this, response.status, response.data, "/v1/admin/orders?page=1&pageSize=20");
});

Then("the order queue request returns `401`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(401);
});

Given("a normal authenticated customer is not an operations admin", async function (this: ScenarioWorld) {
  state(this).selectedCustomerId = "normal-user";
});

When("that customer reads the admin order queue", async function (this: ScenarioWorld) {
  const token = await getUserToken(await this.getApiRequest());
  const response = await (await client(this)).get("/v1/admin/orders?page=1&pageSize=20", {
    headers: { Authorization: `Bearer ${token}` },
  });
  saveRawResponse(this, response.status, response.data, "/v1/admin/orders?page=1&pageSize=20");
});

Then("the order queue request returns `403`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(403);
});

Given("an operations admin opens the existing order `test-order-0001`", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/orders/test-order-0001");
  assertReadable(this);
  state(this).selectedOrderId = "test-order-0001";
  state(this).detailBefore = structuredClone(responseData(this));
});

When("the system reads its summary, items, shipping, payment, timeline, and notes context", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0001");
});

Then("the detail contains the order facts needed for an operational decision", function (this: ScenarioWorld) {
  assertReadable(this);
  assertOrderDetail(responseData(this));
  state(this).detailAfter = structuredClone(responseData(this));
});

Then("the available actions reflect the order's current server status", function (this: ScenarioWorld) {
  const detail = responseData(this);
  const currentStatus = status(detail);
  expect(currentStatus).toBeTruthy();
  if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED" || currentStatus === "REFUNDED") {
    const actions = actionValues(detail);
    if (actions !== undefined) expect(actions).toHaveLength(0);
  }
});

Then("no order state changes before an action is submitted", function (this: ScenarioWorld) {
  expect(status(responseData(this))).toBe(status(state(this).detailBefore ?? {}));
  expect(orderId(responseData(this))).toBe(orderId(state(this).detailBefore ?? {}));
});

When("the admin opens a non-existent order detail", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/nonexistent-order-99999");
});

Then("the order detail request returns `404`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(404);
});

Given("an operations admin reads the existing order `test-order-0002` with missing optional context", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin reads the order detail", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0002");
});

Then("the order's operational facts remain readable", function (this: ScenarioWorld) {
  assertReadable(this);
  const detail = responseData(this);
  expect(orderId(detail)).toBe("test-order-0002");
  expect(status(detail)).toBe("CANCELLED");
  expect(Array.isArray(field(detail, "items"))).toBe(true);
  expect(timelineFrom(detail).length).toBeGreaterThan(0);
});

Then("the customer email remains available while phone, shipping address, and payment method are empty", function (this: ScenarioWorld) {
  const detail = responseData(this);
  expect(field(detail, "customerEmail", "customer_email")).toBeTruthy();
  expect(field(detail, "customerPhone", "customer_phone")).toBe("");
  expect(field(detail, "shippingAddress", "shipping_address")).toBe("");
  expect(field(detail, "paymentMethod", "payment_method")).toBe("");
});

Then("the admin may defer decisions that require the missing context", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeGreaterThanOrEqual(200);
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("an operations admin has created a new order in `PENDING` state", async function (this: ScenarioWorld) {
  await createPendingOrder(this);
});

When("the admin submits the allowed `PENDING` to `PAID` transition", async function (this: ScenarioWorld) {
  await adminPatch(this, `/v1/admin/orders/${state(this).orderId}`, { status: "paid" });
});

Then("the transition is accepted without a partial response", function (this: ScenarioWorld) {
  assertAccepted(this);
});

When("the admin rereads the transitioned order", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders/${state(this).orderId}`);
});

Then("the order status is `PAID`", function (this: ScenarioWorld) {
  assertReadable(this);
  expect(status(responseData(this))).toBe("PAID");
  state(this).orderStatus = "PAID";
});

Then("the timeline contains `PENDING` before `PAID`", function (this: ScenarioWorld) {
  const statuses = timelineFrom(responseData(this)).map((entry) => status(entry));
  const pendingIndex = statuses.indexOf("PENDING");
  const paidIndex = statuses.indexOf("PAID");
  expect(pendingIndex).toBeGreaterThanOrEqual(0);
  expect(paidIndex).toBeGreaterThan(pendingIndex);
});

When("the admin attempts to move it directly to `DELIVERED`", async function (this: ScenarioWorld) {
  await adminPatch(this, `/v1/admin/orders/${state(this).orderId}`, { status: "delivered" });
});

Then("the transition is rejected with a client or conflict error", function (this: ScenarioWorld) {
  assertRejected(this);
  expect([400, 409, 422]).toContain(adminState(this).response?.status);
});

Then("the order remains in `PENDING` state", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders/${state(this).orderId}`);
  assertReadable(this);
  expect(status(responseData(this))).toBe("PENDING");
});

Given("an operations admin reads the delivered order `test-order-0001`", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/orders/test-order-0001");
  assertReadable(this);
  expect(status(responseData(this))).toBe("DELIVERED");
});

When("the admin reads the allowed actions for that order", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0001");
});

Then("no ordinary order transition is available", function (this: ScenarioWorld) {
  expect(status(responseData(this))).toBe("DELIVERED");
  const actions = actionValues(responseData(this));
  if (actions !== undefined) expect(actions).toHaveLength(0);
});

When("the admin submits a malformed `REFUNDED` order transition for `test-order-0002`", async function (this: ScenarioWorld) {
  await adminPatch(this, "/v1/admin/orders/test-order-0002", { status: "refunded" });
});

Then("the order transition request returns `400`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(400);
});

When("the admin cancels and deletes that order through the admin API", async function (this: ScenarioWorld) {
  await adminPatch(this, `/v1/admin/orders/${state(this).orderId}`, { status: "cancelled" });
  assertAccepted(this);
  await adminDelete(this, `/v1/admin/orders/${state(this).orderId}`);
});

Then("the order cancellation and deletion are accepted", function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("a fresh order read returns `404`", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders/${state(this).orderId}`);
  expect(adminState(this).response?.status).toBe(404);
});

Given("an operations admin is reading an order detail with a resolved customer identity", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/orders/test-order-0001");
  assertReadable(this);
  const customer = nestedCustomerId(responseData(this));
  expect(customer).toBeTruthy();
  state(this).selectedOrderId = "test-order-0001";
  state(this).selectedCustomerId = String(customer);
  state(this).detailBefore = structuredClone(responseData(this));
});

When("the admin opens purchase history using that same customer identity", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders?q=${encodeURIComponent(state(this).selectedCustomerId ?? "")}&page=1&pageSize=20`);
  state(this).historyRows = rowsFrom(responseData(this));
});

Then("the history query resolves the same customer", function (this: ScenarioWorld) {
  assertReadable(this);
  const rows = state(this).historyRows ?? [];
  expect(rows.length).toBeGreaterThan(0);
  const matching = rows.filter((row) => {
    const customer = nestedCustomerId(row);
    return customer === undefined || String(customer) === state(this).selectedCustomerId;
  });
  expect(matching.length).toBe(rows.length);
  expect(rows.some((row) => String(nestedCustomerId(row) ?? "") === state(this).selectedCustomerId)).toBe(true);
});

Then("the response returns the customer's earlier orders without mutating the current order", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0001");
  assertReadable(this);
  expect(orderId(responseData(this))).toBe(orderId(state(this).detailBefore ?? {}));
  expect(status(responseData(this))).toBe(status(state(this).detailBefore ?? {}));
});

Given("an operations admin has identified a customer with no orders", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const username = `e2e_empty_${suffix}`;
  const response = await (await client(this)).post("/v1/auth/register", {
    username,
    email: `e2e-empty-${suffix}@example.com`,
    password: `Cucumber-${suffix}!Aa1`,
  });
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  state(this).selectedCustomerId = username;
});

When("the admin reads that customer's purchase history", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders?q=${encodeURIComponent(state(this).selectedCustomerId ?? "")}&page=1&pageSize=20`);
});

Then("the history response is successful and contains zero orders", function (this: ScenarioWorld) {
  assertReadable(this);
  expect(rowsFrom(responseData(this))).toHaveLength(0);
});

Given("an operations admin is processing an order with a pending refund request", async function (this: ScenarioWorld) {
  await createPendingOrder(this);
  await adminPatch(this, `/v1/admin/orders/${state(this).orderId}`, { status: "paid" });
  assertAccepted(this);
  await adminPatch(this, `/v1/admin/orders/${state(this).orderId}`, { status: "delivered" });
  assertAccepted(this);

  const userToken = await getUserToken(await this.getApiRequest());
  const refund = await (await client(this)).post(`/v1/orders/${state(this).orderId}/refund`, {
    reason: `Cucumber refund relevance ${Date.now()}`,
  }, { headers: { Authorization: `Bearer ${userToken}` } });
  expect(refund.status).toBe(200);

  await adminGet(this, `/v1/admin/orders/${state(this).orderId}`);
  assertReadable(this);
  state(this).orderContext = structuredClone(responseData(this));
});

When("the admin reads the order refund signal and pending refund queue", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders/${state(this).orderId}/refund-status`);
  assertReadable(this);
  state(this).refundSignal = structuredClone(responseData(this));
  await adminGet(this, "/v1/admin/refunds?status=pending");
  assertReadable(this);
  state(this).pendingRefundRows = rowsFrom(responseData(this));
});

Then("the order context exposes the refund relevance", function (this: ScenarioWorld) {
  const signal = record(state(this).refundSignal);
  expect(field(signal, "status", "refundStatus", "refund_status", "requested", "hasRefundRequest")).not.toBeUndefined();
});

Then("the admin can open refund context for the decision state", function (this: ScenarioWorld) {
  expect((state(this).pendingRefundRows ?? []).some((row) => String(field(row, "orderId", "order_id", "order")) === state(this).orderId)).toBe(true);
});

Then("the order response does not decide the refund outcome", function (this: ScenarioWorld) {
  const order = state(this).orderContext ?? {};
  expect(field(order, "refundDecision", "refund_decision", "refundOutcome", "refund_outcome")).toBeUndefined();
  const signal = record(state(this).refundSignal);
  expect(String(field(signal, "status", "refundStatus", "refund_status")).toLowerCase()).toBe("pending");
});

Given("an admin has created a pending order for browser inspection", async function (this: ScenarioWorld) {
  await createPendingOrder(this);
  await loginBrowser(this);
});

When("the admin opens the order queue in the browser", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await current.page.goto("/admin/orders");
  await current.page.waitForLoadState("networkidle");
});

Then("the pending order row shows its server state and disabled invalid action", async function (this: ScenarioWorld) {
  const current = await browser(this);
  const order = state(this).orderId;
  const row = current.page.locator('[data-testid="order-row"]').filter({ hasText: String(order) }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText(/pending/i);
  await expect(row.getByRole("button", { name: "Mark delivered" })).toBeDisabled();
});

When("the admin opens that order from the queue row", async function (this: ScenarioWorld) {
  const current = await browser(this);
  const row = current.page.locator('[data-testid="order-row"]').filter({ hasText: String(state(this).orderId) }).first();
  await row.getByRole("link", { name: "Open detail" }).click();
});

Then("the browser enters the matching order detail route", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page).toHaveURL(new RegExp(`/admin/orders/${String(state(this).orderId)}/?$`));
  await expect(current.page.locator('[data-testid="order-detail"]')).toBeVisible();
});

Given("an admin is viewing the order queue in the browser", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  const current = await browser(this);
  await current.page.goto("/admin/orders");
  await current.page.waitForLoadState("networkidle");
});

When("the admin filters the browser queue by a non-existent order identifier", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await current.page.goto("/admin/orders?q=nonexistent-order-12345xyz");
  await current.page.waitForLoadState("networkidle");
});

Then("the browser shows an empty order state without an error boundary", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page.getByText("No orders found")).toBeVisible();
  await expect(current.page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
});

When("the admin filters the browser queue for `test-order-0001`", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await current.page.goto("/admin/orders?q=test-order-0001");
  await current.page.waitForLoadState("networkidle");
});

Then("only matching order rows are visible in the browser queue", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first()).toBeVisible();
  await expect(current.page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0002" })).toHaveCount(0);
});

Given("an admin opens the delivered order detail in the browser", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  const current = await browser(this);
  await current.page.goto("/admin/orders/test-order-0001");
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="order-detail"]')).toBeVisible();
});

Then("the browser shows order identity customer payment timeline and terminal context", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page.getByText("Order Detail #test-order-0001")).toBeVisible();
  await expect(current.page.getByText("test_buyer@example.com")).toBeVisible();
  await expect(current.page.getByText("Payment Method")).toBeVisible();
  await expect(current.page.getByText("Order Timeline & Notes")).toBeVisible();
  await expect(current.page.getByText(/terminal state.*DELIVERED/i)).toBeVisible();
});

Given("an admin opens the incomplete order detail in the browser", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  const current = await browser(this);
  await current.page.goto("/admin/orders/test-order-0002");
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="order-detail"]')).toBeVisible();
});

Then("the browser keeps the order readable and shows safe missing-context fallbacks", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page.getByRole("button", { name: "Mark delivered" })).toBeDisabled();
  await expect(current.page.getByText("Awaiting fulfillment (missing tracking ID - safe fallback)")).toBeVisible();
  await expect(current.page.getByText(/missing shipping address/i)).toBeVisible();
  await expect(current.page.getByText("COD / QR Transfer")).toBeVisible();
  await expect(current.page.getByText("Thu Duc, Ho Chi Minh City")).toBeVisible();
});

Given("an admin opens a missing order detail in the browser", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  const current = await browser(this);
  await current.page.goto("/admin/orders/nonexistent-order-12345xyz");
  await current.page.waitForLoadState("networkidle");
});

Then("the browser shows the order not-found state", async function (this: ScenarioWorld) {
  await expect((await browser(this)).page.getByText("Order not found", { exact: false })).toBeVisible();
});

Given("an admin has created a pending order for browser transition", async function (this: ScenarioWorld) {
  await createPendingOrder(this);
  await loginBrowser(this);
});

When("the admin marks that order as paid from the browser queue", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await current.page.goto(`/admin/orders?q=${encodeURIComponent(String(state(this).orderId))}`);
  await current.page.waitForLoadState("networkidle");
  const row = current.page.locator('[data-testid="order-row"]').filter({ hasText: String(state(this).orderId) }).first();
  await expect(row).toBeVisible();
  await current.page.once("dialog", async (dialog) => dialog.accept());
  await row.click();
  await current.page.getByRole("button", { name: "Mark paid" }).click();
  await current.page.waitForLoadState("networkidle");
});

Then("a fresh admin read shows the order as paid with a payment timestamp", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/admin/orders/${state(this).orderId}`);
  assertReadable(this);
  const payload = responseData(this);
  expect(status(payload)).toBe("PAID");
  expect(field(payload, "paidAt", "paid_at")).toBeTruthy();
});

Then("the browser disables ordinary order transition controls", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page.getByRole("button", { name: "Mark paid" })).toBeDisabled();
  await expect(current.page.getByRole("button", { name: "Mark delivered" })).toBeDisabled();
});

Given("an admin has an order belonging to a known customer in the browser", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
  assertReadable(this);
  const rows = rowsFrom(responseData(this));
  const buyer = rows.find((row) => String(field(row, "username", "userName")) === "test_buyer") ?? rows[0];
  const customer = field(buyer, "customerId", "customer_id", "id");
  expect(customer).toBeTruthy();
  state(this).selectedCustomerId = String(customer);
  state(this).selectedCustomerQuery = "test_buyer";
});

When("the admin opens that customer's purchase history", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await current.page.goto(`/admin/customers/`);
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.getByRole("heading", { name: "Customer Management" })).toBeVisible();
  await current.page.getByPlaceholder("Search email, phone, user ID...").fill(state(this).selectedCustomerQuery ?? "test_buyer");
  await current.page.getByRole("button", { name: "Search" }).click();
  await current.page.waitForLoadState("networkidle");
  await current.page.getByText(state(this).selectedCustomerQuery ?? "test_buyer", { exact: false }).first().click();
  await current.page.getByRole("button", { name: "Open history" }).click();
});

Then("the browser opens the customer order projection for the same customer", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page).toHaveURL(new RegExp(`/admin/orders/\\?q=${String(state(this).selectedCustomerId)}`));
  await expect(current.page.locator('[data-testid="order-row"]').first()).toBeVisible();
});

Given("an admin has a newly registered customer with no orders in the browser", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await (await client(this)).post("/v1/auth/register", {
    username: `cucumber-empty-${suffix}`,
    email: `cucumber-empty-${suffix}@example.com`,
    password: `Cucumber-${suffix}!Aa1`,
  });
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  state(this).selectedCustomerId = `cucumber-empty-${suffix}`;
  state(this).selectedCustomerQuery = state(this).selectedCustomerId;
});

Then("the browser shows no orders found without crashing", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page).toHaveURL(/\/admin\/orders\/?\?q=/);
  await expect(current.page.getByText("No orders found")).toBeVisible();
});

Given("the admin opens the desktop Figma orders surface", async function (this: ScenarioWorld) {
  await loginBrowser(this);
  const current = await browser(this);
  await current.page.goto("/admin/orders");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop orders surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await browser(this);
  await expect(current.page).toHaveScreenshot("orders.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="orders-table-body"]')],
  });
});
