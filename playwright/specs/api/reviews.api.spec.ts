import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { EngagementApiHelper } from "../../src/api-helpers/engagement.api";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Reviews API @api", () => {
  let client: GoBackendClient;
  let engagementApi: EngagementApiHelper;
  let catalogApi: CatalogApiHelper;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    engagementApi = new EngagementApiHelper(client);
    catalogApi = new CatalogApiHelper(client);
  });

  test.describe("GET /v1/catalog/products/:id/reviews", () => {
    test("should return reviews list (public)", async () => {
      const products = await catalogApi.getProducts({ limit: 1 });
      test.skip(!products.ok || !products.data.items.length, "No products available");

      const productId = products.data.items[0].id;
      const response = await client.get<Array<{ id: string; rating: number; content: string }>>(
        `/v1/catalog/products/${productId}/reviews`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty("id");
        expect(response.data[0]).toHaveProperty("rating");
        expect(response.data[0]).toHaveProperty("content");
      }
    });
  });

  test.describe("POST /v1/reviews", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/reviews", {
        product_id: "fake-product",
        rating: 5,
        content: "Great product!",
      });

      expect(response.status).toBe(401);
    });

    test("should create review with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const products = await catalogApi.getProducts({ limit: 1 });
      test.skip(!products.ok || !products.data.items.length, "No products available");

      const productId = products.data.items[0].id;
      const response = await client.post(
        "/v1/reviews",
        {
          product_id: productId,
          rating: 4,
          content: `Playwright test review ${Date.now()}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Should succeed or conflict if already reviewed
      expect([200, 201, 409]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("rating", 4);
      }
    });
  });

  test.describe("Admin DELETE /v1/reviews/:id", () => {
    test("should return 403 without admin role", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      // Regular user token should get 403
      const response = await client.delete("/v1/reviews/fake-review-id", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([403, 404]).toContain(response.status);
    });

    test("should return 401 without auth", async () => {
      const response = await client.delete("/v1/reviews/fake-review-id");

      expect(response.status).toBe(401);
    });
  });
});
