import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Customer @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  async function registerEmptyHistoryUser(request: any) {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const email = `pw-empty-${suffix}@example.com`;
    const username = `pw_empty_${suffix}`;
    const response = await request.post(`${BACKEND_URL}/v1/auth/register`, {
      data: {
        username,
        email,
        password: "Password123!",
      },
    });
    expect(response.ok()).toBeTruthy();
    return { username, email };
  }

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
  });

  async function searchForUser(page: any, query: string) {
    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByPlaceholder("Search email, phone, user ID...").fill(query);
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;
  }

  test("UC-CUS-01 finds a customer record from customer-centric search", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    await searchForUser(page, "test_buyer");

    const rows = page.locator('[data-testid="user-row"]');
    await expect(rows).toHaveCount(1);
    await expect(page.getByText("test_buyer", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("test_admin", { exact: false }).first()).toBeHidden();
  });

  test("UC-CUS-02 renders customer summary and commerce indicators", async ({ page }) => {
    test.fail(true, "blocked-both: missing customerId and commerce summary indicators in customer/account view");
    await searchForUser(page, "test_buyer");
    await page.getByText("test_buyer", { exact: false }).first().click();

    await expect(page.getByText("Customer Actions")).toBeVisible();
    await expect(page.getByText("test_buyer@example.com")).toBeVisible();
    await expect(page.locator('[data-testid="customer-summary-order-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-summary-customer-id"]')).toBeVisible();
    await expect(page.getByText(/order/i)).toBeVisible();
    await expect(page.getByText(/refund/i)).toBeVisible();
    await expect(page.getByText(/review/i)).toBeVisible();
  });

  test("UC-CUS-03 traverses commerce links from the customer root", async ({ page }) => {
    test.fail(true, "blocked-both: missing refund and review navigation entrypoints in customer summary panel");
    await searchForUser(page, "test_buyer");
    await page.getByText("test_buyer", { exact: false }).first().click();

    await expect(page.getByRole("button", { name: "Open history" })).toBeVisible();
    await expect(page.getByRole("button", { name: /refund/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /review/i })).toBeVisible();
  });

  test("UC-CUS-04 distinguishes customer root from user-domain controls", async ({ page }) => {
    test.fail(true, "blocked-both: customer details missing linked-user account markers and account navigation");
    await searchForUser(page, "test_buyer");
    await page.getByText("test_buyer", { exact: false }).first().click();

    await expect(page.getByText(/linked user/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /account/i })).toBeVisible();
  });

  test("UC-CUS-05 treats empty commerce history as a valid customer state", async ({ page, request }) => {
    test.fail(true, "blocked-both: new registered users missing empty commerce layout and indicators");
    const created = await registerEmptyHistoryUser(request);

    await searchForUser(page, created.email);

    await expect(page.getByText(created.username, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/empty commerce history/i)).toBeVisible();
    await expect(page.locator('[data-testid="customer-summary-order-count"]')).toContainText(/^0$/);
  });

  test("UC-ORD-04 opens customer-linked purchase history from customer context", async ({ page }) => {
    test.fail(true, "blocked-both: customer Open history navigates with empty query instead of customer ID");
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    const adminToken = await getAdminToken(page.request);
    const customerResp = await page.request.get(`${BACKEND_URL}/v1/admin/users?q=test_buyer&page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(customerResp.ok()).toBeTruthy();
    const customerPayload = await customerResp.json();
    const buyer = Array.isArray(customerPayload?.data)
      ? customerPayload.data.find((item: any) => item.username === "test_buyer")
      : null;
    const buyerCustomerId = buyer?.customerId ?? buyer?.customer_id;
    expect(buyerCustomerId).toBeTruthy();

    await searchForUser(page, "test_buyer");
    const buyerRow = page.getByText("test_buyer", { exact: false }).first();
    await buyerRow.click();

    await expect(page.getByText("Customer Actions")).toBeVisible();
    await page.getByRole("button", { name: "Open history" }).click();

    await expect(page).toHaveURL(new RegExp(`/admin/orders\\?q=${buyerCustomerId}`));
    await expect(page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first()).toBeVisible();
  });

  test("UC-CUS-01 renders empty search state gracefully", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByPlaceholder("Search email, phone, user ID...").fill("nonexistent-customer-12345xyz");
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;

    await expect(page.getByText("No results")).toBeVisible();
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });
});
