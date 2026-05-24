import { test, expect } from "../../src/fixtures/base-test";

test.describe("Homepage @browse", () => {
  test.beforeEach(async ({ homepagePage }) => {
    await homepagePage.goto();
  });

  test("should display hero section with title", async ({ page }) => {
    const heroTitle = page.locator('[data-testid="hero-title"]');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).not.toBeEmpty();
  });

  test("should display category icons", async ({ page }) => {
    const icons = page.locator('[data-testid="category-icon"]');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display featured product blocks", async ({ homepagePage }) => {
    const products = await homepagePage.getFeaturedProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  test("should display announcement banner when active", async ({
    homepagePage,
  }) => {
    const announcement = await homepagePage.getAnnouncement();
    // Announcement may or may not be active — just verify no crash
    if (announcement !== null) {
      expect(announcement.length).toBeGreaterThan(0);
    }
  });

  test("should navigate to product list from category icon", async ({
    page,
  }) => {
    const firstIcon = page.locator('[data-testid="category-icon"]').first();
    if ((await firstIcon.count()) > 0) {
      await firstIcon.click();
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/\/buy/);
    }
  });
});
