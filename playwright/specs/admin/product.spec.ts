import { test, expect } from "../../src/fixtures/base-test";
import { getAdminToken as getPlaywrightAdminToken } from "../../src/api-helpers/auth.helpers";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";
const DEFAULT_CATEGORY_ID = "a1111111-1111-1111-1111-111111111111";

async function createProductViaApi(request: any, suffix: string) {
  const token = await getPlaywrightAdminToken(request);

  const response = await request.post(`${BACKEND_URL}/v1/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `Playwright FE ${suffix}`,
      sku: `PW-FE-${suffix}`,
      price: 12345,
      category_id: DEFAULT_CATEGORY_ID,
      is_active: true,
    },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload.data as { id: string; title: string };
}

async function createCategoryViaApi(request: any, suffix: string, position: number) {
  const token = await getPlaywrightAdminToken(request);

  const response = await request.post(`${BACKEND_URL}/v1/admin/categories`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      name: `playwright-fe-cat-${suffix}`,
      slug: `playwright-fe-cat-${suffix}`,
      position: String(position),
    },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload.data as { id: string; name: string; position: number };
}

test.describe("Admin Product @admin P1", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("products");
  });

  test("UC-PROD-01 renders catalog triage and can open product context", async ({ page }) => {
    // GOAL: Admin Reviews Product Catalog: hiểu catalog hiện tại để chọn sản phẩm cần tạo mới, chỉnh sửa, sắp xếp, hoặc kiểm tra.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-01 Main flow
    await expect(page.getByRole("heading", { name: "Product Management" })).toBeVisible();
    await expect(page.locator('[data-testid="admin-table"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Visible" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hidden" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Low stock" })).toBeVisible();

    const rows = page.locator('[data-testid="admin-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    await rows.first().locator('[data-testid="edit-btn"]').click();
    await expect(page).toHaveURL(/\/admin\/product\/edit/);
  });

  test("UC-PROD-06 renders health-signal review surfaces", async ({ page, request }) => {
    // GOAL: Admin Reviews Product Health Signals: nhận diện product nào đang cần chú ý vì thiếu media, low stock, hidden state, hoặc commercial inconsistency.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-06 Main flow
    const token = await getPlaywrightAdminToken(request);

    const response = await request.get(`${BACKEND_URL}/v1/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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

    await expect(page.getByText("Active SKUs", { exact: true })).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Low stock" }).first()).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Hidden" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Low stock" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hidden" })).toBeVisible();
  });

  test("UC-PROD-02 creates a product draft from the admin create flow", async ({ page, request }) => {
    // GOAL: Admin Creates A Product: đưa một product mới vào catalog với business meaning đầy đủ.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-02 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const token = await getPlaywrightAdminToken(request);

    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await page.locator('[data-testid="field-title"]').fill(`Playwright Draft ${suffix}`);
    await page.locator('[data-testid="field-price"]').fill("12345");
    await page.locator("#slug").fill(`playwright-draft-${suffix}`);
    await page.locator("#category").fill("Test Gift Cards");
    await page.locator('[data-testid="field-description"]').fill("created from FE");
    await page.locator('[data-testid="save-btn"]').click();

    await expect(page).toHaveURL(/\/admin\/product\/edit\/placeholder\?id=/);
    await expect(page.locator('[data-testid="field-title"]')).toHaveValue(`Playwright Draft ${suffix}`);

    const productId = new URL(page.url()).searchParams.get("id");
    expect(productId).toBeTruthy();

    const verify = await page.request.get(`${BACKEND_URL}/v1/admin/products/${productId}/form`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(verify.ok()).toBeTruthy();
    const formPayload = await verify.json();
    expect(formPayload.product.title).toContain(suffix);
  });

  test("UC-PROD-03 submits commercial state changes from the list quick action", async ({ page, request }) => {
    // GOAL: Admin Updates Product Commercial State: thay đổi nội dung hoặc trạng thái thương mại của product đang có.
    // PRIORITY: P1
    // RELATED DOMAINS: review
    // SCENARIO: SC-PROD-03 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProductViaApi(request, suffix);
    const token = await getPlaywrightAdminToken(request);

    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`[data-item-id="${created.id}"]`);
    await expect(row).toBeVisible();
    await row.locator('[data-testid="toggle-btn"]').click();
    await page.waitForLoadState("networkidle");

    const response = await request.get(`${BACKEND_URL}/v1/admin/products/${created.id}/form`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.product.is_active).toBe(false);

    await row.locator('[data-testid="toggle-btn"]').click();
    await page.waitForLoadState("networkidle");

    const revertResponse = await request.get(`${BACKEND_URL}/v1/admin/products/${created.id}/form`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(revertResponse.ok()).toBeTruthy();
    const revertedPayload = await revertResponse.json();
    expect(revertedPayload.product.is_active).toBe(true);
  });

  test("UC-PROD-04 submits category reordering semantics from the admin editor", async ({ page, request }) => {
    // GOAL: Admin Maintains Category Structure: giữ category tree đúng để catalog có cấu trúc thương mại rõ ràng.
    // PRIORITY: P1
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-04 Main flow
    const upper = await createCategoryViaApi(request, `${Date.now()}-a`, 20);
    const lower = await createCategoryViaApi(request, `${Date.now()}-b`, 30);
    const token = await getPlaywrightAdminToken(request);

    await page.goto("/admin/categories");
    await page.waitForLoadState("networkidle");

    await page.getByRole("heading", { name: new RegExp(`${lower.name}$`) }).click();
    await page.locator("#cat-sort").fill("1");
    const saveResponse = page.waitForResponse((response) =>
      response.url().includes("/v1/admin/categories") &&
      response.request().method() === "POST" &&
      response.ok(),
    );
    await page.getByRole("button", { name: "Save Changes" }).click();
    await saveResponse;
    await expect
      .poll(async () => {
        const response = await request.get(`${BACKEND_URL}/v1/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.ok()).toBeTruthy();
        const payload = await response.json();
        const moved = (payload.data as Array<Record<string, unknown>>).find((item) => item.id === lower.id);
        return moved?.position;
      })
      .toBe(1);

    expect(upper.position).toBe(20);
  });
});
