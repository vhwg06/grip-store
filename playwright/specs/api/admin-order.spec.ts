import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken, registerFreshBuyer } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

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

test.describe("Admin Order API @api P1 P2", () => {
  test("UC-ORD-01 rejects unauthenticated admin order reads", async ({ request }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Exception flow
    const response = await request.get(`${BACKEND_URL}/v1/admin/orders?page=1&pageSize=20`);
    expect(response.status()).toBe(401);
  });

  test("UC-ORD-01 rejects non-admin order reads", async ({ request }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Exception flow
    const token = await getUserToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/orders?page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
  });

  test("UC-ORD-03 rejects invalid transition PENDING to DELIVERED", async ({ request }) => {
    // GOAL: Admin Performs An Allowed Order Transition: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
    // PRIORITY: P1
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-03 Exception flow
    // INVARIANT: PENDING → DELIVERED bị cấm vì vi phạm order lifecycle rules
    // Expected: 400/409/422, không phải 204
    test.fail(true, "blocked-be-gap: backend accepts PENDING -> DELIVERED transition shortcut");
    const orderId = await createPendingOrder(request);

    const invalidTransition = await adminPatch(request, `/v1/admin/orders/${orderId}`, {
      status: "delivered",
    });
    expect([400, 409, 422]).toContain(invalidTransition.status());
  });

  test("UC-ORD-04 resolves customer-linked purchase history from the customer commerce identifier", async ({ request }) => {
    // GOAL: Admin Reads Purchase History For A Customer: hiểu lịch sử mua hàng của một customer để hỗ trợ xử lý order hiện tại hoặc ra quyết định hỗ trợ.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-04 Main flow
    test.fail(true, "blocked-be-gap: customer-linked order history does not resolve from customer ID");
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
    // GOAL: Admin Verifies Refund Relevance On An Order: biết order có đang hoặc đã đi qua refund flow hay không trước khi tiếp tục xử lý order.
    // PRIORITY: P2
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-05 Main flow
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders endpoint returns 500");
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
    // GOAL: Admin Reads An Order Even When Operational Data Is Incomplete: vẫn hiểu được order enough to act safely khi một phần dữ liệu phụ trợ không đầy đủ.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-ORD-06 Main flow
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

  test("UC-ORD-03 preserves ordered timeline entries after a valid transition", async ({ request }) => {
    // GOAL: Admin Performs An Allowed Order Transition: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
    // PRIORITY: P1
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-03 Main flow
    // INVARIANT: timeline phải ordered theo chronological progression
    // INVARIANT: PENDING xuất hiện trước PAID — bất kỳ order nào cũng phải bắt đầu từ PENDING
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders endpoint returns 500");
    const orderId = await createPendingOrder(request);

    const paid = await adminPatch(request, `/v1/admin/orders/${orderId}`, {
      status: "paid",
    });
    expect(paid.status()).toBe(204);

    const detail = await adminGet(request, `/v1/admin/orders/${orderId}`);
    expect(detail.ok()).toBeTruthy();
    const payload = await detail.json();
    expect(payload.timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: "PENDING" }),
        expect.objectContaining({ status: "PAID" }),
      ]),
    );
    expect(payload.timeline[0].status).toBe("PENDING");
    expect(payload.timeline[1].status).toBe("PAID");
  });

  test("UC-ORD-01 exception: returns 404 for nonexistent order ID", async ({ request }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Exception flow
    // INVARIANT (from SC-ORD-01): order id không còn hợp lệ khi admin mở detail phải trả 404
    const response = await adminGet(request, "/v1/admin/orders/nonexistent-order-99999");
    expect(response.status()).toBe(404);
  });

  test("UC-ORD-04 alternate: empty purchase history is a valid resolved state", async ({ request }) => {
    // GOAL: Admin Reads Purchase History For A Customer: hiểu lịch sử mua hàng của một customer để hỗ trợ xử lý order hiện tại hoặc ra quyết định hỗ trợ.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-04 Alternate flow
    // INVARIANT (from SC-ORD-04): absence of history vẫn là kết quả hợp lệ
    // INVARIANT: purchase history là read behavior hỗ trợ decision-making
    const { username } = await registerFreshBuyer(request);
    const response = await adminGet(request, `/v1/admin/orders?q=${username}&page=1&pageSize=20`);
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    const orders = extractOrders(payload);
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toBe(0);
  });
});
