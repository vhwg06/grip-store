import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

async function createRefundRequest(request: any, reason: string) {
  const adminToken = await getAdminToken(request);
  const userToken = await getUserToken(request);

  const createdOrder = await request.post(`${BACKEND_URL}/v1/checkout/orders`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: {
      productId: CHECKOUT_PRODUCT_ID,
      quantity: 1,
      email: process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
    },
  });
  expect(createdOrder.ok()).toBeTruthy();
  const orderId = String((await createdOrder.json())?.data?.id);

  await request.patch(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: "paid" },
  });
  await request.patch(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: "delivered" },
  });

  const refund = await request.post(`${BACKEND_URL}/v1/orders/${orderId}/refund-request`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: { reason },
  });
  expect(refund.status()).toBe(201);
  const refundPayload = await refund.json();
  const data = refundPayload?.data ?? refundPayload;

  return {
    orderId,
    refundId: Number(data.id),
  };
}

async function fetchRefunds(request: any, status = "all") {
  const adminToken = await getAdminToken(request);
  const response = await request.get(`${BACKEND_URL}/v1/admin/refunds?status=${status}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function searchRefund(page: any, query: string) {
  const responsePromise = page.waitForResponse(
    (response: any) => response.url().includes("/v1/admin/refunds") && response.status() === 200,
  );
  await page.getByPlaceholder("Search refund or order...").fill(query);
  await responsePromise;
}

test.describe("Admin Refund @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/refunds");
    await page.waitForLoadState("networkidle");
  });

  test("UC-REF-01 reviews the refund queue and opens evidence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Refund Requests" })).toBeVisible();
    await expect(page.locator('[data-testid="refunds-queue-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Open request" }).first()).toBeVisible();

    const items = page.locator('[data-testid="refund-queue-item"]');
    const count = await items.count();
    for (let index = 0; index < count; index += 1) {
      await expect(items.nth(index)).not.toContainText(/approved/i);
      await expect(items.nth(index)).not.toContainText(/rejected/i);
    }
  });

  test("UC-REF-02 reads refund evidence before deciding", async ({ page }) => {
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("Order ID");
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("User");
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("Product");
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).toContainText("Customer Reason");
    await expect(page.locator('[data-testid="refunds-evidence-payment-context"]')).toBeVisible();
    await expect(page.locator('[data-testid="refunds-evidence-trade-ref"]')).toBeVisible();
  });

  test("UC-REF-03 approves a refund from the admin decision surface", async ({ page, request }) => {
    const created = await createRefundRequest(request, `approve-fe ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    const approveResponse = page.waitForResponse(
      (response: any) =>
        response.url().includes(`/v1/admin/refunds/${created.refundId}/approve`) &&
        [200, 201, 204].includes(response.status()),
    );
    await page.getByRole("button", { name: "Approve refund" }).click();
    await page.getByRole("button", { name: "Yes, Confirm" }).click();
    await approveResponse;

    await expect(
      page.locator('[data-testid="refunds-queue-container"]').getByText(created.orderId, { exact: false }),
    ).toBeHidden();
  });

  test("UC-REF-04 rejects a refund from the admin decision surface", async ({ page, request }) => {
    const created = await createRefundRequest(request, `reject-fe ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    const rejectResponse = page.waitForResponse(
      (response: any) =>
        response.url().includes(`/v1/admin/refunds/${created.refundId}/reject`) &&
        [200, 201, 204].includes(response.status()),
    );
    await page.getByRole("button", { name: "Reject request" }).click();
    await page.getByRole("button", { name: "Yes, Confirm" }).click();
    await rejectResponse;

    await expect(
      page.locator('[data-testid="refunds-queue-container"]').getByText(created.orderId, { exact: false }),
    ).toBeHidden();
  });

  test("UC-REF-05 reviews a refund that is already decided", async ({ page, request }) => {
    const approvedPayload = await fetchRefunds(request, "approved");
    const approvedItems = Array.isArray(approvedPayload?.data) ? approvedPayload.data : [];
    expect(approvedItems.length).toBeGreaterThan(0);
    const approved = approvedItems[0];

    await searchRefund(page, String(approved.order_id));

    await expect(page.getByText(String(approved.order_id), { exact: false })).toBeVisible();
    await expect(page.getByText(/approved/i)).toBeVisible();
    await expect(page.getByText(String(approved.admin_note), { exact: false })).toBeVisible();
  });
});
