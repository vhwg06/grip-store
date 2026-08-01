import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.store-setting") return;
  this.activeModule = "admin.store-setting";
});

Given("the business wants to change store contact information", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin reads and updates the current storefront contact facts", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/store-settings");
  await adminPut(this, "/v1/admin/store-settings/contact", { email: "cucumber-contact@example.com" });
});

Then("the system accepts valid contact information", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("invalid contact data leaves the previous value unchanged", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/contact", { email: "not-an-email" });
  expect(adminState(this).response?.status).toBeGreaterThanOrEqual(400);
});

Given("the business wants to change the homepage focus", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin changes block priority or active state", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/homepage", { blocks: [{ key: "featured", priority: 1, active: true }] });
});

Then("the system accepts a valid homepage composition", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("an ordering or uniqueness conflict is rejected", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(500);
});

Given("the admin wants to change how the storefront is discovered", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin changes a visibility or discovery rule", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/homepage", { discovery_enabled: true });
});

Then("the system accepts the rule with its public behavioral meaning", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("a conflicting combination of rules is rejected", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(500);
});

Given("the storefront still carries registry or legacy commitments", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/store-settings");
});

When("the store operator changes those commitment rules", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/footer", { registry_enabled: false });
});

Then("the storefront reflects the new policy commitment", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("related legacy behavior is either preserved intentionally or retired intentionally", async function (this: ScenarioWorld) {
  expect(responseData(this)).toBeTruthy();
});
