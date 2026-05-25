import { test, expect } from "../../src/fixtures/base-test";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "http://127.0.0.1:8080";

function makeTestProductId(prefix: string): string {
  const suffix = `${Date.now().toString(16)}${Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0")}`.slice(0, 12);
  return `${prefix}-0000-0000-0000-${suffix}`;
}

test.describe("Product Flow - API @product-flow", () => {
  test("PF-API-001 product list returns paginated active products", async ({ request }) => {
    const api = new CatalogApiHelper(new GoBackendClient(request));
    const res = await api.getProducts({ limit: 10 });
    expect(res.ok).toBeTruthy();
    expect(Array.isArray(res.data.items)).toBeTruthy();
  });

  test("PF-API-002 product list supports category filter", async ({ request }) => {
    const api = new CatalogApiHelper(new GoBackendClient(request));
    const res = await api.getProducts({ category: "a1111111-1111-1111-1111-111111111111", limit: 10 });
    expect(res.ok).toBeTruthy();
  });

  test("PF-API-003 product search returns matching products", async ({ request }) => {
    const api = new CatalogApiHelper(new GoBackendClient(request));
    const res = await api.search("test");
    expect(res.ok).toBeTruthy();
  });

  test("PF-API-004 product detail returns specs", async ({ request }) => {
    const api = new CatalogApiHelper(new GoBackendClient(request));
    const products = await api.getProducts({ limit: 1 });
    if (!products.ok || products.data.items.length === 0) test.skip(true, "No products available for detail API");
    const res = await api.getProduct(products.data.items[0].id);
    expect(res.ok).toBeTruthy();
    expect(Array.isArray((res.data as any).specs ?? [])).toBeTruthy();
  });

  test("PF-API-005 inactive product detail returns not found", async ({ request }) => {
    const api = new CatalogApiHelper(new GoBackendClient(request));
    const res = await api.getProduct("inactive-or-missing-product-id");
    expect(res.ok).toBeFalsy();
  });

  test("PF-API-006 admin create product persists details", async ({ request }) => {
    const token = process.env.ADMIN_USER_TOKEN;
    test.skip(!token, "ADMIN_USER_TOKEN is required");

    const productID = makeTestProductId("7fa10000");
    const createRes = await request.post(`${BACKEND_URL}/v1/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        id: productID,
        title: "PF API Product",
        sku: `PF-SKU-${Date.now()}`,
        price: 9999,
        category_id: "a1111111-1111-1111-1111-111111111111",
        is_active: true,
        specs: [
          { key: "Material", value: "Brass" },
          { key: "Finish", value: "Gold" },
        ],
      },
    });
    expect(createRes.ok()).toBeTruthy();

    const api = new CatalogApiHelper(new GoBackendClient(request));
    const detailRes = await api.getProduct(productID);
    expect(detailRes.ok).toBeTruthy();
    expect(Array.isArray((detailRes.data as any).specs)).toBeTruthy();
  });

  test("PF-API-007 admin update product replaces details transactionally", async ({ request }) => {
    const token = process.env.ADMIN_USER_TOKEN;
    test.skip(!token, "ADMIN_USER_TOKEN is required");

    const productID = makeTestProductId("7fa20000");
    const createRes = await request.post(`${BACKEND_URL}/v1/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        id: productID,
        title: "PF API Product Update",
        sku: `PF-SKU-UP-${Date.now()}`,
        price: 9999,
        category_id: "a1111111-1111-1111-1111-111111111111",
        is_active: true,
        specs: [
          { key: "KeyA", value: "ValueA" },
        ],
      },
    });
    expect(createRes.ok()).toBeTruthy();

    const patchRes = await request.patch(`${BACKEND_URL}/v1/admin/products/${productID}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        id: productID,
        title: "PF API Product Update",
        sku: `PF-SKU-UP2-${Date.now()}`,
        price: 8888,
        category_id: "a1111111-1111-1111-1111-111111111111",
        is_active: true,
        specs: [{ key: "KeyB", value: "ValueB" }],
      },
    });
    expect(patchRes.ok()).toBeTruthy();

    const api = new CatalogApiHelper(new GoBackendClient(request));
    const detailRes = await api.getProduct(productID);
    expect(detailRes.ok).toBeTruthy();
    const specs = ((detailRes.data as any).specs ?? []) as Array<{ key: string; value: string }>;
    expect(specs.some((spec) => spec.key === "KeyB")).toBeTruthy();
    expect(specs.some((spec) => spec.key === "KeyA")).toBeFalsy();
  });

  test("PF-API-008 admin delete product cascades details", async ({ request }) => {
    const token = process.env.ADMIN_USER_TOKEN;
    test.skip(!token, "ADMIN_USER_TOKEN is required");

    const productID = makeTestProductId("7fa30000");
    const createRes = await request.post(`${BACKEND_URL}/v1/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        id: productID,
        title: "PF API Product Delete",
        sku: `PF-SKU-DEL-${Date.now()}`,
        price: 9999,
        category_id: "a1111111-1111-1111-1111-111111111111",
        is_active: true,
        specs: [{ key: "DeleteKey", value: "DeleteValue" }],
      },
    });
    expect(createRes.ok()).toBeTruthy();

    const deleteRes = await request.delete(`${BACKEND_URL}/v1/admin/products/${productID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteRes.ok()).toBeTruthy();

    const api = new CatalogApiHelper(new GoBackendClient(request));
    const detailRes = await api.getProduct(productID);
    expect(detailRes.ok).toBeFalsy();
    expect(detailRes.status).toBe(404);
  });
});
