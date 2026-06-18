import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Store Settings API Contract @api", () => {
  test.fixme(true, "Spec 005 defines desired structured Store Settings API; backend contract not implemented yet.");

  let client: GoBackendClient;
  const adminToken = process.env.ADMIN_USER_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  test("reads structured store settings payload for admin", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.get("/v1/admin/store-settings", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      config: {
        brand: expect.any(Object),
        contact: expect.any(Object),
        homepage: expect.any(Object),
        footer: expect.any(Object),
        floatingSupport: expect.any(Array),
        visibility: expect.any(Object),
        registry: expect.any(Object),
      },
      stats: expect.any(Object),
      visitorCount: expect.any(Number),
    });
  });

  test("rejects admin store settings read without auth", async () => {
    const response = await client.get("/v1/admin/store-settings");
    expect(response.status).toBe(401);
  });

  test("rejects admin store settings read without admin role", async () => {
    test.skip(!userToken, "TEST_USER_TOKEN not set");

    const response = await client.get("/v1/admin/store-settings", {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(response.status).toBe(403);
  });

  test("updates brand section with validated payload", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/brand",
      {
        shopName: "Grip QA Store",
        shopDescription: "Premium hardware QA copy",
        shopLogo: "https://cdn.example.com/logo.webp",
        themeColor: "amber",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(response.status).toBe(200);
  });

  test("rejects invalid homepage configuration payload", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/homepage",
      {
        blocks: [
          { key: "hero", enabled: true, order: 1 },
          { key: "hero", enabled: true, order: 2 },
        ],
        newsCount: -1,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(response.status).toBe(422);
  });

  test("updates footer and social settings with nested structured payload", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/footer",
      {
        columns: [
          {
            id: "products",
            title: "Products",
            links: [{ label: "Door Handles", url: "/products" }],
          },
        ],
        copyright: "Copyright 2026 Grip.vn",
        socialLinks: {
          facebook: "https://facebook.com/gripvn",
          zalo: "https://zalo.me/gripvn",
        },
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(response.status).toBe(200);
  });

  test("updates floating support actions with per-channel validation", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/floating-support",
      {
        actions: [
          { key: "zalo", enabled: true, target: "https://zalo.me/gripvn" },
          { key: "hotline", enabled: true, target: "+84 903 117 742" },
          { key: "scroll_to_top", enabled: true, target: null },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(response.status).toBe(200);
  });

  test("rejects malformed social link or floating target", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/floating-support",
      {
        actions: [
          { key: "zalo", enabled: true, target: "not-a-url" },
          { key: "scroll_to_top", enabled: true, target: "unexpected" },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(response.status).toBe(422);
  });
});
