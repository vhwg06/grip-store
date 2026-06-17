import { test, expect } from "../../src/fixtures/base-test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

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

  // ── Banner image rendering ─────────────────────────────────────────────
  //
  // WHAT THIS TESTS:
  //   When the backend homepage API returns a banner block with an image URL,
  //   the hero section must render an <img> whose src attribute is that URL.
  //
  // WHY THE OLD TEST WAS WRONG:
  //   The old full-flow test checked `expect(src).toContain('/static/uploads/')`.
  //   R2 images have URLs like https://pub-xxx.r2.dev/uuid.png – they NEVER
  //   contain '/static/uploads/'. This assertion always failed in real usage
  //   but the test was marked as conditional (would pass if no banner existed).
  //
  // WHY toBeVisible() IS NOT ENOUGH:
  //   Playwright's toBeVisible() only checks DOM visibility (display !== none,
  //   opacity > 0, etc.). A broken <img src=""> or <img src="blob:..."> that
  //   has expired is still "visible". This test specifically asserts that:
  //     1. The img element is in the DOM and visible
  //     2. The src attribute matches the R2 public URL from the backend
  //     3. The URL is NOT a blob:// or empty string

  test("hero banner renders correct R2 image URL from backend", async ({ page }) => {
    const r2Url = "https://pub-test.r2.dev/hero-banner-test.png";

    // Inject a seeded banner block into the homepage API response
    await page.route("**/v1/public/homepage**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              block_type: "banner",
              is_active: true,
              config: {
                slides: [
                  {
                    id: "slide-test-1",
                    title: "Hero Banner Test Title",
                    subtitle: "Subtitle",
                    image: r2Url,
                    cta_text: "Xem ngay",
                    cta_link: "/products",
                    sort_order: 0,
                  },
                ],
              },
            },
          ],
        }),
      });
    });

    // Serve the image so it doesn't result in a network error
    await page.route(r2Url, (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: tinyPng })
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hero must be visible with the right title
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="hero-title"]').filter({ hasText: "Hero Banner Test Title" })
    ).toBeVisible({ timeout: 10_000 });

    // The <img> inside the hero must have the R2 URL as src
    const heroImg = page.locator('[data-testid="hero"] img').first();
    await expect(heroImg).toBeVisible({ timeout: 10_000 });

    const src = await heroImg.getAttribute("src");
    expect(src, "hero img src must not be empty").toBeTruthy();
    expect(
      decodeURIComponent(src!),
      "hero img src must be the R2 public URL (not blob://, not empty)"
    ).toBe(r2Url);
  });
});
