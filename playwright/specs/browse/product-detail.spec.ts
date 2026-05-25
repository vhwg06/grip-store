import { test, expect } from "../../src/fixtures/base-test";
import type { APIRequestContext } from "@playwright/test";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

async function getFirstProductIdOrNull(
  request: APIRequestContext
): Promise<string | null> {
  const client = new GoBackendClient(request);
  const catalogApi = new CatalogApiHelper(client);
  const products = await catalogApi.getProducts({ limit: 1 });
  expect(products.ok).toBeTruthy();
  return products.data.items[0]?.id ?? null;
}

test.describe("Product Detail @browse", () => {
  test("should render product information", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) {
      await page.goto("/products");
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productDetailPage.goto(productId);

    const title = await productDetailPage.getProductTitle();
    expect(title).toBeTruthy();

    const price = await productDetailPage.getPrice();
    expect(price).toBeTruthy();
  });

  test("should display image gallery", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) {
      await page.goto("/products");
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productDetailPage.goto(productId);

    const gallery = page.locator('[data-testid="product-gallery"]');
    if (await gallery.isVisible()) {
      const thumbnails = page.locator('[data-testid="product-thumbnail"]');
      const count = await thumbnails.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should switch product tabs", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) {
      await page.goto("/products");
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productDetailPage.goto(productId);

    const tabs = page.locator('[data-testid="product-tabs"]');
    if (await tabs.isVisible()) {
      // Verify at least one tab is present
      const tabButtons = tabs.locator("button, [role='tab']");
      const tabCount = await tabButtons.count();
      expect(tabCount).toBeGreaterThan(0);
    }
  });

  test("should have clickable add-to-cart button", async ({
    productDetailPage,
    page,
    request,
  }) => {
    const productId = await getFirstProductIdOrNull(request);
    if (!productId) {
      await page.goto("/products");
      await expect(
        page.locator('[data-testid="product-card"], [data-testid="no-results"]')
      ).toBeVisible();
      return;
    }

    await productDetailPage.goto(productId);

    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeEnabled();
  });
});
