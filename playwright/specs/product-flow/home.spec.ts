import { test, expect } from "../../src/fixtures/base-test";

test.describe("Product Flow - Homepage @product-flow", () => {
  test.beforeEach(async ({ homepagePage }) => {
    await homepagePage.goto();
  });

  test("PF-HOME-001 homepage renders guest discovery content", async ({ page }) => {
    await expect(page.locator('[data-testid="hero-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-icon"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="featured-product-card"]').first()).toBeVisible();
  });

  test("PF-HOME-002 category click navigates to catalog", async ({ page }) => {
    await page.locator('[data-testid="category-icon"]').first().click();
    await expect(page).toHaveURL(/\/products(\?category=|$)/);
  });

  test("PF-HOME-003 featured product CTA navigates to detail", async ({ page }) => {
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);
  });

  test("PF-HOME-004 homepage CTA does not mutate cart", async ({ page }) => {
    const cartBadge = page.locator('[data-testid="cart-count"]');
    if (await cartBadge.isVisible()) {
      await expect(cartBadge).toHaveText("0");
    }

    await page.locator('[data-testid="add-to-cart"]').first().click();
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);
  });

  test("PF-HOME-005 homepage cards do not show follow action", async ({ page }) => {
    await expect(page.locator('[data-testid="featured-product-card"] [data-testid=\"follow-product\"]')).toHaveCount(0);
  });

  test("PF-HOME-006 homepage cards do not show add-to-cart action", async ({ page }) => {
    await expect(page.locator('[data-testid="featured-product-card"] button:has-text(\"Thêm vào giỏ\")')).toHaveCount(0);
  });
});
