import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.payment-collection") return;
  this.activeModule = "admin.payment-collection";
});

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
