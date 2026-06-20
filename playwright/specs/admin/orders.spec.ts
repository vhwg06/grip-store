import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

async function createPendingOrderViaApi(request: any) {
  const userToken = await getUserToken(request);
  expect(userToken).toBeTruthy();

  const response = await request.post(`${BACKEND_URL}/v1/checkout/orders`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: {
      productId: CHECKOUT_PRODUCT_ID,
      quantity: 1,
      email: process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
    },
  });
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const order = payload?.data ?? payload;
  expect(order?.id).toBeTruthy();
  expect(order?.status).toBe("pending");
  return String(order.id);
}

async function fetchAdminOrder(request: any, orderId: string) {
  const adminToken = await getAdminToken(request);
  expect(adminToken).toBeTruthy();

  const response = await request.get(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe("Admin Orders @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("orders");
  });

  test("UC-ORD-01 renders queue state and preserves row-to-detail handoff", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Order Management" })).toBeVisible();
    await expect(page.locator('[data-testid="admin-table"]')).toBeVisible();

    const deliveredRow = page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first();
    await expect(deliveredRow).toBeVisible();
    await expect(deliveredRow).toContainText("Delivered");
    await expect(deliveredRow.getByRole("button", { name: "Mark delivered" })).toBeDisabled();

    await deliveredRow.getByRole("link", { name: "Open detail" }).click();
    await expect(page).toHaveURL(/\/admin\/orders\/test-order-0001$/);
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
  });

  test("UC-ORD-02 renders order detail context before action", async ({ page }) => {
    await page.goto("/admin/orders/test-order-0001");
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();

    await expect(page.getByText("Order Detail #test-order-0001")).toBeVisible();
    await expect(page.getByText("test_buyer@example.com")).toBeVisible();
    await expect(page.getByText("Payment Method")).toBeVisible();
    await expect(page.getByText("Order Timeline & Notes")).toBeVisible();
    await expect(page.getByText("This order is in a terminal state (DELIVERED). No further actions are allowed.")).toBeVisible();
  });

  test("UC-ORD-03 submits a valid pending-to-paid transition from the admin queue", async ({ page, request }) => {
    const orderId = await createPendingOrderViaApi(request);

    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto(`/admin/orders?q=${orderId}`);
    await listResponse;

    const row = page.locator('[data-testid="order-row"]').filter({ hasText: orderId }).first();
    await expect(row).toBeVisible();
    await expect(row.getByRole("button", { name: "Mark delivered" })).toBeDisabled();

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await row.click();
    await page.getByRole("button", { name: "Mark paid" }).click();
    await page.waitForLoadState("networkidle");

    const payload = await fetchAdminOrder(request, orderId);
    expect(payload.status).toBe("PAID");
    expect(payload.paidAt).toBeTruthy();
  });

  test("UC-ORD-05 renders refund relevance for an order that has a pending refund request", async ({ page }) => {
    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto("/admin/orders?q=test-order-0001");
    await listResponse;

    const row = page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first();
    await expect(row).toBeVisible();
    await row.click();

    await expect(page.getByText("Order Signals")).toBeVisible();
    const refundSignalRow = page.getByText("Refund requested", { exact: true }).locator("xpath=..");
    await expect(refundSignalRow).toBeVisible();
    await expect(refundSignalRow.getByText("Requested", { exact: true })).toBeVisible();
  });

  test("UC-ORD-06 keeps incomplete-context order detail readable with safe fallbacks", async ({ page }) => {
    await page.goto("/admin/orders/test-order-0002");
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark delivered" })).toBeDisabled();
    await expect(page.getByText("Awaiting fulfillment (missing tracking ID - safe fallback)")).toBeVisible();
    await expect(page.getByText(/missing shipping address/i)).toBeVisible();
    await expect(page.getByText("COD / QR Transfer")).toBeVisible();
    await expect(page.getByText("Thu Duc, Ho Chi Minh City")).toBeVisible();
  });

  test("UC-ORD-01 renders empty state gracefully", async ({ page }) => {
    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto("/admin/orders?q=nonexistent-order-12345xyz");
    await listResponse;
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No orders found")).toBeVisible();
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });
});
