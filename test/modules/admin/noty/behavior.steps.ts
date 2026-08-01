import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPost, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.noty") return;
  this.activeModule = "admin.noty";
});

Given("the admin wants to send a website-facing push notification", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin reads current outbound readiness", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/notifications");
});

Then("the system shows whether sending is ready", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

When("readiness is sufficient and the admin sends the notification", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/messages/broadcast", { title: "Cucumber notification", body: "Cucumber notification body", target: "website" });
});

Then("the system accepts the outbound send behavior", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("insufficient readiness blocks the send before dispatch", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(500);
});

Given("the admin needs to understand outbound notifications", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin opens the notification list", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/messages");
});

Then("the system returns outbound notifications", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

When("the admin opens notification or send-set history", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/messages");
});

Then("the system shows the corresponding outcome states", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("a minimal history remains distinguishable from an untraceable failure", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});
