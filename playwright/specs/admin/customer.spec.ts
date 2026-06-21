import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Customer @admin P1", () => {
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
    await page.goto("/admin/customers/", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  async function searchForUser(page: any, query: string) {
    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByTestId("customer-search-input").fill(query);
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;
  }

  async function findCustomerWithOrdersButNoRefunds(request: any) {
    const token = await getAdminToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/users?page=1&pageSize=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    const users = Array.isArray(payload?.data) ? payload.data : [];
    const candidate = users.find(
      (item: any) =>
        Number(item.orderCount ?? item.order_count ?? 0) > 0 &&
        Number(item.refundCount ?? item.refund_count ?? 0) === 0 &&
        !Boolean(item.is_admin ?? item.isAdmin ?? item.role === "Administrator"),
    );
    if (!candidate) return null;
    return {
      query: candidate.email ?? candidate.username ?? candidate.id ?? candidate.user_id,
      username: candidate.username,
    };
  }

  function customerRow(page: any, username: string) {
    return page
      .locator('[data-testid="user-row"]')
      .filter({
        has: page.getByRole("link", { name: username }),
      })
      .first();
  }

  test("UC-CUS-01 finds a customer record from customer-centric search", async ({ page }) => {
    // GOAL: Admin Finds A Customer Record: tìm đúng khách hàng cần hỗ trợ hoặc cần điều tra.
    // PRIORITY: P1
    // RELATED DOMAINS: order
    // SCENARIO: SC-CUS-01 Main flow
    // INVARIANT: customer là commerce identity, không phải chỉ là account row
    // INVARIANT: search phải narrow về đúng customer — không trả mixed account rows
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    await searchForUser(page, "test_buyer");

    const rows = page.locator('[data-testid="user-row"]');
    await expect(rows).toHaveCount(1);
    await expect(page.getByText("test_buyer", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("test_admin", { exact: false }).first()).toBeHidden();
  });

  test("UC-CUS-02 renders customer summary and commerce indicators", async ({ page }) => {
    // GOAL: Admin Reads Customer Profile Summary: hiểu customer này là ai trong bối cảnh commerce của hệ thống.
    // PRIORITY: P1
    // RELATED DOMAINS: order
    // SCENARIO: SC-CUS-02 Main flow
    await searchForUser(page, "test_buyer");
    await customerRow(page, "test_buyer").click();

    const panel = page.getByTestId("customer-actions-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId("summary-email")).toHaveText("test_buyer@example.com");
    await expect(panel.getByTestId("customer-summary-order-count")).toContainText(/\d+/);
    await expect(panel.getByTestId("customer-summary-refund-count")).toContainText(/\d+/);
    await expect(panel.getByTestId("customer-summary-review-count")).toContainText(/\d+/);
    await expect(panel.getByTestId("customer-summary-customer-id")).not.toHaveText("");
  });

  test("UC-CUS-03 traverses commerce links from the customer root", async ({ page }) => {
    // GOAL: Admin Reads Customer Commerce Context: hiểu toàn bộ ngữ cảnh commerce của customer để hỗ trợ xử lý.
    // PRIORITY: P1
    // RELATED DOMAINS: order
    // SCENARIO: SC-CUS-03 Main flow
    await searchForUser(page, "test_buyer");
    await customerRow(page, "test_buyer").click();

    await expect(page.getByRole("button", { name: "Open history" })).toBeVisible();
    await expect(page.getByRole("button", { name: /refund/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /review/i })).toBeVisible();
  });

  test("UC-CUS-04 distinguishes customer root from user-domain controls", async ({ page }) => {
    // GOAL: Admin Distinguishes Customer From User Account: tránh nhầm lẫn giữa commerce identity và account/system identity.
    // PRIORITY: P1
    // RELATED DOMAINS: user
    // SCENARIO: SC-CUS-04 Main flow
    // INVARIANT: customer và user có thể liên kết nhưng không đồng nhất
    // INVARIANT: commerce history bám theo customer, không bám theo user management view
    await searchForUser(page, "test_buyer");
    await customerRow(page, "test_buyer").click();

    const panel = page.getByTestId("customer-actions-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("button", { name: /^Account$/ })).toBeVisible();
    await panel.getByRole("button", { name: /^Account$/ }).click();

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByTestId("user-management-title")).toBeVisible();
    await expect(page.getByTestId("user-search-input")).toHaveValue("test_buyer");
    await expect(page.getByTestId("account-actions-panel")).toBeVisible();
    await expect(page.getByTestId("account-open-customer")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open history" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open refunds" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open reviews" })).toHaveCount(0);
  });

  test("UC-CUS-05 treats empty commerce history as a valid customer state", async ({ page, request }) => {
    // GOAL: Admin Reads A Customer With No Commerce History: xác nhận một customer vẫn là customer hợp lệ ngay cả khi chưa có order, refund, hay review history.
    // PRIORITY: P1
    // RELATED DOMAINS: user
    // SCENARIO: SC-CUS-05 Main flow
    const created = await registerEmptyHistoryUser(request);

    await searchForUser(page, created.email);

    await expect(page.getByText(created.username, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/empty commerce history/i)).toBeVisible();
    await expect(page.locator('[data-testid="customer-summary-order-count"]')).toContainText(/^0$/);
  });

  // UC-ORD-04 has been migrated to orders.spec.ts because customer-linked purchase history is an order domain concern.
  // Refer to UC-ORD-04 in orders.spec.ts for the actual test implementation.

  test("UC-CUS-01 renders empty search state gracefully", async ({ page }) => {
    // GOAL: Admin Finds A Customer Record: tìm đúng khách hàng cần hỗ trợ hoặc cần điều tra.
    // PRIORITY: P1
    // RELATED DOMAINS: order
    // SCENARIO: SC-CUS-01 Main flow
    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByTestId("customer-search-input").fill("nonexistent-customer-12345xyz");
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;

    await expect(page.getByText("No results")).toBeVisible();
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });

  test("UC-CUS-01 exception: admin accounts must not appear in customer search results", async ({ page }) => {
    // GOAL: Admin Finds A Customer Record: tìm đúng khách hàng cần hỗ trợ hoặc cần điều tra.
    // PRIORITY: P1
    // RELATED DOMAINS: order
    // SCENARIO: SC-CUS-01 Exception flow
    // INVARIANT: customer search results chỉ được chứa customer account, không được trả admin/operator accounts
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    await searchForUser(page, "test_admin");

    const rows = page.locator('[data-testid="user-row"]');
    await expect(rows).toHaveCount(0);
    await expect(page.getByText("test_admin", { exact: false }).first()).toBeHidden();
  });

  test("UC-CUS-02 alternate: customer with orders but no refunds shows correct commerce indicator set", async ({ page, request }) => {
    // GOAL: Admin Reads Customer Profile Summary: hiểu customer này là ai trong bối cảnh commerce của hệ thống.
    // PRIORITY: P1
    // RELATED DOMAINS: order
    // SCENARIO: SC-CUS-02 Alternate flow
    await expect(page.getByTestId("customer-management-title")).toBeVisible();

    const candidate = await findCustomerWithOrdersButNoRefunds(request);
    test.skip(
      !candidate,
      "data-blocked: no seeded customer currently exposes orderCount > 0 with refundCount = 0 in /v1/admin/users",
    );
    await searchForUser(page, candidate.query);
    await customerRow(page, candidate.username).click();

    await expect(page.locator('[data-testid="customer-summary-order-count"]')).toContainText(/[1-9]\d*/);
    await expect(page.locator('[data-testid="customer-summary-refund-count"]')).toContainText(/^0$/);
  });
});
