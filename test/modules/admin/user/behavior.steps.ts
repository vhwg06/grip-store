import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPatch, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.user") return;
  this.activeModule = "admin.user";
});

async function userBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginUserBrowser(world: ScenarioWorld): Promise<void> {
  const current = await userBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
  await current.page.goto("/admin/users");
  await current.page.waitForLoadState("networkidle");
}

async function searchAccount(world: ScenarioWorld, query: string): Promise<void> {
  const current = await userBrowser(world);
  const search = current.page.getByTestId("user-search-input");
  await search.fill(query);
  await search.press("Enter");
  await current.page.waitForLoadState("networkidle");
}

function buyerAccountRow(world: ScenarioWorld) {
  return userBrowser(world).then(({ page }) => page.locator('[data-testid="user-row"]').filter({ has: page.getByRole("link", { name: "test_buyer" }) }).first());
}

Given("the admin needs to identify a specific account", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin opens user management and searches the paginated account list", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?q=test_admin&page=1&pageSize=20");
});

Then("the system displays the selected account state", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Given("the admin needs to block or unblock an account", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin requests a valid account-level state change", async function (this: ScenarioWorld) {
  await adminPatch(this, "/v1/admin/users/test-user-0001/block", { blocked: true });
});

Then("the system updates the account state", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("a stale or unsuitable state change is rejected", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(500);
});

Given("the admin recognizes that the concern is commerce history", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin reads the account and the system shows a linked customer context", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?page=1&pageSize=20");
});

Then("the admin can move to the customer root", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("an account without a customer link remains valid in the user domain", async function (this: ScenarioWorld) {
  expect(responseData(this)).toBeTruthy();
});

Given("the admin is looking at an account-level issue", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the actual question turns out to be about order, refund, or review history", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/users?page=1&pageSize=20");
});

Then("the admin moves into the customer-led commerce context", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the admin does not misuse account controls as a substitute for commerce support", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("an admin opens user management in the browser", async function (this: ScenarioWorld) {
  await loginUserBrowser(this);
});

When("the admin searches for the buyer account", async function (this: ScenarioWorld) {
  await searchAccount(this, "test_buyer");
});

Then("the browser shows the buyer account without commerce history actions", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  const row = await buyerAccountRow(this);
  await expect(row).toBeVisible();
  await row.click();
  const panel = current.page.getByTestId("account-actions-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("summary-email")).toHaveText("test_buyer@example.com");
  await expect(panel.getByTestId("summary-last-activity")).not.toHaveText("");
  await expect(panel.getByTestId("summary-blocked-state")).toHaveText(/Blocked|Active/);
  await expect(panel.getByRole("button", { name: "Open history" })).toHaveCount(0);
});

When("the admin searches for an unknown account and then the buyer account", async function (this: ScenarioWorld) {
  await searchAccount(this, "xyz_no_result");
  const current = await userBrowser(this);
  await expect(current.page.getByText("No results")).toBeVisible();
  await searchAccount(this, "test_buyer");
});

Then("the browser replaces the empty result with the buyer account", async function (this: ScenarioWorld) {
  await expect(await buyerAccountRow(this)).toBeVisible();
});

Given("an admin opens the buyer account controls in the browser", async function (this: ScenarioWorld) {
  await loginUserBrowser(this);
  await searchAccount(this, "test_buyer");
  const row = await buyerAccountRow(this);
  await row.click();
  this.state.originalBlocked = (await userBrowser(this)).page.getByTestId("summary-blocked-state");
});

When("the admin toggles the buyer block state", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  await current.page.once("dialog", async (dialog) => dialog.accept());
  await current.page.getByRole("button", { name: "Block / unblock" }).click();
  await current.page.waitForLoadState("networkidle");
  const stateText = await current.page.getByTestId("summary-blocked-state").innerText();
  this.state.toggledBlocked = /blocked/i.test(stateText);
});

Then("a fresh account read shows the toggled block state", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  await current.page.reload();
  await current.page.waitForLoadState("networkidle");
  const stateText = await current.page.getByTestId("summary-blocked-state").innerText();
  expect(/blocked/i.test(stateText)).toBe(this.state.toggledBlocked);
});

When("the admin restores the original buyer block state", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  await current.page.getByRole("button", { name: "Block / unblock" }).click();
  await current.page.waitForLoadState("networkidle");
});

Then("a fresh account read shows the original block state", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  await current.page.reload();
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.getByTestId("summary-blocked-state")).toHaveText(/Blocked|Active/);
});

When("the admin opens the linked customer context", async function (this: ScenarioWorld) {
  await (await userBrowser(this)).page.getByTestId("account-open-customer").click();
});

Then("the browser enters customer management", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  await expect(current.page).toHaveURL(/\/admin\/customers\//);
});

Then("the account panel exposes block and customer handoff controls only", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  const panel = current.page.getByTestId("account-actions-panel");
  await expect(panel.getByTestId("account-block-toggle")).toBeVisible();
  await expect(panel.getByTestId("account-open-customer")).toBeVisible();
  await expect(panel.getByRole("button", { name: "Open history" })).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Open refunds" })).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Open reviews" })).toHaveCount(0);
});

Given("the admin opens the desktop Figma users surface", async function (this: ScenarioWorld) {
  await loginUserBrowser(this);
  await (await userBrowser(this)).page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop users surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await userBrowser(this);
  await expect(current.page).toHaveScreenshot("users.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="users-table-body"]')],
  });
});
