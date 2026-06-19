import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin FAQs – CRUD @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage, page }) => {
    await adminPage.goto();
    // Navigate to /admin/faqs
    await page.goto("/admin/faqs");
    await page.waitForLoadState("networkidle");
  });

  test("should support complete CRUD flow for FAQs", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Quản lý Câu hỏi thường gặp");

    // 1. Create FAQ
    await page.locator("#faq-question").fill("E2E Test FAQ Question?");
    await page.locator("#faq-answer").fill("E2E Test FAQ Answer content.");
    await page.locator("#faq-sort").fill("500");
    await page.locator("#faq-active").check();

    await page.click('button:has-text("Thêm"), button:has-text("Add")');
    await page.waitForLoadState("networkidle");

    // Success toast
    await expect(page.locator('.toast-success, [role="status"]')).toBeVisible();

    // 2. Check in list
    const tableRow = page.locator("tr").filter({ hasText: "E2E Test FAQ Question?" }).first();
    await expect(tableRow).toBeVisible();

    // 3. Delete FAQ
    page.once("dialog", (d) => d.accept());
    await tableRow.locator('button:has-text("Xóa"), button:has-text("Delete")').click();
    await page.waitForLoadState("networkidle");

    // Verify gone
    await expect(tableRow).not.toBeVisible();
  });
});
