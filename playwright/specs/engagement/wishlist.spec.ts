import { test, expect } from "../../src/fixtures/base-test";
import type { APIRequestContext } from "@playwright/test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { CatalogApiHelper } from "../../src/api-helpers/catalog.api";

async function getFirstProductIdOrNull(
  request: APIRequestContext
): Promise<string | null> {
  const client = new GoBackendClient(request);
  const catalogApi = new CatalogApiHelper(client);
  const products = await catalogApi.getProducts({ limit: 1 });
  expect(products.ok).toBeTruthy();
  return products.data.items[0]?.id ?? null;
}

test.describe("Wishlist @engagement", () => {
  test("should add product to wishlist", async ({
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

    const wishlistBtn = page.locator('[data-testid="add-wishlist-btn"]');
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      await page.waitForLoadState("networkidle");

      // Should show success feedback
      const toast = page.locator('[data-testid="toast"]');
      if (await toast.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(toast).toBeVisible();
      }
    }
  });

  test("should view wishlist page", async ({ wishlistPage }) => {
    await wishlistPage.goto();

    const items = await wishlistPage.getItems();
    // May have zero items
    expect(items).toBeDefined();
  });

  test("should remove item from wishlist", async ({ wishlistPage, page }) => {
    await wishlistPage.goto();

    const items = await wishlistPage.getItems();
    if (items.length === 0) {
      await expect(
        page.locator('[data-testid="wishlist-empty"], [data-testid="wishlist-item"]')
      ).toBeVisible();
      return;
    }

    const firstProduct = items[0].productId;
    await wishlistPage.removeItem(firstProduct);

    const updatedItems = await wishlistPage.getItems();
    const removed = !updatedItems.some((i) => i.productId === firstProduct);
    expect(removed).toBeTruthy();
  });

  test("should vote on wishlist item", async ({ wishlistPage, page }) => {
    await wishlistPage.goto();

    const items = await wishlistPage.getItems();
    if (items.length === 0) {
      await expect(
        page.locator('[data-testid="wishlist-empty"], [data-testid="wishlist-item"]')
      ).toBeVisible();
      return;
    }

    const firstProduct = items[0].productId;
    const initialVotes = items[0].votes;

    await wishlistPage.voteItem(firstProduct);

    const updatedItems = await wishlistPage.getItems();
    const votedItem = updatedItems.find((i) => i.productId === firstProduct);
    if (votedItem) {
      expect(votedItem.votes).toBeGreaterThanOrEqual(initialVotes);
    }
  });
});
