import { test, expect } from "../../src/fixtures/base-test";

test.describe("About Page @content", () => {
  test("should render about page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    // About page should have title or content
    const title = page.locator(
      '[data-testid="about-title"], h1'
    );
    await expect(title).toBeVisible();
  });

  test("should display company information", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    const content = page.locator('[data-testid="about-content"]');
    if (await content.isVisible()) {
      await expect(content).not.toBeEmpty();
    }
  });

  test("should show gallery when available", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    const gallery = page.locator('[data-testid="about-gallery"]');
    if (await gallery.isVisible()) {
      const images = page.locator('[data-testid="about-gallery-image"]');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
