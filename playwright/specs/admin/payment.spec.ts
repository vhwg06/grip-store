import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Payment @admin P1 P3", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-PAY-01 reads payment info in order context", async ({ page }) => {
    // GOAL: Admin Reads Payment Info In Order Context: hiểu payment-related facts cần thiết khi xử lý một order.
    // PRIORITY: P3
    // RELATED DOMAINS: order
    // SCENARIO: SC-PAY-01 Main flow
    test.fixme(true, "blocked: /admin/orders/[id] broken under output:export - tracked in UC-ORD-01");
    await page.goto("/admin/orders/test-order-0001");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
    await expect(page.getByText("Payment Method")).toBeVisible();
    await expect(page.getByText("COD / QR Transfer")).toBeVisible();
    await expect(page.getByText(/payment reference: test-trade-0001/i)).toBeVisible();
  });

  test("UC-PAY-02 reads payment context for refund decision", async ({ page }) => {
    // GOAL: Admin Reads Payment Context For Refund Decision: dùng payment facts để hỗ trợ giải thích refund request.
    // PRIORITY: P3
    // RELATED DOMAINS: refund
    // SCENARIO: SC-PAY-02 Main flow
    test.fixme(true, "blocked: /admin/orders/[id] broken under output:export - tracked in UC-ORD-01");
    await page.goto("/admin/refunds");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText("Amount / Value");
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText(/trade/i);
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText(/payment/i);
  });

  test("UC-PAY-03 distinguishes payment information from payment execution", async ({ page }) => {
    // GOAL: Admin Distinguishes Payment Information From Payment Execution: giữ rõ boundary giữa payment knowledge cần đọc và payment engine behavior.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-PAY-03 Main flow
    test.fixme(true, "blocked: /admin/orders/[id] broken under output:export - tracked in UC-ORD-01");
    await page.goto("/admin/refunds");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Refund" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mark Refunded" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Check Status" })).toHaveCount(0);
  });
});
