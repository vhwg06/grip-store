import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { OrdersApiHelper } from "../../src/api-helpers/orders.api";

test.describe("Orders API @api", () => {
  let client: GoBackendClient;
  let ordersApi: OrdersApiHelper;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    ordersApi = new OrdersApiHelper(client);
  });

  test.describe("GET /v1/orders (list)", () => {
    test("should return orders list with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ items?: unknown[] } | unknown[]>("/v1/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      if (Array.isArray(response.data)) {
        expect(Array.isArray(response.data)).toBe(true);
      } else {
        expect(response.data).toHaveProperty("items");
        expect(Array.isArray((response.data as any).items)).toBe(true);
      }
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/orders");

      expect(response.status).toBe(401);
    });

    test("should support pagination", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/orders?page=1&limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      if (!Array.isArray(response.data)) {
        expect(response.data).toHaveProperty("page");
      }
    });
  });

  test.describe("GET /v1/orders/:id/status", () => {
    test("should return 401 without auth", async () => {
      const response = await client.get(
        "/v1/orders/fake-order-id/status"
      );

      expect(response.status).toBe(401);
    });

    test("should return 404 for non-existent order", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get(
        "/v1/orders/non-existent-order-12345/status",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect([404, 400]).toContain(response.status);
    });
  });

  test.describe("POST /v1/orders/:id/cancel", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/orders/fake-order-id/cancel"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/orders/:id/refund-request", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/orders/fake-order-id/refund-request",
        { reason: "test refund" }
      );

      expect(response.status).toBe(401);
    });
  });
});
