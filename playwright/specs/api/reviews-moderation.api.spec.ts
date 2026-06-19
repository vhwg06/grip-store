import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Admin Review Moderation API @api", () => {
  let client: GoBackendClient;
  const adminToken =
    process.env.ADMIN_USER_TOKEN ?? process.env.TEST_ADMIN_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  async function listPendingReviews() {
    return client.get<any>("/v1/admin/reviews?status=PENDING", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  test.describe("GET /v1/admin/reviews", () => {
    test("returns 401 without auth", async () => {
      const response = await client.get("/v1/admin/reviews");
      expect(response.status).toBe(401);
    });

    test("returns 403 for regular user", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");
      const response = await client.get("/v1/admin/reviews", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(403);
    });

    test("returns moderation queue and stats for admin", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const response = await listPendingReviews();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data?.reviews)).toBe(true);
      expect(response.data?.stats).toMatchObject({
        pending: expect.any(Number),
        featured: expect.any(Number),
        hidden: expect.any(Number),
      });
      expect(response.data).toHaveProperty("total");
    });
  });

  test.describe("PUT moderation routes", () => {
    test("approves seeded pending review with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const response = await client.put<any>(
        "/v1/admin/reviews/930001/approve",
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        status: "APPROVED",
      });
    });

    test("hides seeded review with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const response = await client.put<any>(
        "/v1/admin/reviews/930001/hide",
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        status: "HIDDEN",
      });
    });

    test("rejects invalid feature payload", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const response = await client.put(
        "/v1/admin/reviews/930001/feature",
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(400);
    });

    test("features seeded review with explicit boolean payload", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const response = await client.put<any>(
        "/v1/admin/reviews/930001/feature",
        { isFeatured: true },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        status: "FEATURED",
      });
    });
  });

  test.describe("POST /v1/admin/reviews/publish-selected", () => {
    test("publishes selected reviews in bulk with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const response = await client.post<any>(
        "/v1/admin/reviews/publish-selected",
        { ids: [930001] },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        count: 1,
      });
    });
  });

  test.describe("DELETE /v1/admin/reviews/:id", () => {
    test("returns 401 without auth", async () => {
      const response = await client.delete("/v1/admin/reviews/930001");
      expect(response.status).toBe(401);
    });

    test("returns 403 for regular user", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.delete("/v1/admin/reviews/930001", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });

    test("deletes an admin-created review with admin auth", async () => {
      test.skip(!adminToken || !userToken, "auth tokens not set");

      const createResponse = await client.post<any>(
        "/v1/products/b1111111-1111-1111-1111-111111111111/reviews",
        {
          orderId: "test-order-0001",
          rating: 4,
          comment: `Playwright moderation delete ${Date.now()}`,
        },
        { headers: { Authorization: `Bearer ${userToken}` } },
      );

      expect(createResponse.status).toBe(201);
      const reviewId = createResponse.data?.id;
      expect(typeof reviewId).toBe("number");

      const deleteResponse = await client.delete(
        `/v1/admin/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data).toMatchObject({ success: true });
    });
  });
});
