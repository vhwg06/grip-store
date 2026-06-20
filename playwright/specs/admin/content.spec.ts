import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Content @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-CONT-01 renders the media library as a shared reusable content source", async ({ page }) => {
    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Media Management" })).toBeVisible();
    await expect(page.getByText(/central library for upload, reuse, and protection/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload image" })).toBeVisible();
    await expect(page.getByText(/delete guard on for referenced media/i)).toBeVisible();
  });

  test("UC-CONT-02 renders banner presence controls by page context", async ({ page }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Banner Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Homepage" })).toBeVisible();
    await expect(page.getByRole("button", { name: "About-Us" })).toBeVisible();
    await expect(page.getByText(/choose the active banner set per page/i)).toBeVisible();
    await expect(page.getByText("Public preview")).toBeVisible();
  });

  test("UC-CONT-03 renders draft and published article management semantics", async ({ page }) => {
    await page.goto("/admin/articles");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Article Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: /published/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /draft/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
    await expect(page.getByText(/draft remains hidden until you publish changes/i)).toBeVisible();
  });

  test("UC-CONT-04 renders FAQ ordering and public-visibility rules", async ({ page }) => {
    await page.goto("/admin/faqs");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "FAQ Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: /active/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /draft/i })).toBeVisible();
    await expect(page.getByText(/public reflection/i)).toBeVisible();
    await expect(page.getByText(/active faqs are sorted by display order/i)).toBeVisible();
  });

  test("UC-CONT-05 renders About narrative editing separately from banner ownership", async ({ page }) => {
    await page.goto("/admin/about");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "About-Us Content" })).toBeVisible();
    await expect(page.getByText(/banner ownership stays in banner management/i)).toBeVisible();
    await expect(page.getByText("Company introduction")).toBeVisible();
    await expect(page.getByText("Gallery order")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save page" })).toBeVisible();
  });

  test("UC-CONT-06 renders product editorial controls separately from catalog editing", async ({ page }) => {
    await page.goto("/admin/product-content");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Product Media & Content" })).toBeVisible();
    await expect(page.getByText(/without drifting into core catalog editing/i)).toBeVisible();
    await expect(page.getByText("Media")).toBeVisible();
    await expect(page.getByText("Rich content")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save content" })).toBeVisible();
  });
});
