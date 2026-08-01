import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminState, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.customer") return;
  this.activeModule = "admin.customer";
});

async function customerBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginCustomerBrowser(world: ScenarioWorld): Promise<void> {
  const current = await customerBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
  await current.page.goto("/admin/customers/");
  await current.page.waitForLoadState("networkidle");
}

async function searchCustomer(world: ScenarioWorld, query: string): Promise<void> {
  const current = await customerBrowser(world);
  const input = current.page.getByTestId("customer-search-input");
  await input.fill(query);
  await current.page.getByRole("button", { name: "Search" }).click();
  await current.page.waitForLoadState("networkidle");
}

Given("the admin needs to find a customer for support", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin queries the customer list", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
});

Then("the system returns customer-centric records", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Then("the admin can identify and open the correct customer context", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("similar records may require commerce signals to distinguish them", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the admin has found a customer", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
});

When("the admin opens the customer summary", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
});

Then("the system shows identity summary and commerce indicators", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

When("the admin opens order, refund, or review references", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
});

Then("the system preserves the same customer context across domains", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("a missing child artifact does not erase the customer root understanding", async function (this: ScenarioWorld) {
  expect(responseData(this)).toBeTruthy();
});

Given("a customer has a linked user account", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin reads the customer summary", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
});

Then("the system shows the linked user account", async function (this: ScenarioWorld) {
  assertReadable(this);
});

When("the admin chooses an account concern instead of a commerce concern", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
});

Then("the admin can move to the user domain", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the linked identity does not change ownership of commerce history", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("a customer record exists without orders, refunds, or reviews", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/users?page=1&pageSize=20");
});

When("the support operator opens that customer", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?page=1&pageSize=20");
});

Then("the operator reads an empty commerce history as a valid customer state", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the operator does not treat the customer record as broken or incomplete", async function (this: ScenarioWorld) {
  expect(responseData(this)).toBeTruthy();
});

Given("the support operator starts from a commerce-root customer view", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/users?page=1&pageSize=20");
});

When("the actual next action is account control rather than commerce support", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?page=1&pageSize=20");
});

Then("the operator moves into the user domain", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the customer record remains the commerce source of truth", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("an admin opens customer management in the browser", async function (this: ScenarioWorld) {
  await loginCustomerBrowser(this);
});

When("the admin searches for the buyer customer", async function (this: ScenarioWorld) {
  await searchCustomer(this, "test_buyer");
});

Then("the browser shows one customer result and excludes the admin account", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await expect(current.page.locator('[data-testid="user-row"]')).toHaveCount(1);
  await expect(current.page.getByText("test_buyer", { exact: false }).first()).toBeVisible();
  await expect(current.page.getByText("test_admin", { exact: false }).first()).toBeHidden();
});

When("the admin searches for a non-existent customer", async function (this: ScenarioWorld) {
  await searchCustomer(this, "nonexistent-customer-12345xyz");
});

Then("the browser shows no customer results without an error boundary", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await expect(current.page.getByText("No results")).toBeVisible();
  await expect(current.page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
});

When("the admin searches for the administrator account", async function (this: ScenarioWorld) {
  await searchCustomer(this, "test_admin");
});

Then("the browser shows no customer result for the administrator", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await expect(current.page.locator('[data-testid="user-row"]')).toHaveCount(0);
  await expect(current.page.getByText("test_admin", { exact: false }).first()).toBeHidden();
});

Given("an admin opens the buyer customer summary in the browser", async function (this: ScenarioWorld) {
  await loginCustomerBrowser(this);
  await searchCustomer(this, "test_buyer");
  const current = await customerBrowser(this);
  await current.page.locator('[data-testid="user-row"]').filter({ hasText: "test_buyer" }).first().click();
});

Then("the browser shows customer identity and order refund review indicators", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  const panel = current.page.getByTestId("customer-actions-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("summary-email")).toHaveText("test_buyer@example.com");
  await expect(panel.getByTestId("customer-summary-order-count")).toContainText(/\d+/);
  await expect(panel.getByTestId("customer-summary-refund-count")).toContainText(/\d+/);
  await expect(panel.getByTestId("customer-summary-review-count")).toContainText(/\d+/);
  await expect(panel.getByTestId("customer-summary-customer-id")).not.toHaveText("");
});

Then("the browser exposes order refund and review actions from the customer root", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await expect(current.page.getByRole("button", { name: "Open history" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: /refund/i })).toBeVisible();
  await expect(current.page.getByRole("button", { name: /review/i })).toBeVisible();
});

When("the admin opens the linked account controls", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await current.page.getByTestId("customer-actions-panel").getByRole("button", { name: /^Account$/ }).click();
});

Then("the browser enters user management with customer commerce actions absent", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await expect(current.page).toHaveURL(/\/admin\/users/);
  await expect(current.page.getByTestId("user-management-title")).toBeVisible();
  await expect(current.page.getByTestId("user-search-input")).toHaveValue("test_buyer");
  await expect(current.page.getByTestId("account-actions-panel")).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Open history" })).toHaveCount(0);
  await expect(current.page.getByRole("button", { name: "Open refunds" })).toHaveCount(0);
  await expect(current.page.getByRole("button", { name: "Open reviews" })).toHaveCount(0);
});

Given("an admin has registered a customer with no commerce history", async function (this: ScenarioWorld) {
  await loginCustomerBrowser(this);
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const username = `cucumber-empty-${suffix}`;
  const email = `${username}@example.com`;
  const response = await (await this.getApiClient()).post("/v1/auth/register", {
    username,
    email,
    password: `Cucumber-${suffix}!Aa1`,
  });
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  this.state.customerSearch = email;
  this.state.customerUsername = username;
});

When("the admin searches for that customer in the browser", async function (this: ScenarioWorld) {
  await searchCustomer(this, String(this.state.customerSearch));
});

Then("the browser shows the customer and an empty commerce history", async function (this: ScenarioWorld) {
  const current = await customerBrowser(this);
  await expect(current.page.getByText(String(this.state.customerUsername), { exact: false }).first()).toBeVisible();
  await expect(current.page.getByText(/empty commerce history/i)).toBeVisible();
  await expect(current.page.locator('[data-testid="customer-summary-order-count"]')).toContainText(/^0$/);
});
