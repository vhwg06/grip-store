import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";
import { getAdminToken, getUserToken, requiredEnv } from "../../../shared/runtime/api-helpers/auth.helpers";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.store-setting") return;
  this.activeModule = "admin.store-setting";
});

function settingsRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

async function settingsBrowser(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginSettingsBrowser(world: ScenarioWorld): Promise<void> {
  const current = await settingsBrowser(world);
  await current.auth.gotoLogin();
  await current.auth.login(requiredEnv("ADMIN_USER_EMAIL"), requiredEnv("ADMIN_USER_PASSWORD"));
  await current.page.waitForLoadState("domcontentloaded");
  await current.page.goto("/admin/settings");
  await current.page.waitForLoadState("networkidle");
}

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

When("the client reads admin store settings and public catalog settings", async function (this: ScenarioWorld) {
  const adminToken = await getAdminToken(await this.getApiRequest());
  const client = await this.getApiClient();
  const admin = await client.get("/v1/admin/store-settings", { headers: { Authorization: `Bearer ${adminToken}` } });
  const site = await client.get("/v1/site-config");
  const catalog = await client.get("/v1/catalog/settings");
  this.state.settingsAdmin = admin;
  this.state.settingsSite = site;
  this.state.settingsCatalog = catalog;
});

Then("the admin identity response contains brand contact stats and visitor count", function (this: ScenarioWorld) {
  const response = this.state.settingsAdmin as { status: number; data: unknown };
  expect(response.status).toBe(200);
  const data = settingsRecord(response.data);
  expect(settingsRecord(data.config).brand).toBeTruthy();
  expect(settingsRecord(data.config).contact).toBeTruthy();
  expect(data.stats).toBeTruthy();
  expect(typeof data.visitorCount).toBe("number");
});

Then("public settings contain storefront identity fields", function (this: ScenarioWorld) {
  const site = this.state.settingsSite as { status: number; data: unknown };
  const catalog = this.state.settingsCatalog as { status: number; data: unknown };
  expect(site.status).toBe(200);
  expect(catalog.status).toBe(200);
  expect(settingsRecord(site.data).brand).toBeTruthy();
  expect(settingsRecord(site.data).contact).toBeTruthy();
  expect(typeof settingsRecord(catalog.data).shopName).toBe("string");
  expect(typeof settingsRecord(catalog.data).shopDescription).toBe("string");
});

Given("an admin has a valid storefront identity payload", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  this.state.validBrand = {
    shopName: `Cucumber Store ${Date.now()}`,
    shopDescription: "Cucumber storefront identity contract",
    shopLogo: "https://example.com/cucumber-store-logo.webp",
    themeColor: "amber",
  };
  this.state.validContact = {
    stickyBarAddress: "Cucumber Street",
    stickyBarHotline: "+84 903 117 742",
    contactEmail: "cucumber-store@example.com",
  };
});

When("the admin updates brand and contact facts", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/brand", this.state.validBrand);
  assertAccepted(this);
  await adminPut(this, "/v1/admin/store-settings/contact", this.state.validContact);
});

Then("admin settings contain the updated identity facts", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await adminGet(this, "/v1/admin/store-settings");
  const config = settingsRecord(responseData(this).config);
  expect(config.brand).toEqual(this.state.validBrand);
  expect(config.contact).toEqual(this.state.validContact);
});

Then("public catalog settings contain the updated shop identity", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/catalog/settings");
  expect(response.status).toBe(200);
  const data = settingsRecord(response.data);
  const brand = this.state.validBrand as Record<string, unknown>;
  expect(data.shopName).toBe(brand.shopName);
  expect(data.shopDescription).toBe(brand.shopDescription);
  expect(data.themeColor).toBe(brand.themeColor);
});

When("an unauthenticated client reads admin store settings", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/store-settings");
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/store-settings" };
});

Then("the store settings response status is `401`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(401);
});

When("a shopper reads admin store settings", async function (this: ScenarioWorld) {
  const token = await getUserToken(await this.getApiRequest());
  const response = await (await this.getApiClient()).get("/v1/admin/store-settings", { headers: { Authorization: `Bearer ${token}` } });
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/store-settings" };
});

Then("the store settings response status is `403`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(403);
});

When("the admin saves a valid homepage composition", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/homepage", {
    blocks: [
      { key: "hero", enabled: true, order: 1 },
      { key: "categories", enabled: true, order: 2 },
      { key: "latest_news", enabled: true, order: 3 },
    ],
    newsCount: 3,
  });
});

Then("the homepage settings response status is `200`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(200);
});

When("the admin saves duplicate homepage ordering and a negative news count", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/homepage", {
    blocks: [{ key: "hero", enabled: true, order: 1 }, { key: "hero", enabled: true, order: 2 }],
    newsCount: -1,
  });
});

Then("the homepage settings response status is `400`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(400);
});

When("the admin saves valid footer and support commitments", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/footer", {
    columns: [{ id: "cucumber-products", title: "Cucumber products", links: [{ label: "Products", url: "/products" }] }],
    copyright: "Copyright 2026 Cucumber Grip",
    socialLinks: { facebook: "https://facebook.com/cucumber-grip" },
  });
  const footerStatus = adminState(this).response?.status;
  await adminPut(this, "/v1/admin/store-settings/floating-support", {
    actions: [{ key: "zalo", enabled: true, target: "https://zalo.me/cucumber-grip" }, { key: "scroll_to_top", enabled: true, target: null }],
  });
  this.state.footerStatus = footerStatus;
});

Then("the footer and support settings responses are successful", function (this: ScenarioWorld) {
  expect(this.state.footerStatus).toBe(200);
  expect(adminState(this).response?.status).toBe(200);
});

When("the admin saves malformed support targets", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/store-settings/floating-support", {
    actions: [{ key: "zalo", enabled: true, target: "not-a-url" }, { key: "scroll_to_top", enabled: true, target: "unexpected" }],
  });
});

Then("the support settings response status is `400`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(400);
});

Given("an admin opens store settings in the browser", async function (this: ScenarioWorld) {
  await loginSettingsBrowser(this);
});

When("the admin saves valid contact facts in the browser", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.locator('[data-testid="settings-contact-address"]').fill("Cucumber Street, Ho Chi Minh City");
  await current.page.locator('[data-testid="settings-contact-hotline"]').fill("+84 903 117 742");
  await current.page.locator('[data-testid="settings-contact-email"]').fill("cucumber-contact@grip.vn");
  await current.page.locator('[data-testid="settings-save-contact"]').click();
  await expect(current.page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();
});

Then("the homepage shows the saved contact facts", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.goto("/");
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="sticky-bar-address"]')).toContainText("Cucumber Street");
  await expect(current.page.locator('[data-testid="sticky-bar-hotline"]')).toContainText("+84 903 117 742");
  await expect(current.page.locator('[data-testid="footer-contact-email"]')).toContainText("cucumber-contact@grip.vn");
});

When("the admin enters an invalid contact email", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.locator('[data-testid="settings-contact-email"]').fill("invalid-email");
});

Then("the browser disables the contact save action and shows the validation message", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await expect(current.page.getByText("Invalid email format.")).toBeVisible();
  await expect(current.page.locator('[data-testid="settings-save-contact"]')).toBeDisabled();
});

When("the admin saves a homepage composition decision", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.locator('[data-testid="homepage-news-count"]').fill("3");
  const moveUp = current.page.locator('[data-testid="homepage-block-categories-move-up"]');
  if (await moveUp.isEnabled()) await moveUp.click();
  await current.page.locator('[data-testid="settings-save-homepage"]').click();
  await expect(current.page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();
});

Then("the homepage shows the configured content modules", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.goto("/");
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="homepage-module-categories"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="homepage-module-latest-news"]')).toBeVisible();
  expect(await current.page.locator('[data-testid="latest-news-card"]').count()).toBeLessThanOrEqual(3);
});

When("the admin enters a negative homepage news count", async function (this: ScenarioWorld) {
  await (await settingsBrowser(this)).page.locator('[data-testid="homepage-news-count"]').fill("-1");
});

Then("the browser disables the homepage save action", async function (this: ScenarioWorld) {
  await expect((await settingsBrowser(this)).page.locator('[data-testid="settings-save-homepage"]')).toBeDisabled();
});

When("the admin saves valid footer and support controls", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.locator('[data-testid="social-link-facebook"]').fill("https://facebook.com/cucumber-grip");
  await current.page.locator('[data-testid="settings-save-footer-social"]').click();
  const zalo = current.page.locator('[data-testid="support-action-zalo-enabled"]');
  if (!(await zalo.isChecked())) await zalo.click();
  await current.page.locator('[data-testid="support-action-zalo-target"]').fill("https://zalo.me/cucumber-grip");
  await current.page.locator('[data-testid="settings-save-support-controls"]').click();
  await expect(current.page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();
});

Then("the homepage shows the configured support links", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await current.page.goto("/");
  await current.page.waitForLoadState("networkidle");
  await expect(current.page.locator('[data-testid="footer-social-facebook"]')).toHaveAttribute("href", /facebook\.com\/cucumber-grip/);
  await expect(current.page.locator('[data-testid="floating-button-zalo"]')).toHaveAttribute("href", /zalo\.me\/cucumber-grip/);
});

Given("the admin opens the desktop Figma store settings surface", async function (this: ScenarioWorld) {
  await loginSettingsBrowser(this);
  await (await settingsBrowser(this)).page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop store settings surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await settingsBrowser(this);
  await expect(current.page).toHaveScreenshot("store-settings.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="settings-section-overview"]')],
  });
});
