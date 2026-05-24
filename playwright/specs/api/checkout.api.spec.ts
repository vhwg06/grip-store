import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CheckoutApiHelper } from "../../src/api-helpers/checkout.api";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

test.describe("Checkout API @api", () => {
  let client: GoBackendClient;
  let checkoutApi: CheckoutApiHelper;
  let catalogApi: CatalogApiHelper;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    checkoutApi = new CheckoutApiHelper(client);
    catalogApi = new CatalogApiHelper(client);
  });

  test.describe("POST /v1/checkout/orders", () => {
    test("should create order with valid data", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      // Get a product to order
      const products = await catalogApi.getProducts({ limit: 1 });
      test.skip(!products.ok || !products.data.items.length, "No products available");

      const product = products.data.items[0];
      const authedClient = new GoBackendClient(
        (await test.info().project.use).request!
      );
      // Use client with auth header
      const response = await client.post(
        "/v1/checkout/orders",
        { items: [{ product_id: product.id, quantity: 1, price: product.price }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("status");
      expect(response.data).toHaveProperty("total");
    });

    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/checkout/orders", {
        items: [{ product_id: "test", quantity: 1, price: 100 }],
      });

      expect(response.status).toBe(401);
    });

    test("should return 400 with invalid data", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/checkout/orders",
        { items: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect([400, 422]).toContain(response.status);
    });
  });

  test.describe("POST /v1/checkout/payment-orders", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/checkout/payment-orders", {
        order_id: "fake-order-id",
      });

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/checkout/orders/:id/payment-params", () => {
    test("should return 401 without auth", async () => {
      const response = await client.get(
        "/v1/checkout/orders/fake-order-id/payment-params"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/checkout/orders/:id/status", () => {
    test("should return 401 without auth", async () => {
      const response = await client.get(
        "/v1/checkout/orders/fake-order-id/status"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/checkout/orders/:id/cancel", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/checkout/orders/fake-order-id/cancel"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/checkout/preview", () => {
    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/checkout/preview");

      expect(response.status).toBe(401);
    });
  });
});
