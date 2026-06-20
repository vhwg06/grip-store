import { test, expect } from "../../src/fixtures/base-test";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";

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

async function adminGet(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

test.describe("Admin Payment API @api", () => {
  test("UC-PAY-01 reads payment info in order context even when payment detail is partial", async ({ request }) => {
    const paidOrder = await adminGet(request, "/v1/admin/orders/test-order-0001");
    expect(paidOrder.ok()).toBeTruthy();
    const paidPayload = await paidOrder.json();
    expect(paidPayload).toMatchObject({
      id: "test-order-0001",
      orderNumber: "test-order-0001",
      status: expect.any(String),
      paymentMethod: expect.any(String),
      tradeNo: expect.any(String),
    });
    expect(Array.isArray(paidPayload.timeline)).toBeTruthy();
    expect(paidPayload.tradeNo).toBeTruthy();

    const partialOrder = await adminGet(request, "/v1/admin/orders/test-order-0002");
    expect(partialOrder.ok()).toBeTruthy();
    const partialPayload = await partialOrder.json();
    expect(partialPayload).toMatchObject({
      id: "test-order-0002",
      orderNumber: "test-order-0002",
      status: expect.any(String),
      paymentMethod: expect.any(String),
      tradeNo: expect.any(String),
    });
    expect(partialPayload.paymentMethod).toBe("");
    expect(partialPayload.tradeNo).toBe("");
  });

  test("UC-PAY-02 reads payment context needed to interpret a refund request", async ({ request }) => {
    const pending = await adminGet(request, "/v1/admin/refunds?status=pending");
    expect(pending.ok()).toBeTruthy();
    const pendingPayload = await pending.json();
    const firstPending = pendingPayload?.data?.[0];
    expect(firstPending?.id).toBeTruthy();

    const detail = await adminGet(request, `/v1/admin/refunds/${firstPending.id}`);
    expect(detail.ok()).toBeTruthy();

    const detailPayload = await detail.json();
    expect(detailPayload).toMatchObject({
      id: firstPending.id,
      order_id: expect.any(String),
      amount: expect.any(Number),
    });
    expect(detailPayload.trade_no || detailPayload.tradeNo).toBeTruthy();
  });

  test("UC-PAY-03 keeps payment context informational instead of exposing execution controls", async ({ request }) => {
    const order = await adminGet(request, "/v1/admin/orders/test-order-0001");
    expect(order.ok()).toBeTruthy();
    const orderPayload = await order.json();

    expect(orderPayload.paymentUrl ?? null).toBeNull();
    expect(orderPayload.paymentParams ?? null).toBeNull();
    expect(orderPayload.callbackUrl ?? null).toBeNull();
    expect(orderPayload.retryToken ?? null).toBeNull();
  });
});
