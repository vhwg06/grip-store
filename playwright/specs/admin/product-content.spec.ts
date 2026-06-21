import { test, expect } from "../../src/fixtures/base-test";
import { getAdminToken } from "../../src/api-helpers/auth.helpers";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";
const DEFAULT_CATEGORY_ID = "a1111111-1111-1111-1111-111111111111";

async function createProductViaApi(request: any, suffix: string) {
  const token = await getAdminToken(request);

  const response = await request.post(`${BACKEND_URL}/v1/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `Playwright Cards ${suffix}`,
      sku: `PW-CARDS-${suffix}`,
      price: 12345,
      category_id: DEFAULT_CATEGORY_ID,
      is_active: true,
    },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload.data as { id: string; title: string; sku: string };
}

test.describe("Admin Product Content @admin P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-PROD-05 opens a product-linked card flow from product context", async ({ page, request }) => {
    // GOAL: Admin Manages Product-Linked Cards: quản lý card hoặc inventory-like artifact gắn với một product.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-05 Main flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProductViaApi(request, suffix);

    await page.goto(`/admin/product/edit/placeholder?id=${created.id}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="product-linked-cards-btn"]')).toBeVisible();
    await page.locator('[data-testid="product-linked-cards-btn"]').click();
    await expect(page).toHaveURL(new RegExp(`/admin/cards\\?productId=${created.id}`));
    await expect(page.locator('[data-testid="product-cards-context"]')).toContainText(created.title);
    await expect(page.locator('[data-testid="product-cards-context"]')).toContainText(created.id);

    const emptyState = page.locator('[data-testid="product-cards-empty"]');
    const table = page.locator('[data-testid="product-cards-table"]');
    await expect(emptyState.or(table)).toBeVisible();

    if (await table.isVisible()) {
      const rows = table.locator('[data-testid="product-card-row"]');
      const count = await rows.count();
      for (let index = 0; index < count; index += 1) {
        await expect(rows.nth(index)).toHaveAttribute("data-product-id", created.id);
      }
    }
  });

  test("UC-PROD-05 shows an explicit backend error when linked cards cannot be loaded", async ({ page, request }) => {
    // GOAL: Admin Manages Product-Linked Cards: quản lý card hoặc inventory-like artifact gắn với một product.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-PROD-05 Exception flow
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = await createProductViaApi(request, suffix);

    await page.route("**/v1/admin/cards", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "cards_backend_unavailable" }),
      });
    });

    await page.goto(`/admin/product/edit/placeholder?id=${created.id}`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-testid="product-linked-cards-btn"]').click();

    await expect(page.locator('[data-testid="product-cards-context"]')).toContainText(created.id);
    await expect(page.locator('[data-testid="product-cards-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-cards-error"]')).toContainText("cards_backend_unavailable");
    await expect(page.locator('[data-testid="product-cards-empty"]')).toHaveCount(0);
  });
});
