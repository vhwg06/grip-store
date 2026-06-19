import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { EngagementApiHelper } from "../../src/api-helpers/engagement.api";

test.describe("Wishlist API @api", () => {
  let client: GoBackendClient;
  let engagementApi: EngagementApiHelper;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    engagementApi = new EngagementApiHelper(client);
  });

  test.describe("GET /v1/wishlist", () => {
    test("should return wishlist publicly", async () => {
      const response = await client.get("/v1/wishlist");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should return wishlist with auth too", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  test.describe("POST /v1/wishlist", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/wishlist", {
        product_id: "fake-product-id",
      });

      expect(response.status).toBe(401);
    });

    test("should return 404 for invalid product", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/wishlist",
        { product_id: "non-existent-product-12345" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect([404, 400]).toContain(response.status);
    });
  });

  test.describe("POST /v1/wishlist/:id/vote", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/wishlist/fake-id/vote");

      expect(response.status).toBe(401);
    });
  });

  test.describe("DELETE /v1/wishlist/:id", () => {
    test("should return 401 without auth", async () => {
      const response = await client.delete("/v1/wishlist/fake-id");

      expect(response.status).toBe(401);
    });
  });
});
