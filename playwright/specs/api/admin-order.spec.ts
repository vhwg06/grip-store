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

async function adminGet(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPatch(request: any, path: string, data: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.patch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

async function createPendingOrder(request: any) {
  const userToken = await getUserToken(request);
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
  return String((payload?.data ?? payload).id);
}

async function createRefundRelevantOrder(request: any) {
  const adminToken = await getAdminToken(request);
  const userToken = await getUserToken(request);
  const orderId = await createPendingOrder(request);

  const paid = await request.patch(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: "paid" },
  });
  expect(paid.status()).toBe(204);

  const delivered = await request.patch(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: "delivered" },
  });
  expect(delivered.status()).toBe(204);

  const refund = await request.post(`${BACKEND_URL}/v1/orders/${orderId}/refund-request`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: { reason: `Playwright refund relevance ${Date.now()}` },
  });
  expect(refund.status()).toBe(201);

  return orderId;
}

function extractOrders(payload: any) {
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

test.describe("Admin Order API @api", () => {
  test("UC-ORD-04 resolves customer-linked purchase history from the customer commerce identifier", async ({ request }) => {
    const adminToken = await getAdminToken(request);

    const usersResponse = await request.get(`${BACKEND_URL}/v1/admin/users?page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(usersResponse.ok()).toBeTruthy();
    const usersPayload = await usersResponse.json();
    const users = Array.isArray(usersPayload?.data) ? usersPayload.data : [];
    const buyer = users.find((user: any) => user.username === "test_buyer");
    expect(buyer).toBeTruthy();

    const usernameQuery = await request.get(`${BACKEND_URL}/v1/admin/orders?q=test_buyer&page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(usernameQuery.ok()).toBeTruthy();
    const usernamePayload = await usernameQuery.json();
    expect(extractOrders(usernamePayload).length).toBeGreaterThan(0);

    const idQuery = await request.get(`${BACKEND_URL}/v1/admin/orders?q=${buyer.id}&page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(idQuery.ok()).toBeTruthy();
    const idPayload = await idQuery.json();
    expect(extractOrders(idPayload).length).toBeGreaterThan(0);
  });

  test("UC-ORD-05 exposes refund relevance in order context", async ({ request }) => {
    const orderId = await createRefundRelevantOrder(request);

    const refunds = await adminGet(request, `/v1/admin/refunds?status=pending`);
    expect(refunds.ok()).toBeTruthy();
    const refundsPayload = await refunds.json();
    const requests = Array.isArray(refundsPayload?.data) ? refundsPayload.data : [];
    expect(requests.some((item: any) => item.order_id === orderId && item.status === "pending")).toBeTruthy();

    const refundSignal = await adminGet(request, `/v1/admin/orders/${orderId}/refund-status`);
    expect(refundSignal.ok()).toBeTruthy();
  });

  test("UC-ORD-06 keeps order detail readable when optional context is incomplete", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/orders/test-order-0002");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    expect(payload).toMatchObject({
      id: "test-order-0002",
      orderNumber: "test-order-0002",
      status: "CANCELLED",
      customerEmail: "test_buyer@example.com",
    });
    expect(Array.isArray(payload.items)).toBeTruthy();
    expect(payload.items[0]).toMatchObject({
      productName: expect.any(String),
      quantity: 1,
    });
    expect(payload.customerPhone).toBe("");
    expect(payload.shippingAddress).toBe("");
    expect(payload.paymentMethod).toBe("");
    expect(Array.isArray(payload.timeline)).toBeTruthy();
    expect(payload.timeline[0]).toMatchObject({
      status: "CANCELLED",
      timestamp: expect.any(String),
    });
  });
});
