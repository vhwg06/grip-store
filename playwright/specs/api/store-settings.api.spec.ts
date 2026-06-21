import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

type AdminSettingsPayload = {
  config?: {
    brand?: Record<string, unknown>;
    contact?: Record<string, unknown>;
    homepage?: {
      blocks?: Array<{ key?: string; enabled?: boolean; order?: number }>;
      newsCount?: number;
      [key: string]: unknown;
    };
    footer?: {
      columns?: unknown[];
      socialLinks?: Record<string, unknown>;
      [key: string]: unknown;
    };
    floatingSupport?: Array<{ key?: string; enabled?: boolean; target?: string | null }>;
    visibility?: Record<string, unknown>;
    registry?: Record<string, unknown>;
    [key: string]: unknown;
  };
  stats?: Record<string, unknown>;
  visitorCount?: number;
  [key: string]: unknown;
};

function adminAuth() {
  const token = process.env.ADMIN_USER_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function userAuth() {
  const token = process.env.TEST_USER_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

test.describe("Store Settings API Contract @api P1 P2", () => {
  let client: GoBackendClient;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  async function getAdminSettings() {
    return client.get<AdminSettingsPayload>("/v1/admin/store-settings", {
      headers: adminAuth(),
    });
  }

  async function getSiteConfig() {
    return client.get<Record<string, unknown>>("/v1/site-config");
  }

  async function getCatalogSettings() {
    return client.get<Record<string, unknown>>("/v1/catalog/settings");
  }

  test("UC-SET-01 reads storefront identity from the structured admin and public read models", async () => {
    // GOAL: Admin Maintains Storefront Identity: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-01 Main flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

    const [adminResponse, siteConfigResponse, catalogSettingsResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
      getCatalogSettings(),
    ]);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.data).toMatchObject({
      config: {
        brand: expect.any(Object),
        contact: expect.any(Object),
      },
      stats: expect.any(Object),
      visitorCount: expect.any(Number),
    });

    expect(siteConfigResponse.status).toBe(200);
    expect(siteConfigResponse.data).toMatchObject({
      brand: expect.any(Object),
      contact: expect.any(Object),
    });

    expect(catalogSettingsResponse.status).toBe(200);
    expect(catalogSettingsResponse.data).toMatchObject({
      shopName: expect.any(String),
      shopDescription: expect.any(String),
      themeColor: expect.any(String),
    });
  });

  test("UC-SET-01 updates brand and contact facts and reflects the new storefront identity publicly", async () => {
    // GOAL: Admin Maintains Storefront Identity: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-01 Main flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

    const brandPayload = {
      shopName: "playwright-store-identity",
      shopDescription: "playwright storefront identity contract",
      shopLogo: "https://cdn.example.com/playwright-store-logo.webp",
      themeColor: "amber",
    };
    const contactPayload = {
      stickyBarAddress: "123 Playwright Street",
      stickyBarHotline: "+84 903 117 742",
      contactEmail: "playwright-store-identity@grip.vn",
    };

    const brandUpdate = await client.put("/v1/admin/store-settings/brand", brandPayload, {
      headers: adminAuth(),
    });
    const contactUpdate = await client.put("/v1/admin/store-settings/contact", contactPayload, {
      headers: adminAuth(),
    });

    expect(brandUpdate.status).toBe(200);
    expect(contactUpdate.status).toBe(200);

    const [adminResponse, siteConfigResponse, catalogSettingsResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
      getCatalogSettings(),
    ]);

    expect(adminResponse.data).toMatchObject({
      config: {
        brand: brandPayload,
        contact: contactPayload,
      },
    });
    expect(siteConfigResponse.data).toMatchObject({
      contact: contactPayload,
    });
    expect(catalogSettingsResponse.data).toMatchObject({
      shopName: brandPayload.shopName,
      shopDescription: brandPayload.shopDescription,
      themeColor: brandPayload.themeColor,
    });
  });

  test("UC-SET-01 rejects storefront identity reads without valid admin authorization", async () => {
    // GOAL: Admin Maintains Storefront Identity: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-01 Exception flow
    const unauthenticated = await client.get("/v1/admin/store-settings");
    expect(unauthenticated.status).toBe(401);

    test.skip(!process.env.TEST_USER_TOKEN, "TEST_USER_TOKEN not set");
    const nonAdmin = await client.get("/v1/admin/store-settings", {
      headers: userAuth(),
    });
    expect(nonAdmin.status).toBe(403);
  });

  test("UC-SET-02 accepts a homepage composition decision and rejects ordering conflicts", async () => {
    // GOAL: Admin Composes Homepage Surface: quyết định storefront homepage đang ưu tiên giới thiệu nội dung gì.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-02 Exception flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

    const validPayload = {
      blocks: [
        { key: "hero", enabled: true, order: 1 },
        { key: "categories", enabled: true, order: 2 },
        { key: "latest_news", enabled: true, order: 3 },
      ],
      newsCount: 3,
    };

    const updateResponse = await client.put(
      "/v1/admin/store-settings/homepage",
      validPayload,
      { headers: adminAuth() },
    );

    expect(updateResponse.status).toBe(200);

    const adminResponse = await getAdminSettings();
    expect(adminResponse.data).toMatchObject({
      config: {
        homepage: {
          newsCount: validPayload.newsCount,
        },
      },
    });
    expect(adminResponse.data.config?.homepage?.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "hero", enabled: true }),
        expect.objectContaining({ key: "categories", enabled: true }),
        expect.objectContaining({ key: "latest_news", enabled: true }),
      ]),
    );

    const invalidResponse = await client.put(
      "/v1/admin/store-settings/homepage",
      {
        blocks: [
          { key: "hero", enabled: true, order: 1 },
          { key: "hero", enabled: true, order: 2 },
        ],
        newsCount: -1,
      },
      { headers: adminAuth() },
    );

    expect(invalidResponse.status).toBe(400);
  });

  test("UC-SET-03 accepts discovery and visibility rules and rejects invalid behavioral combinations", async () => {
    // GOAL: Admin Controls Public Discovery And Visibility Rules: điều chỉnh cách storefront được discover và cách một số capability xuất hiện công khai.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-03 Exception flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

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
      { headers: adminAuth() },
    );

    expect(updateResponse.status).toBe(200);

    const [adminResponse, siteConfigResponse, catalogSettingsResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
      getCatalogSettings(),
    ]);

    expect(adminResponse.data).toMatchObject({
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

    const invalidResponse = await client.put(
      "/v1/admin/store-settings/visibility",
      {
        noIndexEnabled: false,
        wishlistEnabled: true,
        checkinEnabled: true,
        checkinReward: -1,
        refundReclaimCards: false,
      },
      { headers: adminAuth() },
    );

    expect(invalidResponse.status).toBe(400);
  });

  test("UC-SET-04 updates footer and support commitments and reflects them through storefront-facing settings", async () => {
    // GOAL: Admin Maintains Storefront Support And Footer Presence: kiểm soát các điểm chạm hỗ trợ và navigation/public references trên storefront.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-04 Main flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

    const footerPayload = {
      columns: [
        {
          id: "playwright-products",
          title: "Playwright products",
          links: [{ label: "Door Handles", url: "/products" }],
        },
      ],
      copyright: "Copyright 2026 Playwright Grip",
      socialLinks: {
        facebook: "https://facebook.com/playwright-grip",
        zalo: "https://zalo.me/playwright-grip",
      },
    };
    const supportPayload = {
      actions: [
        { key: "zalo", enabled: true, target: "https://zalo.me/playwright-grip" },
        { key: "hotline", enabled: true, target: "+84 903 117 742" },
        { key: "scroll_to_top", enabled: true, target: null },
      ],
    };

    const footerUpdate = await client.put(
      "/v1/admin/store-settings/footer",
      footerPayload,
      { headers: adminAuth() },
    );
    const supportUpdate = await client.put(
      "/v1/admin/store-settings/floating-support",
      supportPayload,
      { headers: adminAuth() },
    );

    expect(footerUpdate.status).toBe(200);
    expect(supportUpdate.status).toBe(200);

    const [adminResponse, siteConfigResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
    ]);

    expect(adminResponse.data).toMatchObject({
      config: {
        footer: expect.objectContaining({
          columns: footerPayload.columns,
          socialLinks: footerPayload.socialLinks,
        }),
        floatingSupport: expect.arrayContaining([
          expect.objectContaining({ key: "zalo", enabled: true, target: "https://zalo.me/playwright-grip" }),
          expect.objectContaining({ key: "hotline", enabled: true, target: "+84 903 117 742" }),
          expect.objectContaining({ key: "scroll_to_top", enabled: true }),
        ]),
      },
    });
    expect(siteConfigResponse.status).toBe(200);

    const malformedSupport = await client.put(
      "/v1/admin/store-settings/floating-support",
      {
        actions: [
          { key: "zalo", enabled: true, target: "not-a-url" },
          { key: "scroll_to_top", enabled: true, target: "unexpected" },
        ],
      },
      { headers: adminAuth() },
    );

    expect(malformedSupport.status).toBe(400);
  });

  test("UC-SET-05 exposes banner and about presence controls as part of the store-settings contract", async () => {
    // GOAL: Admin Maintains Banner And About Presence Through Store Settings: kiểm soát các reference thuộc banner/about trong phạm vi storefront behavior.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-05 Main flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

    const response = await getAdminSettings();

    expect(response.status).toBe(200);
    expect(response.data.config).toEqual(
      expect.objectContaining({
        bannerPresence: expect.any(Object),
        aboutPresence: expect.any(Object),
      }),
    );
  });

  test("UC-SET-06 updates registry commitments and reflects the resulting storefront policy state", async () => {
    // GOAL: Admin Maintains Registry And Legacy Storefront Commitments: giữ các storefront commitments cũ hoặc registry-related commitments ở trạng thái đúng với business policy hiện tại.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-SET-06 Main flow
    test.skip(!process.env.ADMIN_USER_TOKEN, "ADMIN_USER_TOKEN not set");

    const payload = {
      enabled: true,
      joined: true,
      hideNav: true,
    };

    const updateResponse = await client.put(
      "/v1/admin/store-settings/registry",
      payload,
      { headers: adminAuth() },
    );

    expect(updateResponse.status).toBe(200);

    const [adminResponse, siteConfigResponse] = await Promise.all([
      getAdminSettings(),
      getSiteConfig(),
    ]);

    expect(adminResponse.data).toMatchObject({
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
