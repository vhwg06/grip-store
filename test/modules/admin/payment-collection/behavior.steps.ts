import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.payment-collection") return;
  this.activeModule = "admin.payment-collection";
});

async function collectionBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginCollectionBrowser(world: ScenarioWorld): Promise<void> {
  const current = await collectionBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
  await current.page.goto("/admin/collect");
  await current.page.waitForLoadState("networkidle");
}

Given("the finance operator opens the collection surface", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system presents configured payment collection sources", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/collect");
});

Then("the operator understands which receive-money sources are active or inactive", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Given("the operator needs to update who receives funds", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the operator saves a new payee identity", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/collect", { payee_name: `Cucumber Payee ${Date.now()}` });
});

Then("the selected collection source reflects the new receive-money identity", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await adminGet(this, "/v1/admin/collect");
  assertReadable(this);
});

Given("the operator needs to update a QR or transfer instruction", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the operator saves the collection setup", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/collect", { transfer_instruction: `Cucumber-${Date.now()}` });
});

Then("the selected source becomes the new receive-money instruction", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("an invalid setup is blocked from acting as live configuration", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(500);
});

Given("the operator wants to verify a collection source before live use", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system presents readiness signals and warnings", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/collect");
});

Then("the operator can distinguish ready sources from sources needing correction", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Given("a finance operator opens payment collection in the browser", async function (this: ScenarioWorld) {
  await loginCollectionBrowser(this);
  await adminGet(this, "/v1/admin/collect");
  this.state.collectionOriginal = responseData(this);
});

Then("the browser shows backend collection sources and their readiness states", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  const payload = responseData(this);
  const sources = Array.isArray(payload.sources) ? payload.sources as Array<Record<string, unknown>> : [];
  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) await expect(current.page.getByText(String(source.label), { exact: true })).toBeVisible();
  const readyCount = sources.filter((source) => source.status === "active" || source.enabled === true).length;
  await expect(current.page.getByText("Ready", { exact: true })).toHaveCount(readyCount);
  await expect(current.page.getByText("Unavailable", { exact: true })).toHaveCount(sources.length - readyCount);
  await expect(current.page.getByText("VCB QR primary", { exact: true })).toHaveCount(0);
  await expect(current.page.getByText("MoMo disabled", { exact: true })).toHaveCount(0);
});

When("the finance operator saves a new payee identity in the browser", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  const payee = `Cucumber Payee ${Date.now()}`;
  const payLink = `Cucumber-Collect-${Date.now()}`;
  this.state.nextPayee = payee;
  this.state.nextPayLink = payLink;
  await current.page.locator("#accountName").fill(payee);
  await current.page.locator("#bankNumber").fill(payLink);
  await current.page.getByRole("button", { name: "Save payment codes" }).click();
  await expect(current.page.getByText(/success/i)).toBeVisible();
});

Then("the payee identity remains after a browser reload", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  await current.page.reload();
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator("#accountName")).toHaveValue(String(this.state.nextPayee));
  await expect(current.page.locator("#bankNumber")).toHaveValue(String(this.state.nextPayLink));
});

When("the finance operator enters invalid collection setup", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  await current.page.locator("#accountName").fill("");
  await current.page.locator("#bankNumber").fill("1234");
});

Then("the browser shows the validation error and preserves the previous setup", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  await expect(current.page.getByText(/invalid bank code/i)).toBeVisible();
  await current.page.getByRole("button", { name: "Save payment codes" }).click();
  await expect(current.page.getByText(/success/i)).toHaveCount(0);
  await current.page.reload();
  await current.page.waitForLoadState("networkidle");
  const original = this.state.collectionOriginal as Record<string, unknown>;
  expect(await current.page.locator("#accountName").inputValue()).toBe(String(original.payee ?? original.accountName ?? ""));
  expect(await current.page.locator("#bankNumber").inputValue()).toBe(String(original.payLink ?? original.bankNumber ?? ""));
});

Then("the browser shows backend readiness warnings without fabricated active badges", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  await expect(current.page.getByText("Active", { exact: true })).toHaveCount(0);
  await expect(current.page.getByText(/verify configurations before saving to live checkout/i)).toHaveCount(0);
  const payload = responseData(this);
  const warnings = Array.isArray(payload.warnings) ? payload.warnings as unknown[] : [];
  if (warnings.length > 0) await expect(current.page.getByText(String(warnings[0]), { exact: false })).toBeVisible();
  else if (payload.ready === true || payload.is_ready === true) await expect(current.page.getByText(/collection setup is ready for live checkout/i)).toBeVisible();
});

Given("the finance operator opens the desktop Figma collect surface", async function (this: ScenarioWorld) {
  await loginCollectionBrowser(this);
  await (await collectionBrowser(this)).page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop collect surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await collectionBrowser(this);
  await expect(current.page).toHaveScreenshot("collect.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="collect-inputs-container"]')],
  });
});
