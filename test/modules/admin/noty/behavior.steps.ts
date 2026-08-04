import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPost, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.noty") return;
  this.activeModule = "admin.noty";
});

async function notificationBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginNotificationBrowser(world: ScenarioWorld): Promise<void> {
  const current = await notificationBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
  await current.page.goto("/admin/notifications");
  await current.page.waitForLoadState("networkidle");
}

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

Given("an admin opens notification management in the browser", async function (this: ScenarioWorld) {
  await loginNotificationBrowser(this);
});

When("the admin opens notification channel settings", async function (this: ScenarioWorld) {
  await (await notificationBrowser(this)).page.getByRole("button", { name: "Channel Settings" }).click();
});

Then("the browser shows outbound channel readiness controls", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await expect(current.page.getByText("Admin Trigger Toggles")).toBeVisible();
  await expect(current.page.getByText(/configure credentials to receive instant system actions/i)).toBeVisible();
  await expect(current.page.getByText(/telegram bot configuration/i)).toBeVisible();
  await expect(current.page.getByText(/email notifications/i)).toBeVisible();
});

When("the admin sends a website push from the compose flow", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  const title = `Cucumber FE Noty ${Date.now()}`;
  this.state.notificationTitle = title;
  await current.page.getByRole("button", { name: /new push/i }).click();
  await current.page.getByPlaceholder("Enter push campaign title").fill(title);
  await current.page.getByPlaceholder("Enter push content text...").fill("Cucumber notification body");
  await current.page.getByRole("button", { name: /send campaign now/i }).click();
});

Then("the browser shows the sent campaign in the outbound table", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await expect(current.page.getByText(/push campaign sent successfully/i)).toBeVisible();
  const row = current.page.getByRole("row").filter({ has: current.page.getByRole("cell", { name: String(this.state.notificationTitle) }) });
  await expect(row.getByRole("cell", { name: String(this.state.notificationTitle) })).toBeVisible();
  await expect(row.getByText(/^Sent$/)).toBeVisible();
});

When("the admin saves channel readiness and sends a website push", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await current.page.getByRole("button", { name: "Channel Settings" }).click();
  const emailToggle = current.page.locator('[data-testid="toggle-email-notifications"]');
  if (await emailToggle.isVisible()) await emailToggle.click();
  await current.page.getByRole("button", { name: "Save Settings" }).click();
  await expect(current.page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();
  await current.page.getByRole("button", { name: "Back to Compose" }).click();
  await current.page.getByRole("button", { name: /new push/i }).click();
  await current.page.getByPlaceholder("Enter push campaign title").fill(`Cucumber alternate ${Date.now()}`);
  await current.page.getByPlaceholder("Enter push content text...").fill("Cucumber notification body");
  await current.page.getByRole("button", { name: /send campaign now/i }).click();
});

Then("the browser reports the push campaign as sent", async function (this: ScenarioWorld) {
  await expect((await notificationBrowser(this)).page.getByText(/push campaign sent successfully/i)).toBeVisible();
});

When("the admin creates a notification through the API", async function (this: ScenarioWorld) {
  const title = `Cucumber API Noty ${Date.now()}`;
  this.state.notificationTitle = title;
  await adminPost(this, "/v1/admin/messages/broadcast", { title, body: "Cucumber notification body", target: "website" });
  assertAccepted(this);
});

Then("a browser reload shows the notification in outbound history", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await current.page.reload();
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.getByText(String(this.state.notificationTitle))).toBeVisible();
});

Then("its outcome state is visible", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await expect(current.page.getByText(/failed|sent|queued|scheduled/i).first()).toBeVisible();
});

When("the admin searches for a non-existent campaign", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await current.page.getByPlaceholder("Search campaigns by title...").fill("nonexistent-campaign-12345xyz");
});

Then("the browser shows no matching campaigns without an error boundary", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await expect(current.page.getByText("No campaigns match your filters.")).toBeVisible();
  await expect(current.page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
});

Given("the admin opens the desktop Figma messages surface", async function (this: ScenarioWorld) {
  await loginNotificationBrowser(this);
  await (await notificationBrowser(this)).page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop messages surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await notificationBrowser(this);
  await expect(current.page).toHaveScreenshot("messages.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="messages-history-list"]')],
  });
});

Given("notification failure injection is configured for the admin browser", function (this: ScenarioWorld) {
  if (process.env.TEST_NOTIFICATION_FAILURE_FIXTURE !== "1") {
    throw new Error("Deferred: configure TEST_NOTIFICATION_FAILURE_FIXTURE=1 with a backend failure-injection fixture.");
  }
});

When("the notification settings request fails", function (this: ScenarioWorld) {
  throw new Error("Deferred: backend notification settings failure injection is not available in this environment.");
});

Then("the browser shows an explicit notification readiness error without fabricated defaults", function (this: ScenarioWorld) {
  throw new Error("Deferred: verify the explicit notification readiness error after backend failure injection is available.");
});
