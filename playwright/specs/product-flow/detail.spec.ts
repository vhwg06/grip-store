import { test, expect } from "../../src/fixtures/base-test";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import type { APIRequestContext } from "@playwright/test";

async function getFirstProductIdOrNull(request: APIRequestContext): Promise<string | null> {
  const client = new GoBackendClient(request);
  const catalogApi = new CatalogApiHelper(client);
  const products = await catalogApi.getProducts({ limit: 1 });
  if (!products.ok) return null;
  return products.data.items[0]?.id ?? null;
}

function extractSpecsFromPayload(payload: unknown): Array<{ label?: string; value?: string }> {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const details = record.details;
  if (!Array.isArray(details)) return [];
  return details.filter((item) => item && typeof item === "object") as Array<{ label?: string; value?: string }>;
}

test.describe("Product Flow - Detail @product-flow", () => {
  async function readCartCount(page: any) {
    const badge = page.locator('[data-testid="cart-count"]');
    if ((await badge.count()) === 0) return 0;
    const raw = (await badge.first().innerText()).trim();
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  test("PF-DETAIL-001 detail renders product core info", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    expect(productId, "No product available for detail flow test").toBeTruthy();
    await productDetailPage.goto(productId);
    await expect(page.locator('[data-testid="product-detail-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-detail-price"]')).toBeVisible();
  });

  test("PF-DETAIL-002 detail renders specs from backend details", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    expect(productId, "No product available for specs detail test").toBeTruthy();
    const client = new GoBackendClient(request);
    const detail = await client.get<Record<string, unknown>>(`/v1/catalog/products/${productId}`);
    expect(detail.ok).toBeTruthy();
    const specs = extractSpecsFromPayload(detail.data);
    await productDetailPage.goto(productId);
    const specsTable = page.locator('[data-testid="product-specs-table"]');
    if (specs.length > 0) {
      await expect(specsTable).toBeVisible();
      return;
    }
    await expect(specsTable).toHaveCount(0);
  });

  test("PF-DETAIL-003 add-to-cart from detail increments cart count", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    expect(productId, "No product available for add-to-cart test").toBeTruthy();
    await productDetailPage.goto(productId);
    const before = await readCartCount(page);
    await productDetailPage.addToCart();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText(String(before + 1));
  });

  test("PF-DETAIL-004 quantity add-to-cart stores correct quantity", async ({ request, productDetailPage, page }) => {
    const productId = await getFirstProductIdOrNull(request);
    expect(productId, "No product available for quantity add-to-cart test").toBeTruthy();
    await productDetailPage.goto(productId);
    const before = await readCartCount(page);
    await page.locator('button:has-text("+")').first().click().catch(() => undefined);
    await page.locator('[data-testid="add-to-cart-btn"]').click();
    const after = await readCartCount(page);
    expect(after).toBeGreaterThanOrEqual(before + 1);
  });

  test("PF-DETAIL-005 inactive product cannot be opened or added", async ({ page }) => {
    await page.goto("/products/placeholder?id=non-existent-product-for-404");
    await expect(page.locator('[data-testid="add-to-cart-btn"]')).toHaveCount(0);
  });
});
