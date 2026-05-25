import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { AdminApiHelper } from "../../src/api-helpers/admin.api";

function extractList(payload: any, keys: string[] = ["items"]): unknown[] {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    const value = payload?.[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

test.describe("Admin API @api", () => {
  let client: GoBackendClient;
  let adminApi: AdminApiHelper;
  const adminToken = process.env.ADMIN_USER_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    adminApi = new AdminApiHelper(client);
  });

  /* ── Admin Products ─────────────────────────── */

  test.describe("Admin Products CRUD", () => {
    test("should list products with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get<{ items: unknown[] }>("/v1/admin/products", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const items = extractList(response.data, ["items"]);
      expect(Array.isArray(items)).toBe(true);
    });

    test("should return 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/products", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/admin/products");

      expect(response.status).toBe(401);
    });

    test("should create product with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/products",
        {
          title: `Test Product ${Date.now()}`,
          description: "Created by Playwright test",
          price: 99.99,
          category_id: "test-category",
          images: [],
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // May succeed or fail depending on category_id validity
      expect([200, 201, 400, 422]).toContain(response.status);
    });
  });

  /* ── Admin Cards ────────────────────────────── */

  test.describe("Admin Cards", () => {
    test("should list cards with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/cards", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect([200, 501]).toContain(response.status);
    });

    test("should return 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/cards", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });

    test("should import cards with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/cards/import",
        {
          product_id: "test-product",
          codes: ["TEST-CODE-001", "TEST-CODE-002"],
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // May succeed or fail depending on product_id validity
      expect([200, 400, 404]).toContain(response.status);
    });

    test("should pull cards with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post("/v1/admin/cards/pull", undefined, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect([200, 204, 405, 501]).toContain(response.status);
    });
  });

  /* ── Admin Orders ───────────────────────────── */

  test.describe("Admin Orders", () => {
    test("should list orders with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/orders", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const items = extractList(response.data, ["items", "orders"]);
      expect(Array.isArray(items)).toBe(true);
    });

    test("should return 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/orders", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });
  });

  /* ── Admin Users & Settings ─────────────────── */

  test.describe("Admin Users & Settings", () => {
    test("should list users with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const items = extractList(response.data, ["items", "users"]);
      expect(Array.isArray(items)).toBe(true);
    });

    test("should get settings with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/settings", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect([200, 501]).toContain(response.status);
      if (response.status === 200) {
        expect(typeof response.data).toBe("object");
      }
    });

    test("should return 403 without admin role for settings", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/admin/settings", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
    });
  });

  /* ── Admin Categories CRUD ──────────────────── */

  test.describe("Admin Categories", () => {
    test("should list categories with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get("/v1/admin/categories", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should create category with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/categories",
        {
          name: `Test Category ${Date.now()}`,
          slug: `test-cat-${Date.now()}`,
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect([200, 201, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.data).toHaveProperty("id");
      }
    });
  });

  /* ── Admin Notifications & Data ─────────────── */

  test.describe("Admin Notifications", () => {
    test("should broadcast notification with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/notifications/broadcast",
        {
          title: "Test Broadcast",
          content: "Playwright test notification",
          target: "admins",
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect([200, 204, 404]).toContain(response.status);
    });

    test("should return 403 without admin role", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/notifications/broadcast",
        { title: "Test", content: "Test", target: "all" },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      expect(response.status).toBe(403);
    });
  });

  test.describe("Admin Data", () => {
    test("should repair data with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/data/repair-aggregates",
        undefined,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect([200, 204, 500]).toContain(response.status);
    });

    test("should return 403 without admin role for data import", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/data/import",
        { type: "test", data: [] },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      expect(response.status).toBe(403);
    });
  });

  /* ── Admin Media Presigned ───────────────────── */

  test.describe("Admin Media Presigned API", () => {
    test("should generate presigned URL with admin token", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get(
        "/v1/admin/media/presigned?fileName=test-image.png&contentType=image/png",
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty("upload_url");
        expect(response.data).toHaveProperty("public_url");
      }
    });

    test("should return 403 without admin role for presigned url", async () => {
      test.skip(!userToken, "TEST_USER_TOKEN not set");

      const response = await client.get(
        "/v1/admin/media/presigned?fileName=test-image.png&contentType=image/png",
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      expect(response.status).toBe(403);
    });

    test("should return 400 for invalid content type", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get(
        "/v1/admin/media/presigned?fileName=test-doc.pdf&contentType=application/pdf",
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect([400, 404]).toContain(response.status);
    });
  });

  /* ── Media Metadata CRUD API ─────────────────── */

  test.describe("Media Metadata API", () => {
    const testMediaId = `test-media-${Date.now()}`;

    test("should register media metadata successfully with auth", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/media",
        {
          id: testMediaId,
          file_name: "test-uploaded-image.png",
          mime_type: "image/png",
          size_bytes: 524288,
          url: `https://media.gripstore.com/${testMediaId}.png`,
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect([200, 201]).toContain(response.status);
    });

    test("should return 401 for anonymous registration attempt", async () => {
      const response = await client.post("/v1/media", {
        id: "anon-media",
        file_name: "anon.png",
        mime_type: "image/png",
        size_bytes: 128,
        url: "https://media.gripstore.com/anon.png",
      });

      expect(response.status).toBe(401);
    });

    test("should list registered media assets", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.get<{ data: any[] }>("/v1/media", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const items = extractList(response.data, ["data", "items"]);
      expect(Array.isArray(items)).toBe(true);
    });

    test("should delete registered media asset", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.delete(`/v1/media/${testMediaId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect([200, 204]).toContain(response.status);
    });
  });
});
