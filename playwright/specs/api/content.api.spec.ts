import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Content API Contract @api", () => {
  let client: GoBackendClient;
  const adminToken = process.env.ADMIN_USER_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  test("should require auth for admin article CRUD operations", async () => {
    const response = await client.post("/v1/content/articles", { title: "Test" });
    expect([401, 403]).toContain(response.status);
  });

  test("should allow admin to CRUD articles with custom priority, tags, topics, image", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const uniqueSlug = `api-test-art-${Date.now()}`;
    const articlePayload = {
      title: "API Test Article",
      slug: uniqueSlug,
      body: "This is a body test.",
      status: "published",
      image_url: "https://example.com/test.png",
      topic: "tech",
      tags: ["playwright", "api"],
      priority: 42,
    };

    // 1. Create Article
    const createResp = await client.post("/v1/content/articles", articlePayload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(createResp.status).toBe(201);
    const created = createResp.data as any;
    expect(created.id).toBeTruthy();
    expect(created.title).toBe(articlePayload.title);
    expect(created.slug).toBe(articlePayload.slug);
    expect(created.image_url).toBe(articlePayload.image_url);
    expect(created.topic).toBe(articlePayload.topic);
    expect(created.tags).toEqual(articlePayload.tags);
    expect(created.priority).toBe(articlePayload.priority);

    const articleID = created.id;

    // 2. Update Article
    const updatePayload = {
      ...created,
      title: "Updated API Test Article",
      priority: 99,
    };
    const updateResp = await client.patch(`/v1/content/articles/${articleID}`, updatePayload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(updateResp.status).toBe(200);
    const updated = updateResp.data as any;
    expect(updated.title).toBe("Updated API Test Article");
    expect(updated.priority).toBe(99);

    // 3. List Admin Articles
    const listAdminResp = await client.get(`/v1/content/articles`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(listAdminResp.status).toBe(200);
    const adminItems = (listAdminResp.data as any)?.data ?? listAdminResp.data as any;
    console.log("DEBUG - articleID:", articleID);
    console.log("DEBUG - created article:", JSON.stringify(created, null, 2));
    console.log("DEBUG - updated article:", JSON.stringify(updated, null, 2));
    console.log("DEBUG - adminItems:", JSON.stringify(adminItems, null, 2));
    expect(Array.isArray(adminItems)).toBe(true);
    const foundAdmin = adminItems.find((a: any) => a.id === articleID);
    expect(foundAdmin).toBeTruthy();
    expect(foundAdmin.title).toBe("Updated API Test Article");

    // 4. List Public Articles
    const listPublicResp = await client.get("/v1/public/content/articles");
    expect(listPublicResp.status).toBe(200);
    const publicItems = (listPublicResp.data as any)?.data ?? listPublicResp.data as any;
    expect(Array.isArray(publicItems)).toBe(true);
    const foundPublic = publicItems.find((a: any) => a.id === articleID);
    expect(foundPublic).toBeTruthy();

    // 5. Get Single Article Details
    const getDetailResp = await client.get(`/v1/public/content/articles/${articleID}`);
    expect(getDetailResp.status).toBe(200);
    const detail = (getDetailResp.data as any)?.data ?? getDetailResp.data as any;
    expect(detail.id).toBe(articleID);
    expect(detail.title).toBe("Updated API Test Article");

    // 6. Delete Article
    const deleteResp = await client.delete(`/v1/content/articles/${articleID}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteResp.status).toBe(204);

    // 7. Get detail after delete (should be 404)
    const getDetailAfterResp = await client.get(`/v1/public/content/articles/${articleID}`);
    expect(getDetailAfterResp.status).toBe(404);
  });

  test("should list public articles sorted by priority and support filtering by tag and topic", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const t = Date.now();
    const artA = {
      title: "Art A",
      slug: `slug-a-${t}`,
      body: "Body A",
      status: "published",
      topic: "marketing",
      tags: ["announcement"],
      priority: 10,
    };
    const artB = {
      title: "Art B",
      slug: `slug-b-${t}`,
      body: "Body B",
      status: "published",
      topic: "engineering",
      tags: ["tutorial"],
      priority: 50,
      image_url: "",
    };
    const artC = {
      title: "Art C",
      slug: `slug-c-${t}`,
      body: "Body C",
      status: "published",
      topic: "engineering",
      tags: ["announcement", "featured"],
      priority: 5,
    };

    const respA = await client.post("/v1/content/articles", artA, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const respB = await client.post("/v1/content/articles", artB, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const respC = await client.post("/v1/content/articles", artC, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(respA.status).toBe(201);
    expect(respB.status).toBe(201);
    expect(respC.status).toBe(201);

    const idA = (respA.data as any).id;
    const idB = (respB.data as any).id;
    const idC = (respC.data as any).id;

    // Get public list (should be sorted by priority DESC: B then A then C)
    const listResp = await client.get("/v1/public/content/articles");
    expect(listResp.status).toBe(200);
    const items = (listResp.data as any)?.data ?? listResp.data as any;
    expect(Array.isArray(items)).toBe(true);

    const ourItems = items.filter((a: any) => [idA, idB, idC].includes(a.id));
    expect(ourItems.length).toBe(3);
    expect(ourItems[0].id).toBe(idB);
    expect(ourItems[1].id).toBe(idA);
    expect(ourItems[2].id).toBe(idC);

    // Filter by Topic = engineering
    const topicResp = await client.get(`/v1/public/content/articles?topic=engineering`);
    const topicItems = (topicResp.data as any)?.data ?? topicResp.data as any;
    const ourTopicItems = topicItems.filter((a: any) => [idA, idB, idC].includes(a.id));
    expect(ourTopicItems.length).toBe(2);
    expect(ourTopicItems.map((a: any) => a.id)).toContain(idB);
    expect(ourTopicItems.map((a: any) => a.id)).toContain(idC);

    // Filter by Tag = announcement
    const tagResp = await client.get(`/v1/public/content/articles?tag=announcement`);
    const tagItems = (tagResp.data as any)?.data ?? tagResp.data as any;
    const ourTagItems = tagItems.filter((a: any) => [idA, idB, idC].includes(a.id));
    expect(ourTagItems.length).toBe(2);
    expect(ourTagItems.map((a: any) => a.id)).toContain(idA);
    expect(ourTagItems.map((a: any) => a.id)).toContain(idC);

    // Clean up
    await client.delete(`/v1/content/articles/${idA}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    await client.delete(`/v1/content/articles/${idB}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    await client.delete(`/v1/content/articles/${idC}`, { headers: { Authorization: `Bearer ${adminToken}` } });
  });

  test("should allow admin to manage banners and reflect only active slides publicly in sort order", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");
    const suffix = Date.now();

    const firstBanner = {
      title: `Banner A ${suffix}`,
      subtitle: "First",
      image: "https://cdn.example.com/banner-a.png",
      mobileImage: "https://cdn.example.com/banner-a-mobile.png",
      ctaText: "Shop A",
      ctaLink: "/products?a",
      sortOrder: 20,
      isActive: true,
    };
    const secondBanner = {
      title: `Banner B ${suffix}`,
      subtitle: "Second",
      image: "https://cdn.example.com/banner-b.png",
      mobileImage: "https://cdn.example.com/banner-b-mobile.png",
      ctaText: "Shop B",
      ctaLink: "/products?b",
      sortOrder: 10,
      isActive: false,
    };

    const createA = await client.post("/v1/admin/banners", firstBanner, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const createB = await client.post("/v1/admin/banners", secondBanner, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(createA.status).toBe(200);
    expect(createB.status).toBe(200);

    const adminListResp = await client.get<any>("/v1/admin/banners", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(adminListResp.status).toBe(200);
    const adminBanners = adminListResp.data as any[];
    expect(Array.isArray(adminBanners)).toBe(true);
    const ourAdminBanners = adminBanners.filter((item) => [firstBanner.title, secondBanner.title].includes(item.title));
    expect(ourAdminBanners.length).toBe(2);
    expect(ourAdminBanners[0].title).toBe(secondBanner.title);
    expect(ourAdminBanners[1].title).toBe(firstBanner.title);

    const bannerA = ourAdminBanners.find((item) => item.title === firstBanner.title);
    const bannerB = ourAdminBanners.find((item) => item.title === secondBanner.title);
    expect(bannerA).toBeTruthy();
    expect(bannerB).toBeTruthy();

    const activateB = await client.post("/v1/admin/banners", {
      ...bannerB,
      isActive: true,
      sortOrder: 5,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(activateB.status).toBe(200);

    const publicHomepageResp = await client.get<any>("/v1/public/homepage");
    expect(publicHomepageResp.status).toBe(200);
    const blocks = (publicHomepageResp.data as any)?.data ?? publicHomepageResp.data as any;
    expect(Array.isArray(blocks)).toBe(true);
    const bannerBlock = blocks.find((block: any) => block.block_type === "banner");
    expect(bannerBlock).toBeTruthy();
    expect(Array.isArray(bannerBlock.config?.slides)).toBe(true);
    const ourPublicSlides = bannerBlock.config.slides.filter((slide: any) => [firstBanner.title, secondBanner.title].includes(slide.title));
    expect(ourPublicSlides.map((slide: any) => slide.title)).toEqual([secondBanner.title, firstBanner.title]);
    expect(ourPublicSlides.every((slide: any) => slide.isActive === true)).toBe(true);

    const deleteA = await client.delete(`/v1/admin/banners/${bannerA.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteB = await client.delete(`/v1/admin/banners/${bannerB.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteA.status).toBe(200);
    expect(deleteB.status).toBe(200);
  });

  test("should allow admin to CRUD FAQs and expose only active ordered entries publicly", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");
    const suffix = Date.now();

    const createB = await client.post("/v1/admin/faqs", {
      question: `How long is shipping? ${suffix}`,
      answer: "2 days",
      sortOrder: 20,
      isActive: false,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const createA = await client.post("/v1/admin/faqs", {
      question: `Do you ship internationally? ${suffix}`,
      answer: "Yes",
      sortOrder: 10,
      isActive: true,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(createA.status).toBe(200);
    expect(createB.status).toBe(200);

    const adminListResp = await client.get<any>("/v1/admin/faqs", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(adminListResp.status).toBe(200);
    const adminFAQs = adminListResp.data as any[];
    const ourFAQs = adminFAQs.filter((item) => [
      `Do you ship internationally? ${suffix}`,
      `How long is shipping? ${suffix}`,
    ].includes(item.question));
    expect(ourFAQs.map((item) => item.question)).toEqual([
      `Do you ship internationally? ${suffix}`,
      `How long is shipping? ${suffix}`,
    ]);

    const visibleFAQ = ourFAQs.find((item) => item.question === `Do you ship internationally? ${suffix}`);
    const hiddenFAQ = ourFAQs.find((item) => item.question === `How long is shipping? ${suffix}`);
    expect(visibleFAQ).toBeTruthy();
    expect(hiddenFAQ).toBeTruthy();
    const updateHidden = await client.post("/v1/admin/faqs", {
      ...hiddenFAQ,
      answer: "3 days",
      sortOrder: 5,
      isActive: true,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(updateHidden.status).toBe(200);

    const publicResp = await client.get<any>("/v1/faqs/active");
    expect(publicResp.status).toBe(200);
    expect(Array.isArray(publicResp.data?.items)).toBe(true);
    const ourPublicFAQs = publicResp.data.items.filter((item: any) => [
      `Do you ship internationally? ${suffix}`,
      `How long is shipping? ${suffix}`,
    ].includes(item.question));
    expect(ourPublicFAQs.map((item: any) => item.question)).toEqual([
      `How long is shipping? ${suffix}`,
      `Do you ship internationally? ${suffix}`,
    ]);

    const deleteA = await client.delete(`/v1/admin/faqs/${visibleFAQ.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteB = await client.delete(`/v1/admin/faqs/${hiddenFAQ.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteA.status).toBe(200);
    expect(deleteB.status).toBe(200);
  });

  test("should persist about page content and gallery for public reflection", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const createResp = await client.post("/v1/content/pages", {
      title: "About Grip",
      slug: "about",
      body: "About body",
      gallery: ["https://cdn.example.com/a.png", "https://cdn.example.com/b.png"],
      template_key: "about-us",
      status: "published",
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(createResp.status).toBe(201);

    const updateResp = await client.patch("/v1/content/pages/about", {
      title: "About Grip Updated",
      slug: "about",
      body: "Updated body",
      gallery: ["https://cdn.example.com/c.png"],
      template_key: "about-us",
      status: "published",
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(updateResp.status).toBe(200);

    const publicResp = await client.get<any>("/v1/public/content/pages/about");
    expect(publicResp.status).toBe(200);
    expect(publicResp.data?.title).toBe("About Grip Updated");
    expect(publicResp.data?.body).toBe("Updated body");
    expect(publicResp.data?.gallery).toEqual(["https://cdn.example.com/c.png"]);
  });
});
