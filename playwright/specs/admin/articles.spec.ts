import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Articles – CRUD @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    await page.goto("/admin/articles", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  test("should support complete CRUD flow for articles and About ownership", async ({ page, request }) => {
    const adminToken = await getAdminToken(request);
    const settingsResponse = await request.get(`${BACKEND_URL}/v1/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const settingsPayload = await settingsResponse.json();
    const settingsList = Array.isArray(settingsPayload?.data) ? settingsPayload.data : [];
    const previousAboutOwner = settingsList.find((item: any) => item.key === "about_article_id")?.value ?? "";

    const previousAboutResponse = await request.get(`${BACKEND_URL}/v1/public/content/pages/about`);
    const previousAboutPayload = await previousAboutResponse.json();
    const previousAbout = previousAboutPayload?.data ?? previousAboutPayload;

    const title = `About Linked Article E2E ${Date.now()}`;
    const slug = `about-linked-article-${Date.now()}`;
    const body = `<p>This is dynamic body content for the linked article E2E test.</p>`;
    let createdArticleId: string | null = null;

    try {
      await expect(page.locator("h1")).toContainText(/Article Management|Quản lý Bài viết/);

      await page.click('a[href="/admin/article/new"]');
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      await page.locator("#title").fill(title);
      await page.locator("#slug").fill(slug);
      await page.locator("#excerpt").fill("Short summary of the E2E test article.");
      await page.locator('[data-testid="editor-mode-markdown"]').click();
      await page.locator("#content").fill(body);
      await page.locator("#author").fill("QA Author");
      await page.locator("#tags").fill("E2E, Testing");
      await page.locator('[data-testid="article-about-owner-control"]').click();

      await page.click('button:has-text("Publish changes"), button:has-text("Save article")');
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/articles\/?\?articleId=/);

      const currentUrl = new URL(page.url());
      createdArticleId = currentUrl.searchParams.get("articleId");
      expect(createdArticleId).toBeTruthy();

      const publicAboutResponse = await request.get(`${BACKEND_URL}/v1/public/content/pages/about`);
      const publicAboutPayload = await publicAboutResponse.json();
      const publicAbout = publicAboutPayload?.data ?? publicAboutPayload;
      expect(publicAbout.title).toBe(title);
      expect(publicAbout.body).toContain("dynamic body content");

      const selectedControl = page.locator('[data-testid="article-about-owner-control"]');
      await expect(selectedControl).toContainText("Use this article as About");

      page.once("dialog", (d) => d.accept());
      await page.locator('button:has(.lucide-trash2)').first().click();
      await page.waitForLoadState("networkidle", { timeout: 10000 });
      createdArticleId = null;
    } finally {
      await request.put(`${BACKEND_URL}/v1/admin/settings/about_article_id`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { value: previousAboutOwner },
      });

      await request.patch(`${BACKEND_URL}/v1/content/pages/about`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          title: previousAbout.title ?? "Về GRIP",
          slug: "about",
          body: previousAbout.body ?? "",
          gallery: previousAbout.gallery ?? [],
          template_key: previousAbout.template_key ?? "about-us",
          status: previousAbout.status ?? "published",
        },
      });

      if (createdArticleId) {
        await request.delete(`${BACKEND_URL}/v1/content/articles/${createdArticleId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    }
  });

  test("should support previewing articles in storefront simulated modal", async ({ page }) => {
    const previewBtn = page.locator('[data-testid="article-preview-btn"]').first();
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    const modal = page.locator('[data-testid="article-preview-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('[data-testid="preview-title"]')).toBeVisible();

    await modal.locator('[data-testid="close-preview-btn"]').click();
    await expect(modal).toBeHidden();
  });

  test("should support toggling editor modes", async ({ page }) => {
    await page.click('a[href="/admin/article/new"]');
    await page.waitForLoadState("networkidle");

    const visualTab = page.locator('[data-testid="editor-mode-visual"]');
    const markdownTab = page.locator('[data-testid="editor-mode-markdown"]');
    await expect(visualTab).toBeVisible();
    await expect(markdownTab).toBeVisible();

    await markdownTab.click();
    await expect(page.locator('#content')).toBeVisible();

    await visualTab.click();
    await expect(page.locator('.tiptap')).toBeVisible();
  });
});
