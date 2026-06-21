import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

type ApiRequest = any;

async function adminGet(request: ApiRequest, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPatch(request: ApiRequest, path: string, data: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.patch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

async function createPendingOrder(request: ApiRequest) {
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
  const order = payload?.data ?? payload;
  expect(order?.id).toBeTruthy();
  expect(order?.status).toBe("pending");
  return String(order.id);
}

function extractOrders(payload: any) {
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

test.describe("Admin Orders API @api P1", () => {
  test("UC-ORD-01 reviews the order queue as a server-owned projection", async ({ request }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Main flow
    const response = await adminGet(request, "/v1/admin/orders?page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const orders = extractOrders(payload);
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toBeGreaterThan(0);
    expect(payload.page).toBe(1);
    expect(payload.pageSize).toBe(20);

    const deliveredOrCancelled = orders.find((order: any) =>
      ["delivered", "cancelled"].includes(String(order.status)),
    );
    expect(deliveredOrCancelled).toBeTruthy();
    expect(deliveredOrCancelled).toMatchObject({
      orderId: expect.any(String),
      productName: expect.any(String),
      status: expect.any(String),
    });
  });

  test("UC-ORD-02 returns order detail context before any action is taken", async ({ request }) => {
    // GOAL: Admin Examines Order Detail Before Acting: đọc đầy đủ ngữ cảnh của một order trước khi ra quyết định vận hành.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-02 Main flow
    const response = await adminGet(request, "/v1/admin/orders/test-order-0001");
    expect(response.ok()).toBeTruthy();

    const order = await response.json();
    expect(order).toMatchObject({
      id: "test-order-0001",
      orderNumber: "test-order-0001",
      status: "DELIVERED",
      customerEmail: "test_buyer@example.com",
    });
    expect(Array.isArray(order.items)).toBeTruthy();
    expect(order.items[0]).toMatchObject({
      productName: expect.any(String),
      quantity: 1,
    });
    expect(Array.isArray(order.timeline)).toBeTruthy();
    expect(order.timeline[2]).toMatchObject({
      status: "DELIVERED",
      timestamp: expect.any(String),
    });
    expect(order).toHaveProperty("paymentMethod");
    expect(order).toHaveProperty("shippingAddress");
  });

  test("UC-ORD-03 performs an allowed pending-to-paid transition", async ({ request }) => {
    // GOAL: Admin Performs An Allowed Order Transition: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
    // PRIORITY: P1
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-03 Main flow
    const orderId = await createPendingOrder(request);

    const transition = await adminPatch(request, `/v1/admin/orders/${orderId}`, {
      status: "paid",
    });
    expect(transition.status()).toBe(204);

    const detail = await adminGet(request, `/v1/admin/orders/${orderId}`);
    expect(detail.ok()).toBeTruthy();
    const payload = await detail.json();
    expect(payload.status).toBe("PAID");
    expect(payload.paidAt).toBeTruthy();
    expect(Array.isArray(payload.timeline)).toBeTruthy();
    expect(payload.timeline[1]?.status).toBe("PAID");
  });

  test("UC-ORD-03 rejects a pending-to-delivered shortcut", async ({ request }) => {
    // GOAL: Admin Performs An Allowed Order Transition: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
    // PRIORITY: P1
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-03 Exception flow
    const orderId = await createPendingOrder(request);

    const transition = await adminPatch(request, `/v1/admin/orders/${orderId}`, {
      status: "delivered",
    });
    expect(transition.status()).toBe(409);
  });
});
