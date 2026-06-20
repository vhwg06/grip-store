import { test, expect } from "../../src/fixtures/base-test";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";
const DEFAULT_CATEGORY_ID = "a1111111-1111-1111-1111-111111111111";

async function getAdminToken(): Promise<string | null> {
  const token = process.env.ADMIN_USER_TOKEN?.trim();
  return token || null;
}

async function adminGet(request: any, path: string) {
  const token = await getAdminToken();
  test.skip(!token, "ADMIN_USER_TOKEN is required");
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPost(request: any, path: string, options: Record<string, unknown>) {
  const token = await getAdminToken();
  test.skip(!token, "ADMIN_USER_TOKEN is required");
  return request.post(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...options,
  });
}

async function adminPatch(request: any, path: string, options: Record<string, unknown>) {
  const token = await getAdminToken();
  test.skip(!token, "ADMIN_USER_TOKEN is required");
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

async function getProductForm(request: any, id: string) {
  const response = await adminGet(request, `/v1/admin/products/${id}/form`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe("Admin Product API @api", () => {
  test("UC-PROD-01 reviews catalog state for triage", async ({ request }) => {
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

  test("UC-PROD-05 exposes product-linked card inventory in product context", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/cards");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.cards)
        ? payload.cards
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

    expect(Array.isArray(items)).toBeTruthy();
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("product_id");
    }
  });
});
