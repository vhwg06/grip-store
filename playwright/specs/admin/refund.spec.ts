import { test, expect } from "../../src/fixtures/base-test";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

async function loginForToken(request: any, email: string, password: string) {
  const response = await request.post(`${BACKEND_URL}/v1/auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return (
    payload?.data?.accessToken ??
    payload?.data?.access_token ??
    payload?.data?.token ??
    payload?.accessToken ??
    payload?.access_token ??
    payload?.token ??
    null
  ) as string | null;
}

async function getAdminToken(request: any) {
  const token = await loginForToken(
    request,
    process.env.ADMIN_USER_EMAIL ?? "test_admin@example.com",
    process.env.ADMIN_USER_PASSWORD ?? "Password123!",
  );
  expect(token).toBeTruthy();
  return token as string;
}

async function getUserToken(request: any) {
  const token = await loginForToken(
    request,
    process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
    process.env.TEST_USER_PASSWORD ?? "Password123!",
  );
  expect(token).toBeTruthy();
  return token as string;
}

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
  });

  test("UC-REF-02 reads refund evidence before deciding", async ({ page }) => {
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("Order ID");
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("User");
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("Product");
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).toContainText("Customer Reason");
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).toContainText("trade");
  });

  test("UC-REF-03 approves a refund from the admin decision surface", async ({ page, request }) => {
    const created = await createRefundRequest(request, `approve-fe ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await page.getByPlaceholder("Search refund or order...").fill(created.orderId);
    await page.waitForTimeout(500);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    await page.getByRole("button", { name: "Approve refund" }).click();
    await page.getByRole("button", { name: "Yes, Confirm" }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(created.orderId, { exact: false })).toBeHidden();
  });

  test("UC-REF-04 rejects a refund from the admin decision surface", async ({ page, request }) => {
    const created = await createRefundRequest(request, `reject-fe ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await page.getByPlaceholder("Search refund or order...").fill(created.orderId);
    await page.waitForTimeout(500);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    await page.getByRole("button", { name: "Reject request" }).click();
    await page.getByRole("button", { name: "Yes, Confirm" }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(created.orderId, { exact: false })).toBeHidden();
  });

  test("UC-REF-05 reviews a refund that is already decided", async ({ page, request }) => {
    const approvedPayload = await fetchRefunds(request, "approved");
    const approvedItems = Array.isArray(approvedPayload?.data) ? approvedPayload.data : [];
    expect(approvedItems.length).toBeGreaterThan(0);
    const approved = approvedItems[0];

    await page.getByPlaceholder("Search refund or order...").fill(String(approved.order_id));
    await page.waitForTimeout(500);

    await expect(page.getByText(String(approved.order_id), { exact: false })).toBeVisible();
    await expect(page.getByText(/approved/i)).toBeVisible();
    await expect(page.getByText(String(approved.admin_note), { exact: false })).toBeVisible();
  });
});
