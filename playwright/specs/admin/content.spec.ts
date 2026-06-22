import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Content @admin P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-CONT-01 renders the media library as a shared reusable content source", async ({ page }) => {
    // GOAL: Admin Curates Media Library: giữ một thư viện media có thể tái sử dụng an toàn trên nhiều bề mặt nội dung.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-01 Main flow
    await page.goto("/admin/media", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Media Management" })).toBeVisible();
    await expect(page.getByText(/central library for upload, reuse, and protection/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload image" })).toBeVisible();
    await expect(page.getByText(/delete guard on for referenced media/i)).toBeVisible();
  });

  test("UC-CONT-02 renders banner presence controls by page context", async ({ page }) => {
    // GOAL: Admin Maintains Banner Presence: quyết định banner nào đang đại diện cho một page context cụ thể.
    // PRIORITY: P2
    // RELATED DOMAINS: store-setting
    // SCENARIO: SC-CONT-02 Main flow
    await page.goto("/admin/banners", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Banner Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Homepage" })).toBeVisible();
    await expect(page.getByRole("button", { name: "About-Us" })).toBeVisible();
    await expect(page.getByText(/choose the active banner set per page/i)).toBeVisible();
    await expect(page.getByText("Public preview")).toBeVisible();
  });

  test("UC-CONT-03 renders draft and published article management semantics", async ({ page }) => {
    // GOAL: Admin Publishes Editorial Articles: tạo, chỉnh, và xuất bản bài viết như một knowledge/public content stream.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-03 Main flow
    await page.goto("/admin/articles", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Article Management" })).toBeVisible();
    const articleStatusFilters = page
      .getByTestId("articles-list-container")
      .locator("div.flex.flex-wrap.items-center.gap-2");
    await expect(articleStatusFilters.getByText("Published", { exact: true })).toBeVisible();
    await expect(articleStatusFilters.getByText("Draft", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
    await expect(page.getByText(/draft remains hidden until you publish changes/i)).toBeVisible();
  });

  test("UC-CONT-04 renders FAQ ordering and public-visibility rules", async ({ page }) => {
    // GOAL: Admin Maintains FAQ Knowledge: giữ tập FAQ phản ánh đúng knowledge mà storefront cần trả lời công khai.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-04 Main flow
    await page.goto("/admin/faqs", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "FAQ Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: /active/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /draft/i })).toBeVisible();
    await expect(page.getByText(/public reflection/i)).toBeVisible();
    await expect(page.getByText(/active faqs are sorted by display order/i)).toBeVisible();
  });

  test("UC-CONT-05 renders About narrative editing separately from banner ownership", async ({ page }) => {
    // GOAL: Admin Maintains About Narrative: giữ phần About như company narrative chính thức của storefront.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-CONT-05 Main flow
    await page.goto("/admin/about", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "About-Us Content" })).toBeVisible();
    await expect(page.getByText(/banner ownership stays in banner management/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Company introduction" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gallery order" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save page" })).toBeVisible();
  });

  test("UC-CONT-06 renders product editorial controls separately from catalog editing", async ({ page }) => {
    // GOAL: Admin Maintains Product Editorial Content: làm giàu product detail bằng media và rich content mà không đổi commercial state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-CONT-06 Main flow
    await page.goto("/admin/product-content", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Product Media & Content" })).toBeVisible();
    await expect(page.getByText(/without drifting into core catalog editing/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Media", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rich content" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save content" })).toBeVisible();
  });
});
