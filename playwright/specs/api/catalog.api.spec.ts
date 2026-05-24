import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Catalog API @api", () => {
  let client: GoBackendClient;
  let catalogApi: CatalogApiHelper;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    catalogApi = new CatalogApiHelper(client);
  });

  test.describe("GET /v1/catalog/products", () => {
    test("should return paginated product list", async () => {
      const response = await catalogApi.getProducts();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("items");
      expect(response.data).toHaveProperty("total");
      expect(response.data).toHaveProperty("page");
      expect(response.data).toHaveProperty("limit");
      expect(Array.isArray(response.data.items)).toBe(true);
    });

    test("should respect pagination params", async () => {
      const response = await catalogApi.getProducts({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.data.items.length).toBeLessThanOrEqual(5);
    });

    test("should filter by category", async () => {
      // First get categories to use a valid one
      const categoriesResp = await catalogApi.getCategories();
      test.skip(!categoriesResp.ok || !categoriesResp.data.length, "No categories available");

      const categorySlug = categoriesResp.data[0].slug;
      const response = await catalogApi.getProducts({ category: categorySlug });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.items)).toBe(true);
    });

    test("should sort products", async () => {
      const response = await catalogApi.getProducts({ sort: "price_asc" });

      expect(response.status).toBe(200);
      const prices = response.data.items.map((p) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });
  });

  test.describe("GET /v1/catalog/products/:id", () => {
    test("should return product detail", async () => {
      // Get a product ID first
      const list = await catalogApi.getProducts({ limit: 1 });
      test.skip(!list.ok || !list.data.items.length, "No products available");

      const productId = list.data.items[0].id;
      const response = await catalogApi.getProduct(productId);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id", productId);
      expect(response.data).toHaveProperty("title");
      expect(response.data).toHaveProperty("price");
      expect(response.data).toHaveProperty("description");
      expect(response.data).toHaveProperty("images");
    });

    test("should return 404 for non-existent product", async () => {
      const response = await catalogApi.getProduct("non-existent-id-12345");

      expect(response.status).toBe(404);
    });
  });

  test.describe("GET /v1/catalog/products/:id/buy-meta", () => {
    test("should return buy meta for product", async () => {
      const list = await catalogApi.getProducts({ limit: 1 });
      test.skip(!list.ok || !list.data.items.length, "No products available");

      const productId = list.data.items[0].id;
      const response = await catalogApi.getBuyMeta(productId);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("product_id");
      expect(response.data).toHaveProperty("available");
      expect(response.data).toHaveProperty("stock");
      expect(typeof response.data.available).toBe("boolean");
    });
  });

  test.describe("GET /v1/catalog/search", () => {
    test("should return search results", async () => {
      // Use a generic search term
      const response = await catalogApi.search("a");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should return empty array for non-matching query", async () => {
      const response = await catalogApi.search("zzzznonexistentproduct99999");

      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(0);
    });
  });

  test.describe("GET /v1/catalog/categories", () => {
    test("should return category list", async () => {
      const response = await catalogApi.getCategories();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty("id");
        expect(response.data[0]).toHaveProperty("name");
        expect(response.data[0]).toHaveProperty("slug");
      }
    });
  });

  test.describe("GET /v1/catalog/settings", () => {
    test("should return site settings", async () => {
      const response = await catalogApi.getSettings();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("site_name");
      expect(response.data).toHaveProperty("currency");
    });
  });

  test.describe("GET /v1/catalog/announcement", () => {
    test("should return announcement or null", async () => {
      const response = await catalogApi.getAnnouncement();

      expect(response.status).toBe(200);
      // Announcement can be null or an object
      if (response.data !== null) {
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("content");
        expect(response.data).toHaveProperty("active");
      }
    });
  });
});
