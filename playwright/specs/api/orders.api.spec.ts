import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

test.describe("Orders API @api", () => {
  let client: GoBackendClient;
  const token = process.env.TEST_USER_TOKEN;
  const adminToken = process.env.ADMIN_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  async function createRefundableOrder() {
    test.skip(!token || !adminToken, "auth tokens not set");

    const createResponse = await client.post<any>(
      "/v1/checkout/orders",
      {
        productId: "b1111111-1111-1111-1111-111111111111",
        quantity: 1,
        email: process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    expect(createResponse.status).toBe(201);

    const orderId = String(createResponse.data.id);
    const deliverResponse = await client.patch(
      `/v1/admin/orders/${orderId}`,
      { status: "delivered" },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(deliverResponse.status).toBe(204);
    return orderId;
  }

  test.describe("GET /v1/orders", () => {
    test("returns buyer orders list with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const items = extractItems(response.data);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toMatchObject({
        id: expect.any(String),
        status: expect.any(String),
      });
    });

    test("supports pagination metadata", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/orders?page=1&limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("meta");
    });

    test("returns 401 without auth", async () => {
      const response = await client.get("/v1/orders");
      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/orders/:id", () => {
    test("returns delivered seeded order detail for owner", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/orders/test-order-0001", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: "test-order-0001",
        product_id: "b1111111-1111-1111-1111-111111111111",
      });
    });

    test("returns 401 without auth", async () => {
      const response = await client.get("/v1/orders/test-order-0001");
      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/orders/:id/refund-request", () => {
    test("creates refund request for delivered seeded order", async () => {
      test.skip(!token || !adminToken, "auth tokens not set");

      const orderId = await createRefundableOrder();

      const response = await client.post(
        `/v1/orders/${orderId}/refund-request`,
        { reason: `Playwright refund ${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({ order_id: orderId, status: "pending" });
    });

    test("rejects missing refund reason", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/orders/test-order-0001/refund-request",
        { reason: "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(400);
    });

    test("returns 401 without auth", async () => {
      const response = await client.post(
        "/v1/orders/test-order-0001/refund-request",
        { reason: "test refund" },
      );

      expect(response.status).toBe(401);
    });
  });
});
