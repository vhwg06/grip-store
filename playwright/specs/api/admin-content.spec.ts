import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function adminFetch(request: any, path: string, options?: { method?: string; data?: any; multipart?: any }) {
  const token = await getAdminToken(request);
  const method = options?.method ?? "GET";
  return request.fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: options?.data,
    multipart: options?.multipart,
  });
}

function extractData(payload: any) {
  return payload?.data ?? payload;
}

test.describe("Admin Content API @api P2", () => {
  test("UC-CONT-01 curates a shared media library through list and upload-contract endpoints", async ({
    request,
  }) => {
    // GOAL: Admin Curates Media Library: giữ một thư viện media có thể tái sử dụng an toàn trên nhiều bề mặt nội dung.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-01 Main flow
    const listResponse = await adminFetch(request, "/v1/admin/media?page=1&pageSize=24");
    expect(listResponse.ok()).toBeTruthy();
    const listPayload = await listResponse.json();
    const items = extractData(listPayload);
    expect(Array.isArray(items)).toBe(true);

    const presignedResponse = await adminFetch(
      request,
      "/v1/admin/media/presigned?fileName=uc-cont-01.png&contentType=image/png",
    );
    expect(presignedResponse.ok()).toBeTruthy();
    const presigned = extractData(await presignedResponse.json());
    expect(presigned).toMatchObject({
      id: expect.any(String),
      public_url: expect.any(String),
      upload_url: expect.any(String),
    });
  });

  test("UC-CONT-02 maintains banner presence per page and reflects active ordering publicly", async ({
    request,
  }) => {
    // GOAL: Admin Maintains Banner Presence: quyết định banner nào đang đại diện cho một page context cụ thể.
    // PRIORITY: P2
    // RELATED DOMAINS: store-setting
    // SCENARIO: SC-CONT-02 Main flow
    const ts = Date.now();
    const title = `playwright-banner-${ts}`;

    const createResponse = await adminFetch(request, "/v1/admin/banners", {
      method: "POST",
      multipart: {
        title,
        subtitle: "uc-cont-02",
        image: "https://example.com/banner.png",
        mobileImage: "https://example.com/banner-mobile.png",
        ctaText: "Shop",
        ctaLink: "/products",
        sortOrder: "7",
        isActive: "true",
        page: "homepage",
      },
    });
    expect(createResponse.ok()).toBeTruthy();

    const adminListResponse = await adminFetch(request, "/v1/admin/banners");
    expect(adminListResponse.ok()).toBeTruthy();
    const adminBanners = extractData(await adminListResponse.json());
    expect(Array.isArray(adminBanners)).toBe(true);
    expect(adminBanners.some((item: any) => item.title === title)).toBe(true);

    const publicResponse = await request.get(`${BACKEND_URL}/v1/public/homepage`);
    expect(publicResponse.ok()).toBeTruthy();
    const blocks = extractData(await publicResponse.json());
    const bannerBlock = Array.isArray(blocks)
      ? blocks.find((block: any) => block.block_type === "banner")
      : null;
    expect(bannerBlock).toBeTruthy();
    const slides = bannerBlock?.config?.slides ?? [];
    expect(slides.some((slide: any) => slide.title === title && slide.isActive === true)).toBe(true);
  });

  test("UC-CONT-03 publishes editorial articles with a real draft-vs-published boundary", async ({
    request,
  }) => {
    // GOAL: Admin Publishes Editorial Articles: tạo, chỉnh, và xuất bản bài viết như một knowledge/public content stream.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-03 Main flow
    const ts = Date.now();
    const slug = `playwright-article-${ts}`;

    const createDraftResponse = await adminFetch(request, "/v1/content/articles", {
      method: "POST",
      multipart: {
        title: `Playwright Draft ${ts}`,
        slug,
        body: "draft body",
        status: "draft",
        topic: "qa",
        tags: "playwright",
        priority: "1",
      },
    });
    expect(createDraftResponse.status()).toBe(201);
    const createdDraft = await createDraftResponse.json();

    const publicBeforeResponse = await request.get(`${BACKEND_URL}/v1/public/content/articles`);
    expect(publicBeforeResponse.ok()).toBeTruthy();
    const publicBefore = extractData(await publicBeforeResponse.json());
    expect(publicBefore.some((article: any) => article.id === createdDraft.id)).toBe(false);

    const publishResponse = await adminFetch(request, `/v1/content/articles/${createdDraft.id}`, {
      method: "PATCH",
      data: {
        ...createdDraft,
        title: `Playwright Published ${ts}`,
        status: "published",
        priority: 9,
      },
    });
    expect(publishResponse.ok()).toBeTruthy();

    const publicAfterResponse = await request.get(`${BACKEND_URL}/v1/public/content/articles`);
    expect(publicAfterResponse.ok()).toBeTruthy();
    const publicAfter = extractData(await publicAfterResponse.json());
    expect(publicAfter.some((article: any) => article.id === createdDraft.id)).toBe(true);
  });

  test("UC-CONT-04 keeps inactive FAQ entries out of the public knowledge surface", async ({ request }) => {
    // GOAL: Admin Maintains FAQ Knowledge: giữ tập FAQ phản ánh đúng knowledge mà storefront cần trả lời công khai.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-04 Main flow
    const ts = Date.now();

    const createResponse = await adminFetch(request, "/v1/admin/faqs", {
      method: "POST",
      multipart: {
        question: `playwright faq ${ts}?`,
        answer: "draft answer",
        sortOrder: "81",
        isActive: "false",
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();

    const publicResponse = await request.get(`${BACKEND_URL}/v1/public/homepage`);
    expect(publicResponse.ok()).toBeTruthy();
    const blocks = extractData(await publicResponse.json());
    const faqBlock = Array.isArray(blocks)
      ? blocks.find((block: any) => block.block_type === "faq")
      : null;
    expect(faqBlock).toBeTruthy();
    const entries = faqBlock?.config?.entries ?? [];
    expect(entries.some((entry: any) => entry.id === created.id)).toBe(false);
  });

  test("UC-CONT-05 maintains the official About narrative through the public about page contract", async ({
    request,
  }) => {
    // GOAL: Admin Maintains About Narrative: giữ phần About như company narrative chính thức của storefront.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-05 Main flow
    const ts = Date.now();
    const body = `playwright about narrative ${ts}`;

    const saveResponse = await adminFetch(request, "/v1/content/pages/about", {
      method: "PATCH",
      data: {
        title: "About Grip",
        slug: "about",
        body,
        gallery: [],
        template_key: "about-us",
        status: "published",
      },
    });
    expect(saveResponse.ok()).toBeTruthy();

    const publicResponse = await request.get(`${BACKEND_URL}/v1/public/content/pages/about`);
    expect(publicResponse.ok()).toBeTruthy();
    const about = extractData(await publicResponse.json());
    expect(about.body).toBe(body);
    expect(about.slug).toBe("about");
  });

  test("UC-CONT-06 updates product editorial content without clobbering commercial state", async ({ request }) => {
    // GOAL: Admin Maintains Product Editorial Content: làm giàu product detail bằng media và rich content mà không đổi commercial state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-CONT-06 Main flow
    const ts = Date.now();
    const slug = `playwright-content-${ts}`;

    const createResponse = await adminFetch(request, "/v1/admin/products", {
      method: "POST",
      multipart: {
        slug,
        name: `Playwright Content ${ts}`,
        price: "111.00",
        visibilityLevel: "-1",
      },
    });
    expect(createResponse.status()).toBe(201);
    const created = extractData(await createResponse.json());

    const patchResponse = await adminFetch(request, `/v1/admin/products/${created.id}`, {
      method: "PATCH",
      multipart: {
        id: created.id,
        image: "https://example.com/main.png",
        images: "https://example.com/1.png\nhttps://example.com/2.png",
        description: "editorial intro",
        usageGuide: "editorial detail",
      },
    });
    expect(patchResponse.ok()).toBeTruthy();
    const updated = extractData(await patchResponse.json());

    expect(updated.description).toBe("editorial intro");
    expect(updated.price).toBe(created.price);
    expect(updated.title || updated.name).toBe(created.title || created.name);
  });
});
