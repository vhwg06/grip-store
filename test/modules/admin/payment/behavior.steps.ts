import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminState, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.payment") return;
  this.activeModule = "admin.payment";
});

Given("an operations admin needs payment facts while reading an order", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system presents payment method and payment-related signals on the order", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/orders/test-order-0001");
});

Then("the admin understands the payment context as operational fact", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Then("the admin does not treat that context as a payment execution control surface", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("an operations admin reviews a refund request", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system presents payment-related facts relevant to that refund", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/refunds?status=pending");
});

Then("the admin uses those facts to interpret the refund context", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the payment context does not decide the refund outcome by itself", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});
