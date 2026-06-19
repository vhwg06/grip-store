import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Articles – CRUD @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    // Navigate to Articles
    await page.goto("/admin/articles");
    await page.waitForLoadState("networkidle");
  });

  test("should support complete CRUD flow for articles", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Quản lý Tin tức");

    // 1. Create Article
    await page.click('a[href="/admin/article/new"]');
    await page.waitForLoadState("networkidle");

    await page.locator("#title").fill("E2E Test Article Title");
    await page.locator("#slug").fill("e2e-test-article-slug");
    await page.locator("#excerpt").fill("Short summary of the E2E test article.");
    // Support either TipTap or Textarea (based on current/future implementation)
    const editor = page.locator('#content-editor, [data-testid="article-content-editor"]');
    if (await editor.isVisible()) {
      await editor.fill("Full rich text content from E2E test.");
    } else {
      await page.locator("#content").fill("Full Markdown content from E2E test.");
    }

    await page.locator("#author").fill("QA Author");
    await page.locator("#tags").fill("E2E, Testing");

    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Toast and redirect to /admin/articles
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/articles/);

    // 2. Check in table
    const tableRow = page.locator("tr").filter({ hasText: "E2E Test Article Title" }).first();
    await expect(tableRow).toBeVisible();

    // 3. Edit Article
    await tableRow.locator('a[href*="/admin/article/edit/"]').click();
    await page.waitForLoadState("networkidle");

    await page.locator("#title").fill("Updated E2E Test Article Title");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // 4. Delete Article
    const updatedRow = page.locator("tr").filter({ hasText: "Updated E2E Test Article Title" }).first();
    await expect(updatedRow).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await updatedRow.locator('button:has-text("Xóa"), button:has(.lucide-trash2)').click();
    await page.waitForLoadState("networkidle");

    // Verify gone
    await expect(updatedRow).not.toBeVisible();
  });
});
