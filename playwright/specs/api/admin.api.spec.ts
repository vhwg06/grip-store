import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

function extractList(payload: any, keys: string[] = ["items", "orders"]): any[] {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

test.describe("Admin API @api", () => {
  let client: GoBackendClient;
  const adminToken = process.env.ADMIN_USER_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  async function createAdminOrder() {
    test.skip(!userToken || !adminToken, "auth tokens not set");

    const createResponse = await client.post<any>(
      "/v1/checkout/orders",
      {
        productId: "b1111111-1111-1111-1111-111111111111",
        quantity: 1,
        email: process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
      },
      { headers: { Authorization: `Bearer ${userToken}` } },
    );

    expect(createResponse.status).toBe(201);
    expect(createResponse.data?.id).toBeTruthy();
    return String(createResponse.data.id);
  }

  async function createRefundableOrder() {
    const orderId = await createAdminOrder();

    const deliverResponse = await client.patch(
      `/v1/admin/orders/${orderId}`,
      { status: "delivered" },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    expect(deliverResponse.status).toBe(204);

    const refundResponse = await client.post<any>(
      `/v1/orders/${orderId}/refund-request`,
      { reason: `Playwright refund ${Date.now()}` },
      { headers: { Authorization: `Bearer ${userToken}` } },
    );

    expect(refundResponse.status).toBe(201);
    expect(refundResponse.data?.id).toBeTruthy();

    return {
      orderId,
      refundId: String(refundResponse.data.id),
    };
  }

  test.describe("Admin Products CRUD", () => {
    test("lists products with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/products", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const items = extractList(response.data, ["items", "data"]);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    test("returns 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/products", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });

    test("returns 401 without auth", async () => {
      const response = await client.get("/v1/admin/products");
      expect(response.status).toBe(401);
    });

    test("creates, updates, and deletes a product roundtrip", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const title = `Playwright Product ${Date.now()}`;

      const createResponse = await client.post<any>(
        "/v1/admin/products",
        {
          title,
          description: "Created by Playwright test",
          price: 99999,
          category_id: "a1111111-1111-1111-1111-111111111111",
          images: ["https://example.com/product.png"],
          is_active: true,
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(createResponse.status).toBe(201);
      expect(createResponse.data).toMatchObject({
        id: expect.any(String),
        title,
        category_id: "a1111111-1111-1111-1111-111111111111",
      });

      const productId = String(createResponse.data.id);

      const updateResponse = await client.patch<any>(
        `/v1/admin/products/${productId}`,
        {
          title: `${title} Updated`,
          price: 123456,
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toMatchObject({
        id: productId,
        title: `${title} Updated`,
        price: 123456,
      });

      const deleteResponse = await client.delete(`/v1/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(deleteResponse.status).toBe(204);
    });
  });

  test.describe("Admin Categories", () => {
    test("lists categories with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/categories", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    test("creates, updates, and deletes a category roundtrip", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const name = `Playwright Category ${Date.now()}`;

      const createResponse = await client.post<any>(
        "/v1/admin/categories",
        { name, is_active: true },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(createResponse.status).toBe(201);
      expect(createResponse.data).toMatchObject({
        id: expect.any(String),
        name,
      });

      const categoryId = String(createResponse.data.id);

      const updateResponse = await client.patch<any>(
        `/v1/admin/categories/${categoryId}`,
        { name: `${name} Updated` },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toMatchObject({
        id: categoryId,
        name: `${name} Updated`,
      });

      const deleteResponse = await client.delete(
        `/v1/admin/categories/${categoryId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(deleteResponse.status).toBe(204);
    });
  });

  test.describe("Admin Cards", () => {
    test("lists card inventory for a product", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/cards?productId=b2222222-2222-2222-2222-222222222222", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("returns 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/cards?productId=b2222222-2222-2222-2222-222222222222", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });

    test("creates and deletes a single card", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const cardKey = `PLAYWRIGHT-CARD-${Date.now()}`;

      const createResponse = await client.post<any>(
        "/v1/admin/cards",
        {
          productId: "b2222222-2222-2222-2222-222222222222",
          cardKey,
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(createResponse.status).toBe(201);
      expect(createResponse.data).toMatchObject({
        id: expect.any(Number),
        product_id: "b2222222-2222-2222-2222-222222222222",
        card_key: cardKey,
      });

      const deleteResponse = await client.delete(
        `/v1/admin/cards/${createResponse.data.id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(deleteResponse.status).toBe(204);
    });

    test("imports and replenishes card keys", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const importResponse = await client.post<any>(
        "/v1/admin/cards/import",
        {
          productId: "b2222222-2222-2222-2222-222222222222",
          keys: [`IMPORT-${Date.now()}-A`, `IMPORT-${Date.now()}-B`],
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(importResponse.status).toBe(200);
      expect(importResponse.data).toMatchObject({ imported: 2 });

      const replenishResponse = await client.post<any>(
        "/v1/admin/cards/replenish",
        {
          productId: "b2222222-2222-2222-2222-222222222222",
          keys: [`REPLENISH-${Date.now()}-A`, `REPLENISH-${Date.now()}-B`],
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(replenishResponse.status).toBe(200);
      expect(replenishResponse.data).toMatchObject({ imported: 2 });
    });
  });

  test.describe("Admin Orders and Refunds", () => {
    test("lists orders with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/orders", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const items = extractList(response.data, ["orders"]);
      expect(Array.isArray(items)).toBe(true);
      expect(response.data).toHaveProperty("page");
    });

    test("returns seeded admin order detail", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/orders/test-order-0001", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: "test-order-0001",
        orderNumber: "test-order-0001",
        status: "DELIVERED",
        items: expect.any(Array),
      });
    });

    test("updates order status and deletes an admin-created order", async () => {
      test.skip(!adminToken || !userToken, "auth tokens not set");

      const orderId = await createAdminOrder();

      const updateResponse = await client.patch(
        `/v1/admin/orders/${orderId}`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(updateResponse.status).toBe(204);

      const deleteResponse = await client.delete(`/v1/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(deleteResponse.status).toBe(204);
    });

    test("rejects malformed order update payload", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.patch(
        "/v1/admin/orders/test-order-0002",
        { status: "refunded" },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(400);
    });

    test("lists pending refunds", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/refunds?status=pending", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("approves and rejects fresh refund requests", async () => {
      test.skip(!adminToken || !userToken, "auth tokens not set");

      const firstRefund = await createRefundableOrder();
      const approveResponse = await client.post<any>(
        `/v1/admin/refunds/${firstRefund.refundId}/approve`,
        { note: "approved by playwright" },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.data).toMatchObject({
        id: Number(firstRefund.refundId),
        status: "approved",
      });

      const secondRefund = await createRefundableOrder();
      const rejectResponse = await client.post<any>(
        `/v1/admin/refunds/${secondRefund.refundId}/reject`,
        { note: "rejected by playwright" },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(rejectResponse.status).toBe(200);
      expect(rejectResponse.data).toMatchObject({
        id: Number(secondRefund.refundId),
        status: "rejected",
      });
    });

    test("rejects invalid refund id shape", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/refunds/not-a-number/approve",
        { note: "bad id" },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(400);
    });

    test("returns 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/orders", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });
  });
});
