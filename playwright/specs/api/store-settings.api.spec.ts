import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";

type AdminSettingsPayload = {
  config?: {
    brand?: Record<string, unknown>;
    contact?: Record<string, unknown>;
    homepage?: {
      blocks?: Array<{ key?: string; enabled?: boolean; order?: number }>;
      newsCount?: number;
    };
    footer?: {
      columns?: unknown[];
      socialLinks?: Record<string, unknown>;
    };
    floatingSupport?: Array<{ key?: string; enabled?: boolean; target?: string | null }>;
  };
  stats?: Record<string, unknown>;
  visitorCount?: number;
};

test.describe("Store Settings API Contract @api P1", () => {
  let client: GoBackendClient;
  let adminHeaders: Record<string, string>;
  let userHeaders: Record<string, string>;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    adminHeaders = { Authorization: `Bearer ${await getAdminToken(request)}` };
    userHeaders = { Authorization: `Bearer ${await getUserToken(request)}` };
  });

  async function getAdminSettings() {
    return client.get<AdminSettingsPayload>("/v1/admin/store-settings", {
      headers: adminHeaders,
    });
  }

  async function getSiteConfig() {
    return client.get<Record<string, unknown>>("/v1/site-config");
  }

  async function getCatalogSettings() {
    return client.get<Record<string, unknown>>("/v1/catalog/settings");
  }

  test("UC-SET-01 reads storefront identity from the structured admin and public read models", async () => {
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
    });
  });

  test("UC-SET-01 updates brand and contact facts and reflects the new storefront identity publicly", async () => {
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
      headers: adminHeaders,
    });
    const contactUpdate = await client.put("/v1/admin/store-settings/contact", contactPayload, {
      headers: adminHeaders,
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
    const unauthenticated = await client.get("/v1/admin/store-settings");
    expect(unauthenticated.status).toBe(401);

    const nonAdmin = await client.get("/v1/admin/store-settings", {
      headers: userHeaders,
    });
    expect(nonAdmin.status).toBe(403);
  });

  test("UC-SET-02 accepts a homepage composition decision and rejects ordering conflicts", async () => {
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
      { headers: adminHeaders },
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

    const invalidResponse = await client.put(
      "/v1/admin/store-settings/homepage",
      {
        blocks: [
          { key: "hero", enabled: true, order: 1 },
          { key: "hero", enabled: true, order: 2 },
        ],
        newsCount: -1,
      },
      { headers: adminHeaders },
    );

    expect(invalidResponse.status).toBe(400);
  });

  test("UC-SET-04 updates footer and support commitments and rejects malformed support targets", async () => {
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
      { headers: adminHeaders },
    );
    const supportUpdate = await client.put(
      "/v1/admin/store-settings/floating-support",
      supportPayload,
      { headers: adminHeaders },
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
      { headers: adminHeaders },
    );

    expect(malformedSupport.status).toBe(400);
  });
});
