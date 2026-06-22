import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";
const DEFAULT_CATEGORY_ID = "a1111111-1111-1111-1111-111111111111";

async function adminGet(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPost(request: any, path: string, options: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.post(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...options,
  });
}

async function adminPatch(request: any, path: string, options: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.patch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...options,
  });
}

async function createProduct(request: any, suffix: string) {
  const response = await adminPost(request, "/v1/admin/products", {
    data: {
      title: `Playwright Product ${suffix}`,
      sku: `PW-${suffix}`,
      price: 12345,
      category_id: DEFAULT_CATEGORY_ID,
      is_active: true,
    },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload.data as { id: string; title: string; price: number; category_id: string };
}

async function createArticle(request: any, suffix: string, status: "published" | "draft" = "published") {
  const response = await adminPost(request, "/v1/content/articles", {
    data: {
      title: `Playwright Article ${suffix}`,
      slug: `playwright-article-${suffix}`,
      body: `<p>Editorial body ${suffix}</p>`,
      status,
    },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function getProductForm(request: any, id: string) {
  const response = await adminGet(request, `/v1/admin/products/${id}/form`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe("Admin Product API @api P1 P2", () => {
  test("UC-PROD-01 rejects unauthenticated product-admin reads", async ({ request }) => {
    // GOAL: Admin Reviews Product Catalog: hiểu catalog hiện tại để chọn sản phẩm cần tạo mới, chỉnh sửa, sắp xếp, hoặc kiểm tra.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-01 Exception flow
    const response = await request.get(`${BACKEND_URL}/v1/admin/products`);
    expect(response.status()).toBe(401);
  });

  test("UC-PROD-01 rejects non-admin product-admin reads", async ({ request }) => {
    // GOAL: Admin Reviews Product Catalog: hiểu catalog hiện tại để chọn sản phẩm cần tạo mới, chỉnh sửa, sắp xếp, hoặc kiểm tra.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-01 Exception flow
    const token = await getUserToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
  });

  test("UC-PROD-01 reviews catalog state for triage", async ({ request }) => {
    // GOAL: Admin Reviews Product Catalog: hiểu catalog hiện tại để chọn sản phẩm cần tạo mới, chỉnh sửa, sắp xếp, hoặc kiểm tra.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-01 Main flow
    const response = await adminGet(request, "/v1/admin/products");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

    expect(Array.isArray(items)).toBeTruthy();

    if (items.length === 0) {
      return;
    }

    const sample = items[0];
    expect(typeof sample.id).toBe("string");
    expect(typeof sample.title).toBe("string");
    expect(sample).toHaveProperty("category_id");
    expect(sample).toHaveProperty("stock_count");
    expect(sample).toHaveProperty("is_active");
    expect(sample).toHaveProperty("sort_order");
  });

  test("UC-PROD-06 exposes distinct health signals for operator review", async ({ request }) => {
    // GOAL: Admin Reviews Product Health Signals: nhận diện product nào đang cần chú ý vì thiếu media, low stock, hidden state, hoặc commercial inconsistency.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-06 Main flow
    const response = await adminGet(request, "/v1/admin/products");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

    expect(Array.isArray(items)).toBeTruthy();

    const flagged = items.filter((item: any) => {
      const missingMedia = !item.image_url && (!Array.isArray(item.images) || item.images.length === 0);
      const hidden = item.is_active === false;
      const lowStock = Number(item.stock_count ?? 0) <= 5;
      return missingMedia || hidden || lowStock;
    });

    test.skip(
      flagged.length === 0,
      "blocked-by-data: production catalog currently has no hidden, low-stock, or missing-media products",
    );

    for (const item of flagged) {
      const hasMediaSignal = "image_url" in item || "images" in item;
      const hasVisibilitySignal = "is_active" in item;
      const hasStockSignal = "stock_count" in item;

      expect(hasMediaSignal).toBeTruthy();
      expect(hasVisibilitySignal).toBeTruthy();
      expect(hasStockSignal).toBeTruthy();
    }
  });

  test("UC-PROD-02 creates a sellable catalog entity", async ({ request }) => {
    // GOAL: Admin Creates A Product: đưa một product mới vào catalog với business meaning đầy đủ.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-02 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProduct(request, suffix);

    expect(typeof created.id).toBe("string");
    expect(created.title).toContain(suffix);
    expect(created.price).toBe(12345);
    expect(created.category_id).toBe(DEFAULT_CATEGORY_ID);

    const formPayload = await getProductForm(request, created.id);
    expect(formPayload.product.id).toBe(created.id);
    expect(formPayload.product.title).toBe(created.title);
    expect(formPayload.product.price).toBe(12345);
    expect(Array.isArray(formPayload.categories)).toBeTruthy();
  });

  test("UC-PROD-03 updates product commercial state", async ({ request }) => {
    // GOAL: Admin Updates Product Commercial State: thay đổi nội dung hoặc trạng thái thương mại của product đang có.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-03 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProduct(request, suffix);

    const patchResponse = await adminPatch(request, `/v1/admin/products/${created.id}`, {
      multipart: {
        name: `Updated ${suffix}`,
        price: "2222",
        purchaseLimit: "3",
        visibilityLevel: "2",
        category: "Test Topups",
        description: "updated via playwright",
      },
    });
    expect(patchResponse.ok()).toBeTruthy();

    const formPayload = await getProductForm(request, created.id);
    expect(formPayload.product.title).toBe(`Updated ${suffix}`);
    expect(formPayload.product.price).toBe(2222);
    expect(formPayload.product.purchase_limit).toBe(3);
    expect(formPayload.product.visibility_level).toBe(2);
    expect(formPayload.product.category_id).toBe("Test Topups");
    expect(formPayload.product.description).toBe("updated via playwright");
  });

  test("UC-PROD-04 maintains category structure with hierarchy and position semantics", async ({ request }) => {
    // GOAL: Admin Maintains Category Structure: giữ category tree đúng để catalog có cấu trúc thương mại rõ ràng.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-04 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const rootResponse = await adminPost(request, "/v1/admin/categories", {
      multipart: {
        name: `playwright-root-${suffix}`,
        slug: `playwright-root-${suffix}`,
      },
    });
    expect(rootResponse.ok()).toBeTruthy();
    const rootPayload = await rootResponse.json();
    const rootId = rootPayload.data.id as string;

    const childResponse = await adminPost(request, "/v1/admin/categories", {
      multipart: {
        name: `playwright-child-${suffix}`,
        slug: `playwright-child-${suffix}`,
        parentId: rootId,
      },
    });
    expect(childResponse.ok()).toBeTruthy();
    const childPayload = await childResponse.json();
    expect(childPayload.data.parent_id).toBe(rootId);

    const reorderResponse = await adminPost(request, "/v1/admin/categories", {
      multipart: {
        id: rootId,
        name: `playwright-root-${suffix}`,
        position: "9",
      },
    });
    expect(reorderResponse.ok()).toBeTruthy();
    const reorderPayload = await reorderResponse.json();
    expect(reorderPayload.data.position).toBe(9);

    const categoriesResponse = await adminGet(request, "/v1/admin/categories");
    expect(categoriesResponse.ok()).toBeTruthy();
    const categoriesPayload = await categoriesResponse.json();
    const categories = categoriesPayload.data as Array<Record<string, unknown>>;
    const root = categories.find((item) => item.id === rootId);
    const child = categories.find((item) => item.id === childPayload.data.id);

    expect(root?.position).toBe(9);
    expect(child?.parent_id).toBe(rootId);
  });

  test("UC-PROD-05 keeps product editorial/media work on the product contract", async ({ request }) => {
    // GOAL: Admin Keeps Editorial And Media Work Inside Product Editor: quản lý media/editorial state của product mà không rời product editor flow.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-05 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProduct(request, suffix);

    const formPayload = await getProductForm(request, created.id);
    expect(formPayload.product.id).toBe(created.id);
    expect(formPayload.product.title).toBe(created.title);
    expect(Array.isArray(formPayload.categories)).toBeTruthy();
    expect(formPayload).not.toHaveProperty("cards");
    expect(formPayload).not.toHaveProperty("inventory");

    const absentCardsRoute = await adminGet(request, "/v1/admin/cards");
    expect(absentCardsRoute.status()).toBe(404);
  });

  test("UC-PROD-05 returns linked intro article through product form and public detail", async ({ request }) => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProduct(request, suffix);
    const article = await createArticle(request, `${suffix}-published`, "published");
    const draftArticle = await createArticle(request, `${suffix}-draft`, "draft");

    const attachPublished = await adminPatch(request, `/v1/admin/products/${created.id}`, {
      data: { introArticleId: article.id },
    });
    expect(attachPublished.ok()).toBeTruthy();

    const formWithPublished = await getProductForm(request, created.id);
    expect(formWithPublished.product.intro_article_id).toBe(article.id);
    expect(formWithPublished.product.intro_article.title).toBe(article.title);

    const publicPublishedResponse = await request.get(`${BACKEND_URL}/v1/catalog/products/${created.id}`);
    expect(publicPublishedResponse.ok()).toBeTruthy();
    const publicPublishedPayload = await publicPublishedResponse.json();
    expect(publicPublishedPayload.data.intro_article.id).toBe(article.id);

    const attachDraft = await adminPatch(request, `/v1/admin/products/${created.id}`, {
      data: { introArticleId: draftArticle.id },
    });
    expect(attachDraft.ok()).toBeTruthy();

    const publicDraftResponse = await request.get(`${BACKEND_URL}/v1/catalog/products/${created.id}`);
    expect(publicDraftResponse.ok()).toBeTruthy();
    const publicDraftPayload = await publicDraftResponse.json();
    expect(publicDraftPayload.data.intro_article ?? null).toBeNull();

    const clearLink = await adminPatch(request, `/v1/admin/products/${created.id}`, {
      data: { introArticleId: null },
    });
    expect(clearLink.ok()).toBeTruthy();

    const clearedForm = await getProductForm(request, created.id);
    expect(clearedForm.product.intro_article_id ?? null).toBeNull();
  });
});
