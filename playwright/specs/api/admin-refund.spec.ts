import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

async function adminGet(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPost(request: any, path: string, data: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.post(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
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

test.describe("Admin Refund API @api", () => {
  test("UC-REF-01 rejects unauthenticated refund queue reads", async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/v1/admin/refunds?status=pending`);
    expect(response.status()).toBe(401);
  });

  test("UC-REF-01 rejects non-admin refund queue reads", async ({ request }) => {
    const token = await getUserToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/refunds?status=pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
  });

  test("UC-REF-01 reviews the pending refund queue", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/refunds?status=pending");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : [];
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item: any) => item.status === "pending")).toBeTruthy();
  });

  test("UC-REF-02 reads refund evidence before deciding", async ({ request }) => {
    const pending = await adminGet(request, "/v1/admin/refunds?status=pending");
    expect(pending.ok()).toBeTruthy();
    const pendingPayload = await pending.json();
    const firstPending = pendingPayload?.data?.[0];
    expect(firstPending?.id).toBeTruthy();

    const detail = await adminGet(request, `/v1/admin/refunds/${firstPending.id}`);
    expect(detail.ok()).toBeTruthy();
  });

  test("UC-REF-03 approves a refund and updates linked order context", async ({ request }) => {
    const created = await createRefundRequest(request, `pw approve ${Date.now()}`);

    const approve = await adminPost(request, `/v1/admin/refunds/${created.refundId}/approve`, {
      note: "approved by playwright",
    });
    expect(approve.ok()).toBeTruthy();

    const approvePayload = await approve.json();
    const data = approvePayload?.data ?? approvePayload;
    expect(data).toMatchObject({
      id: created.refundId,
      status: "approved",
      admin_note: "approved by playwright",
    });

    const order = await adminGet(request, `/v1/admin/orders/${created.orderId}`);
    expect(order.ok()).toBeTruthy();
    const orderPayload = await order.json();
    expect(orderPayload.status).toBe("REFUNDED");
    expect(orderPayload.timeline?.[0]?.status).toBe("REFUNDED");
  });

  test("UC-REF-04 rejects a refund and records decision context", async ({ request }) => {
    const created = await createRefundRequest(request, `pw reject ${Date.now()}`);

    const reject = await adminPost(request, `/v1/admin/refunds/${created.refundId}/reject`, {
      note: "rejected by playwright",
    });
    expect(reject.ok()).toBeTruthy();

    const rejectPayload = await reject.json();
    const data = rejectPayload?.data ?? rejectPayload;
    expect(data).toMatchObject({
      id: created.refundId,
      status: "rejected",
      admin_note: "rejected by playwright",
    });

    const pending = await adminGet(request, "/v1/admin/refunds?status=pending");
    expect(pending.ok()).toBeTruthy();
    const pendingPayload = await pending.json();
    const items = Array.isArray(pendingPayload?.data) ? pendingPayload.data : [];
    expect(items.some((item: any) => item.id === created.refundId)).toBeFalsy();
  });

  test("UC-REF-05 reviews an already-decided refund as historical evidence", async ({ request }) => {
    const approved = await adminGet(request, "/v1/admin/refunds?status=approved");
    expect(approved.ok()).toBeTruthy();

    const payload = await approved.json();
    const items = Array.isArray(payload?.data) ? payload.data : [];
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toMatchObject({
      status: "approved",
      admin_note: expect.any(String),
      order_status: expect.any(String),
    });
  });

  test("UC-REF-03 duplicate approve is idempotent", async ({ request }) => {
    // INVARIANT: duplicate approve phải trả 409/422 — không được âm thầm accept
    const created = await createRefundRequest(request, `pw idempotent ${Date.now()}`);

    const first = await adminPost(request, `/v1/admin/refunds/${created.refundId}/approve`, {
      note: "first approval",
    });
    expect(first.ok()).toBeTruthy();

    const second = await adminPost(request, `/v1/admin/refunds/${created.refundId}/approve`, {
      note: "second approval",
    });
    expect([409, 422]).toContain(second.status());
  });
});
