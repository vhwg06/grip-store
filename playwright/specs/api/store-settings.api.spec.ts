import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Store Settings API Contract @api", () => {
  let client: GoBackendClient;
  const adminToken = process.env.ADMIN_USER_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  async function getAdminSettings() {
    return client.get("/v1/admin/store-settings", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  async function getSiteConfig() {
    return client.get("/v1/site-config");
  }

  async function getCatalogSettings() {
    return client.get("/v1/catalog/settings");
  }

  test("reads structured store settings payload for admin", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await getAdminSettings();

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

  test("reads public projections from the same source of truth", async () => {
    const [siteConfigResponse, catalogSettingsResponse] = await Promise.all([
      getSiteConfig(),
      getCatalogSettings(),
    ]);

    expect(siteConfigResponse.status).toBe(200);
    expect(siteConfigResponse.data).toMatchObject({
      brand: expect.any(Object),
      contact: expect.any(Object),
      homepage: expect.any(Object),
      footer: expect.any(Object),
      floatingSupport: expect.any(Array),
      visibility: expect.any(Object),
      registry: expect.any(Object),
    });

    expect(catalogSettingsResponse.status).toBe(200);
    expect(catalogSettingsResponse.data).toMatchObject({
      shopName: expect.any(String),
      shopDescription: expect.any(String),
      themeColor: expect.any(String),
      wishlistEnabled: expect.any(Boolean),
      checkinEnabled: expect.any(Boolean),
      checkinReward: expect.any(Number),
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

  test("updates brand section and reflects through public catalog settings", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const payload = {
      shopName: "Grip QA Store",
      shopDescription: "Premium hardware QA copy",
      shopLogo: "https://cdn.example.com/logo.webp",
      themeColor: "amber",
    };

    const updateResponse = await client.put(
      "/v1/admin/store-settings/brand",
      payload,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(updateResponse.status).toBe(200);

    const [adminSettingsResponse, catalogSettingsResponse] = await Promise.all([
      getAdminSettings(),
      getCatalogSettings(),
    ]);

    expect(adminSettingsResponse.data).toMatchObject({
      config: { brand: payload },
    });
    expect(catalogSettingsResponse.data).toMatchObject({
      shopName: payload.shopName,
      shopDescription: payload.shopDescription,
      themeColor: payload.themeColor,
    });
  });

  test("updates contact section and reflects through site config", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const payload = {
      stickyBarAddress: "123 Test Street",
      stickyBarHotline: "+84 903 117 742",
      contactEmail: "support.qa@example.com",
    };

    const updateResponse = await client.put(
      "/v1/admin/store-settings/contact",
      payload,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(updateResponse.status).toBe(200);

    const [adminSettingsResponse, siteConfigResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
    ]);

    expect(adminSettingsResponse.data).toMatchObject({
      config: { contact: payload },
    });
    expect(siteConfigResponse.data).toMatchObject({
      contact: payload,
    });
  });

  test("rejects invalid contact payload", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/contact",
      {
        stickyBarAddress: "123 Test Street",
        stickyBarHotline: "bad hotline",
        contactEmail: "not-an-email",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(response.status).toBe(400);
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
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(response.status).toBe(400);
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
      { headers: { Authorization: `Bearer ${adminToken}` } },
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
      { headers: { Authorization: `Bearer ${adminToken}` } },
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
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(response.status).toBe(400);
  });

  test("updates visibility flags and reflects through public catalog settings", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const payload = {
      noIndexEnabled: true,
      wishlistEnabled: false,
      checkinEnabled: true,
      checkinReward: 12,
      refundReclaimCards: true,
    };

    const updateResponse = await client.put(
      "/v1/admin/store-settings/visibility",
      payload,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(updateResponse.status).toBe(200);

    const [adminSettingsResponse, siteConfigResponse, catalogSettingsResponse] =
      await Promise.all([getAdminSettings(), getSiteConfig(), getCatalogSettings()]);

    expect(adminSettingsResponse.data).toMatchObject({
      config: { visibility: payload },
    });
    expect(siteConfigResponse.data).toMatchObject({
      visibility: payload,
    });
    expect(catalogSettingsResponse.data).toMatchObject({
      wishlistEnabled: payload.wishlistEnabled,
      checkinEnabled: payload.checkinEnabled,
      checkinReward: payload.checkinReward,
    });
  });

  test("rejects invalid visibility payload", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.put(
      "/v1/admin/store-settings/visibility",
      {
        noIndexEnabled: false,
        wishlistEnabled: true,
        checkinEnabled: true,
        checkinReward: -1,
        refundReclaimCards: false,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(response.status).toBe(400);
  });

  test("updates registry flags and reflects through admin and public site config", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const payload = {
      enabled: true,
      joined: true,
      hideNav: true,
    };

    const updateResponse = await client.put(
      "/v1/admin/store-settings/registry",
      payload,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    expect(updateResponse.status).toBe(200);

    const [adminSettingsResponse, siteConfigResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
    ]);

    expect(adminSettingsResponse.data).toMatchObject({
      config: {
        registry: {
          enabled: true,
          joined: payload.joined,
          hideNav: payload.hideNav,
        },
      },
    });
    expect(siteConfigResponse.data).toMatchObject({
      registry: {
        enabled: true,
        joined: payload.joined,
        hideNav: payload.hideNav,
      },
    });
  });
});
