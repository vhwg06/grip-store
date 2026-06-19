import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Admin Review Moderation API @api", () => {
  let client: GoBackendClient;
  const adminToken =
    process.env.ADMIN_USER_TOKEN ?? process.env.TEST_ADMIN_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN; // Regular user token

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  test.describe("GET /v1/admin/reviews", () => {
    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/admin/reviews");
      expect(response.status).toBe(401);
    });

    test("should return 403 for regular user", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");
      const response = await client.get("/v1/admin/reviews", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(403);
    });

    test("should return reviews queue and stats for admin", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");
      const response = await client.get<any>("/v1/admin/reviews", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data?.reviews)).toBe(true);
      expect(response.data?.stats).toHaveProperty("pending");
      expect(response.data?.stats).toHaveProperty("featured");
      expect(response.data?.stats).toHaveProperty("hidden");
    });
  });

  test.describe("PUT /v1/admin/reviews/:id/approve", () => {
    test("should return 401 without auth", async () => {
      const response = await client.put("/v1/admin/reviews/101/approve", {});
      expect(response.status).toBe(401);
    });

    test("should return 403 for regular user", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");
      const response = await client.put(
        "/v1/admin/reviews/101/approve",
        {},
        {
          headers: { Authorization: `Bearer ${userToken}` },
        },
      );
      expect(response.status).toBe(403);
    });

    test("should approve review with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      // Let's get list first to find a pending review
      const getResponse = await client.get<any>(
        "/v1/admin/reviews?status=PENDING",
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      const pendingReviews = getResponse.data?.reviews || [];
      test.skip(pendingReviews.length === 0, "No pending reviews to test");

      const reviewId = pendingReviews[0].id;
      const response = await client.put<any>(
        `/v1/admin/reviews/${reviewId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      expect(response.status).toBe(200);
      expect(response.data?.success).toBe(true);
      expect(response.data?.status).toBe("APPROVED");
    });
  });

  test.describe("PUT /v1/admin/reviews/:id/hide", () => {
    test("should hide review with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const getResponse = await client.get<any>("/v1/admin/reviews", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const reviews = getResponse.data?.reviews || [];
      test.skip(reviews.length === 0, "No reviews to test");

      const reviewId = reviews[0].id;
      const response = await client.put<any>(
        `/v1/admin/reviews/${reviewId}/hide`,
        {},
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      expect(response.status).toBe(200);
      expect(response.data?.success).toBe(true);
      expect(response.data?.status).toBe("HIDDEN");
    });
  });

  test.describe("PUT /v1/admin/reviews/:id/feature", () => {
    test("should toggle feature state with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const getResponse = await client.get<any>("/v1/admin/reviews", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const reviews = getResponse.data?.reviews || [];
      test.skip(reviews.length === 0, "No reviews to test");

      const reviewId = reviews[0].id;
      const response = await client.put<any>(
        `/v1/admin/reviews/${reviewId}/feature`,
        {
          isFeatured: true,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      expect(response.status).toBe(200);
      expect(response.data?.success).toBe(true);
      expect(response.data?.status).toBe("FEATURED");
    });
  });

  test.describe("POST /v1/admin/reviews/publish-selected", () => {
    test("should publish selected reviews in bulk with admin auth", async () => {
      test.skip(!adminToken, "TEST_ADMIN_TOKEN not set");

      const getResponse = await client.get<any>(
        "/v1/admin/reviews?status=PENDING",
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      const pendingReviews = getResponse.data?.reviews || [];
      test.skip(
        pendingReviews.length < 2,
        "Need at least 2 pending reviews for bulk test",
      );

      const ids = [pendingReviews[0].id, pendingReviews[1].id];
      const response = await client.post<any>(
        "/v1/admin/reviews/publish-selected",
        {
          ids,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      expect(response.status).toBe(200);
      expect(response.data?.success).toBe(true);
      expect(response.data?.count).toBe(2);
    });
  });

  test.describe("DELETE /v1/admin/reviews/:id", () => {
    test("should return 401 without auth", async () => {
      const response = await client.delete("/v1/admin/reviews/101");
      expect(response.status).toBe(401);
    });
  });
});
