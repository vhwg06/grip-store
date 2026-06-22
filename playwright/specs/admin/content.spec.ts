import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Content @admin P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-CONT-01 keeps media selection available as shared internal tooling", async ({ page }) => {
    await page.goto("/admin/settings", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.locator('[data-testid="settings-brand-logo-open-media-picker"]')).toBeVisible();
    await page.locator('[data-testid="settings-brand-logo-open-media-picker"]').click();
    await expect(page.locator('[data-testid="media-picker-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="media-picker-item"]').first()).toBeVisible();
  });

  test("UC-CONT-02 renders banner ownership and storefront visibility inside banner management", async ({ page }) => {
    await page.goto("/admin/banners", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Banner Management" })).toBeVisible();
    await expect(page.locator('[data-testid="banner-presence-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="banner-presence-toggle"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Homepage" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Products" })).toBeVisible();
  });

  test("UC-CONT-03 and UC-CONT-05 keep article publishing and About ownership in one flow", async ({ page }) => {
    await page.goto("/admin/articles", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Article Management" })).toBeVisible();
    await expect(page.locator('[data-testid="articles-list-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="article-about-owner-control"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  });

  test("UC-CONT-04 renders FAQ ordering and public-visibility rules", async ({ page }) => {
    await page.goto("/admin/faqs", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "FAQ Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: /active/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /draft/i })).toBeVisible();
    await expect(page.getByText(/public reflection/i)).toBeVisible();
  });

  test("UC-CONT-06 keeps product editorial/media work inside product editor context", async ({ page }) => {
    await page.goto("/admin/products", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Product Management" })).toBeVisible();
    await expect(page.locator('[data-testid="create-btn"]')).toBeVisible();
    await expect(page.getByText(/quick access to full product editing/i)).toBeVisible();
    await expect(page.locator('[data-testid="edit-btn"]').first()).toBeVisible();
  });
});
