import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin FAQs – CRUD @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    // Navigate to /admin/faqs
    await page.goto("/admin/faqs", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  test("should support complete CRUD flow for FAQs", async ({ page }) => {
    const questionText = `E2E Test FAQ Question? ${Date.now()}`;
    await expect(page.locator("h1")).toContainText(/FAQ Management|Quản lý Câu hỏi thường gặp/);

    // 1. Create FAQ
    await page.locator("#faq-question").fill(questionText);
    await page.locator("#faq-answer").fill("E2E Test FAQ Answer content.");
    await page.locator("#faq-sort").fill("500");
    await page.locator("#faq-active").check();

    await page.click('button:has-text("Thêm"), button:has-text("Add")');
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Success toast
    await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();

    // 2. Check in list
    const tableRow = page.locator("tr").filter({ hasText: questionText }).first();
    await expect(tableRow).toBeVisible();

    // 3. Delete FAQ
    page.once("dialog", (d) => d.accept());
    await tableRow.locator('button:has-text("Xóa"), button:has-text("Delete")').click();
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Verify gone
    await expect(tableRow).not.toBeVisible();
  });
});
