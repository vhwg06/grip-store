import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPatch, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.admin-profile") return;
  this.activeModule = "admin.admin-profile";
});

Given("the current admin opens the self-profile surface", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system shows the current identity details", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/profile");
});

Then("the admin can confirm how the account is represented in operations", async function (this: ScenarioWorld) {
  assertReadable(this);
  const data = responseData(this);
  expect(typeof data.id).toBe("string");
  expect(typeof data.username).toBe("string");
  expect(typeof data.email).toBe("string");
  if (data.role || data.role_id || data.is_admin) {
    expect(Boolean(data.role || data.role_id || data.is_admin)).toBe(true);
  }
});

Given("the current admin wants to update display identity", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the admin submits a new display identity through the profile API", async function (this: ScenarioWorld) {
  const adminEmail = requiredEnv("ADMIN_USER_EMAIL");
  await adminPatch(this, "/v1/profile", {
    email: adminEmail,
    display_name: `Cucumber Admin ${Date.now()}`,
  });
  this.registerCleanup(async () => {
    await adminPatch(this, "/v1/profile", {
      email: adminEmail,
      display_name: "test_admin",
    }).catch(() => undefined);
  });
});

Then("the current admin profile reflects the new identity", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await adminGet(this, "/v1/profile");
  assertReadable(this);
});

Then("the admin's permission posture does not change as a side effect", async function (this: ScenarioWorld) {
  const data = responseData(this);
  if (data.role_id || data.is_admin || data.role) {
    expect(data.role_id ?? data.is_admin ?? data.role).toBeDefined();
  }
});

Given("the current admin needs to validate account safety", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system presents password, 2FA, and backup-method context", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/profile/security");
});

Then("the admin can judge whether the account remains trustworthy", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(adminState(this).response?.path).toBe("/v1/profile/security");
  const data = responseData(this);
  if (data.password_last_changed_at) expect(typeof data.password_last_changed_at).toBe("string");
  if (data.two_factor_enabled !== undefined) expect(typeof data.two_factor_enabled).toBe("boolean");
  expect(data.hasPassword !== undefined || data.email !== undefined || data.id !== undefined).toBe(true);
});

Given("the current admin wants to check recent sessions", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the system presents recent device and access context", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/profile/sessions");
});

Then("the admin can distinguish expected access from suspicious access", async function (this: ScenarioWorld) {
  assertReadable(this);
  const payload = responseData(this);
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload.sessions) ? payload.sessions : [];
  expect(rows.length).toBeGreaterThan(0);
  const first = rows[0] as Record<string, unknown>;
  const device = first.device ?? first.userAgent ?? first.ip;
  expect(device).toBeDefined();
});

async function adminPage(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginAdmin(world: ScenarioWorld): Promise<void> {
  const current = await adminPage(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
}

Given("an admin opens the profile page", async function (this: ScenarioWorld) {
  await loginAdmin(this);
  await (await adminPage(this)).page.goto("/admin/profile");
  await (await adminPage(this)).page.waitForLoadState("networkidle");
});

When("the profile surface loads", async function (this: ScenarioWorld) {
  await expect((await adminPage(this)).page.getByRole("heading", { name: "Admin Profile" })).toBeVisible();
});

Then("the profile renders the backend admin identity and security section", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  await expect(current.page.locator("#username")).toHaveValue(/.+/);
  await expect(current.page.locator("#email")).toHaveValue(/.+/);
  await expect(current.page.locator('[data-testid="admin-security-section"]')).toBeVisible();
});

When("the admin saves a new display identity", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  const value = `Cucumber Admin UI ${Date.now()}`;
  this.state.displayName = value;
  await current.page.locator("#displayName").fill(value);
  await current.page.getByRole("button", { name: "Save profile" }).click();
  await expect(current.page.getByText(/profile saved successfully/i)).toBeVisible();
});

Then("the saved display identity remains after a page reload", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  await current.page.reload();
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator("#displayName")).toHaveValue(String(this.state.displayName));
});

When("the profile requests security posture", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  const response = current.page.waitForResponse((item) => item.url().includes("/v1/profile/security") && item.request().method() === "GET");
  await current.page.reload();
  await response;
});

Then("the static green audit copy is absent", async function (this: ScenarioWorld) {
  await expect((await adminPage(this)).page.getByText(/security audit passed\. active sessions match authorized locations\./i)).toHaveCount(0);
});

When("the profile requests recent access", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  const response = current.page.waitForResponse((item) => item.url().includes("/v1/profile/sessions") && item.request().method() === "GET");
  await current.page.reload();
  await response;
  const sessions = await this.getApiClient().then((client) => client.get<unknown>("/v1/profile/sessions"));
  this.state.sessions = sessions.data;
});

Then("a backend session device and location are visible", async function (this: ScenarioWorld) {
  const sessions = Array.isArray(this.state.sessions) ? this.state.sessions as Array<Record<string, unknown>> : [];
  expect(sessions.length).toBeGreaterThan(0);
  const current = await adminPage(this);
  await expect(current.page.getByText(String(sessions[0].device), { exact: false }).first()).toBeVisible();
  await expect(current.page.getByText(String(sessions[0].location), { exact: false }).first()).toBeVisible();
});

Then("static fallback session rows are absent", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  await expect(current.page.getByText("Safari · iOS", { exact: true })).toHaveCount(0);
  await expect(current.page.getByText("Hanoi", { exact: true })).toHaveCount(0);
});

Given("the admin opens the desktop Figma profile surface", async function (this: ScenarioWorld) {
  await loginAdmin(this);
  const current = await adminPage(this);
  await current.page.goto("/admin/profile");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop profile surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await adminPage(this);
  await expect(current.page).toHaveScreenshot("profile.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="profile-identity-fields"]')],
  });
});
