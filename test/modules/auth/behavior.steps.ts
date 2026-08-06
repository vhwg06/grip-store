import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../shared/cucumber/world";
import { requiredEnv } from "../../shared/runtime/api-helpers/auth.helpers";
import { AuthPage } from "../../shared/runtime/objects/auth.page";

type AuthState = {
  email?: string;
  password?: string;
  invalidEmail?: string;
  invalidPassword?: string;
  response?: { status: number; data: unknown };
  accessToken?: string;
  refreshToken?: string;
};

function state(world: ScenarioWorld): AuthState {
  return world.state as AuthState;
}

async function page(world: ScenarioWorld) {
  const browserPage = await world.getBrowserPage();
  return { page: browserPage, auth: new AuthPage(browserPage) };
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "auth") return;
  this.activeModule = "auth";
});

Given("a registered account has valid credentials", async function (this: ScenarioWorld) {
  const auth = await page(this);
  state(this).email = requiredEnv("TEST_USER_EMAIL");
  state(this).password = requiredEnv("TEST_USER_PASSWORD");
  await auth.auth.gotoLogin();
});

When("the account submits the login form", async function (this: ScenarioWorld) {
  const auth = await page(this);
  await auth.auth.login(state(this).email!, state(this).password!);
  await auth.page.waitForLoadState("domcontentloaded");
});

Then("the account is authenticated", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="user-avatar"]')).toBeVisible();
});

Given("an account submits invalid credentials", async function (this: ScenarioWorld) {
  const auth = await page(this);
  state(this).invalidEmail = "invalid-cucumber-account@example.com";
  state(this).invalidPassword = "definitely-invalid-password";
  await auth.auth.gotoLogin();
});

When("the login request is processed", async function (this: ScenarioWorld) {
  const auth = await page(this);
  await auth.auth.login(state(this).invalidEmail!, state(this).invalidPassword!);
  await auth.page.waitForLoadState("domcontentloaded");
});

Then("the system shows an authentication error", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="login-error-message"]')).toBeVisible();
});

Given("the login form has required fields", async function (this: ScenarioWorld) {
  await (await page(this)).auth.gotoLogin();
});

When("the account submits the form without required values", async function (this: ScenarioWorld) {
  const auth = await page(this);
  await auth.page.locator('[data-testid="login-submit-btn"]').click();
});

Then("the system shows validation errors", async function (this: ScenarioWorld) {
  const current = await page(this);
  await expect(
    current.page.locator('[data-testid="login-error-message"], [data-testid="signup-error-message"], [role="alert"]').first(),
  ).toBeVisible();
});

Given("the account chooses OAuth authentication", async function (this: ScenarioWorld) {
  await (await page(this)).auth.gotoLogin();
});

When("the account starts the OAuth flow", async function (this: ScenarioWorld) {
  const current = await page(this);
  const oauth = current.page.locator('[data-testid="oauth-linuxdo-btn"], [data-testid="oauth-github-btn"], [data-testid="oauth-btn"]').first();
  await expect(oauth).toBeVisible();
  await oauth.click();
});

Then("the system initiates the provider redirect", async function (this: ScenarioWorld) {
  const current = await page(this);
  await expect(current.page).toHaveURL(/oauth|authorize|login/);
});

Given("an account has an authenticated session", async function (this: ScenarioWorld) {
  const current = await page(this);
  state(this).email = requiredEnv("TEST_USER_EMAIL");
  state(this).password = requiredEnv("TEST_USER_PASSWORD");
  await current.auth.gotoLogin();
  await current.auth.login(state(this).email!, state(this).password!);
  await current.page.waitForLoadState("domcontentloaded");
});

When("the account refreshes the page", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.page.reload();
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the session remains available", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="user-avatar"]')).toBeVisible();
});

When("the account logs out", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.auth.logout();
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the session is invalidated", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="user-avatar"]')).not.toBeVisible();
});

Given("a visitor opens registration", async function (this: ScenarioWorld) {
  await (await page(this)).auth.gotoSignUp();
});

When("the registration surface loads", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="signup-submit-btn"]')).toBeVisible();
});

Then("the registration form is visible", async function (this: ScenarioWorld) {
  const current = await page(this);
  await expect(current.page.locator('[data-testid="signup-name-input"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="signup-email-input"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="signup-password-input"]')).toBeVisible();
});

Given("a visitor submits registration without required fields", async function (this: ScenarioWorld) {
  await (await page(this)).auth.gotoSignUp();
});

When("the registration request is processed", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.page.locator('[data-testid="signup-submit-btn"]').click();
});

Given("an email already belongs to an account", async function (this: ScenarioWorld) {
  const current = await page(this);
  state(this).email = requiredEnv("TEST_USER_EMAIL");
  state(this).password = requiredEnv("TEST_USER_PASSWORD");
  await current.auth.gotoSignUp();
});

When("a visitor registers with that email", async function (this: ScenarioWorld) {
  await (await page(this)).auth.signUp("Duplicate Cucumber Account", state(this).email!, state(this).password!);
});

Then("the system shows a duplicate-email error", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="signup-error-message"], [role="alert"]').first()).toBeVisible();
});

Given("a visitor has a unique registration email", async function (this: ScenarioWorld) {
  const current = await page(this);
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  state(this).email = `cucumber-${suffix}@example.com`;
  state(this).password = `Cucumber-${suffix}!Aa1`;
  await current.auth.gotoSignUp();
});

When("the visitor submits valid registration details", async function (this: ScenarioWorld) {
  await (await page(this)).auth.signUp("Cucumber Buyer", state(this).email!, state(this).password!);
});

Then("the account registration is accepted", async function (this: ScenarioWorld) {
  const current = await page(this);
  await expect(current.page).not.toHaveURL(/signup/);
});

async function apiLogin(world: ScenarioWorld, email: string, password: string): Promise<void> {
  const response = await (await world.getApiClient()).post<Record<string, unknown>>("/v1/auth/login", { email, password });
  state(world).response = { status: response.status, data: response.data };
  const data = response.data as Record<string, unknown>;
  state(world).accessToken = String(data.accessToken ?? data.token ?? data.access_token ?? "");
  state(world).refreshToken = String(data.refreshToken ?? data.refresh_token ?? "");
}

Given("the configured shopper credentials are valid", function (this: ScenarioWorld) {
  state(this).email = requiredEnv("TEST_USER_EMAIL");
  state(this).password = requiredEnv("TEST_USER_PASSWORD");
});

When("the client posts those credentials to the login API", async function (this: ScenarioWorld) {
  await apiLogin(this, state(this).email!, state(this).password!);
});

Then("the login API response status is `200`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

Then("the login API response contains an access token and refresh token", function (this: ScenarioWorld) {
  expect(state(this).accessToken).toBeTruthy();
  expect(state(this).refreshToken).toBeTruthy();
});

Given("invalid shopper credentials are supplied", function (this: ScenarioWorld) {
  state(this).email = "invalid-cucumber-account@example.com";
  state(this).password = "definitely-invalid-password";
});

Then("the login API response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

Given("a login request has no email", function (this: ScenarioWorld) {
  state(this).password = "Password123!";
});

When("the client posts that login request to the login API", async function (this: ScenarioWorld) {
  await apiLogin(this, "", state(this).password!);
});

Then("the login API response status is `400` or `422`", function (this: ScenarioWorld) {
  expect([400, 422]).toContain(state(this).response?.status);
});

Given("a valid shopper access token is available", async function (this: ScenarioWorld) {
  state(this).email = requiredEnv("TEST_USER_EMAIL");
  state(this).password = requiredEnv("TEST_USER_PASSWORD");
  await apiLogin(this, state(this).email!, state(this).password!);
  expect(state(this).accessToken).toBeTruthy();
});

When("the client reads the authenticated user endpoint", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/auth/me", {
    headers: { Authorization: `Bearer ${state(this).accessToken}` },
  });
  state(this).response = { status: response.status, data: response.data };
});

Then("the authenticated user response status is `200`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

Then("the authenticated user response contains identity and role", function (this: ScenarioWorld) {
  const data = state(this).response?.data as Record<string, unknown>;
  expect(data.id).toBeDefined();
  expect(data.email).toBeDefined();
  expect(data.username).toBeDefined();
  expect(data.role).toBeDefined();
});

When("the client reads the authenticated user endpoint without a token", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/auth/me");
  state(this).response = { status: response.status, data: response.data };
});

Then("the authenticated user response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

Given("a valid refresh token is available", async function (this: ScenarioWorld) {
  await apiLogin(this, requiredEnv("TEST_USER_EMAIL"), requiredEnv("TEST_USER_PASSWORD"));
  expect(state(this).refreshToken).toBeTruthy();
});

When("the client posts that refresh token to the refresh API", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post<Record<string, unknown>>("/v1/auth/refresh", { refresh_token: state(this).refreshToken });
  state(this).response = { status: response.status, data: response.data };
  const data = response.data as Record<string, unknown>;
  state(this).accessToken = String(data.accessToken ?? data.token ?? "");
  state(this).refreshToken = String(data.refreshToken ?? data.refresh_token ?? "");
});

Then("the refresh API response status is `200`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

Then("the refresh API response contains access and refresh tokens", function (this: ScenarioWorld) {
  expect(state(this).accessToken).toBeTruthy();
  expect(state(this).refreshToken).toBeTruthy();
});

When("the client posts an invalid refresh token to the refresh API", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/auth/refresh", { refresh_token: "invalid-token-12345" });
  state(this).response = { status: response.status, data: response.data };
});

Then("the refresh API response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

When("the client logs out with that token", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/auth/logout", undefined, {
    headers: { Authorization: `Bearer ${state(this).accessToken}` },
  });
  state(this).response = { status: response.status, data: response.data };
});

Then("the logout API response status is `200`, `204`, or `400`", function (this: ScenarioWorld) {
  expect([200, 204, 400]).toContain(state(this).response?.status);
});

When("the client logs out without a token", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/auth/logout");
  state(this).response = { status: response.status, data: response.data };
});

Then("the logout API response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

When("the client reads the shopper profile endpoint", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/profile", { headers: { Authorization: `Bearer ${state(this).accessToken}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the shopper profile response status is `200`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(200);
});

Then("the shopper profile exposes an identity", function (this: ScenarioWorld) {
  const data = state(this).response?.data as Record<string, unknown>;
  expect(data.id ?? (data.user as Record<string, unknown> | undefined)?.id).toBeDefined();
});

When("the client reads the shopper profile endpoint without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/profile");
  state(this).response = { status: response.status, data: response.data };
});

Then("the shopper profile response status is `401`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(401);
});

Then("the shopper profile response status is `404`", function (this: ScenarioWorld) {
  expect(state(this).response?.status).toBe(404);
});

When("the client updates shopper email without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).patch("/v1/profile/email", { email: "cucumber@example.com" });
  state(this).response = { status: response.status, data: response.data };
});

When("the client updates shopper notifications without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).patch("/v1/profile/notifications", { enabled: true });
  state(this).response = { status: response.status, data: response.data };
});

When("the client reads the legacy shopper profile endpoint", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/user/profile", { headers: { Authorization: `Bearer ${state(this).accessToken}` } });
  state(this).response = { status: response.status, data: response.data };
});

Then("the legacy shopper profile does not expose loyalty points", function (this: ScenarioWorld) {
  expect(state(this).response?.data).not.toHaveProperty("points");
});

When("the client reads the legacy shopper profile endpoint without authentication", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/user/profile");
  state(this).response = { status: response.status, data: response.data };
});

When("the client posts to the removed check-in endpoint", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/profile/checkin", undefined, { headers: { Authorization: `Bearer ${state(this).accessToken}` } });
  state(this).response = { status: response.status, data: response.data };
});

When("the client reads the removed check-in status endpoints", async function (this: ScenarioWorld) {
  const paths = ["/v1/user/profile/checkin-status", "/v1/user/profile/checkin/status", "/v1/profile/checkin-status", "/v1/profile/checkin/status"];
  const statuses: number[] = [];
  for (const path of paths) statuses.push((await (await this.getApiClient()).get(path)).status);
  state(this).response = { status: statuses.every((status) => status === 404) ? 404 : statuses[0] ?? 0, data: statuses };
});

Then("every removed check-in endpoint responds with `404`", function (this: ScenarioWorld) {
  expect(state(this).response?.data).toEqual([404, 404, 404, 404]);
});
