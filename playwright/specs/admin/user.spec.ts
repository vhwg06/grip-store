import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin User @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
  });

  function buyerRow(page: any) {
    return page
      .locator("div")
      .filter({
        has: page.getByRole("link", { name: "test_buyer" }),
      })
      .first();
  }

  test("UC-USER-01 presents an account-centric management root", async ({ page }) => {
    // INVARIANT: user management root là account/system domain — không phải commerce/customer domain
    // INVARIANT: search phải filter theo account identity, không trả loyalty/order rows
    test.fail(true, "blocked-both: user management is customer-centric and query returns mixed rows instead of account-only");
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
    await expect(page.getByText(/account\/system/i)).toBeVisible();
    const search = page.getByPlaceholder("Search account email, username, or user ID...");
    await expect(search).toBeVisible();
    await expect(page.getByText(/loyalty or order behavior/i)).toBeHidden();

    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await search.fill("test_admin");
    await responsePromise;
    await expect(page.locator('[data-testid="user-row"]')).toHaveCount(1);
  });

  test("UC-USER-02 reads account state without switching into customer-domain actions", async ({ page }) => {
    test.fail(true, "blocked-both: account state panel is labeled Customer Actions and lacks last-login/blocked fields");
    await buyerRow(page).click();

    await expect(page.getByText("Account Actions")).toBeVisible();
    await expect(page.getByText("test_buyer@example.com")).toBeVisible();
    await expect(page.getByText(/last activity/i)).toBeVisible();
    await expect(page.getByText(/blocked state/i)).toBeVisible();
    await expect(page.getByText(/points/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Open history" })).toBeHidden();
  });

  test("UC-USER-03 keeps points and block mutations in explicit account-control semantics", async ({ page }) => {
    // INVARIANT: points và block mutations là explicit account-control operations, không phải marketing preferences hay UI configuration đơn thuần
    test.fail(true, "blocked-fe-gap: UI has customer-profile framing instead of explicit account-control semantics");

    await buyerRow(page).click();

    await expect(page.getByText("Account Actions")).toBeVisible();
    await expect(page.getByText(/customer profile/i)).toBeHidden();
    await expect(page.getByRole("button", { name: "Adjust points" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Block / unblock" })).toBeVisible();
  });

  test("UC-USER-03 submits points adjustment (blocked-be-gap)", async ({ page }) => {
    // INVARIANT: points mutation là account-control operation, không phải customer loyalty behavior tự do
    test.fail(true, "blocked-be-gap: PATCH /v1/admin/users/:id/points returns 404");

    await buyerRow(page).click();
    await page.getByRole("button", { name: "Adjust points" }).click();
    
    // Fill new points
    await page.locator("#new-points").fill("1500");
    await page.getByRole("button", { name: "Save" }).click();

    // Verify success toast appears if fixed, otherwise fails due to 404
    await expect(page.locator(".toast-success, [role='status']").first()).toBeVisible();
  });

  test("UC-USER-03 submits block mutation (blocked-be-gap)", async ({ page }) => {
    // INVARIANT: block mutation phải lập tức vô hiệu hóa account access rights của user, không cho phép bypass
    test.fail(true, "blocked-be-gap: PATCH /v1/admin/users/:id/block returns 404");

    // Dismiss dialog automatically by accepting it
    page.on("dialog", dialog => dialog.accept());

    await buyerRow(page).click();
    await page.getByRole("button", { name: "Block / unblock" }).click();

    // Verify success toast appears if fixed, otherwise fails due to 404
    await expect(page.locator(".toast-success, [role='status']").first()).toBeVisible();
  });

  test("UC-USER-04 exposes a domain handoff from account context into customer context", async ({ page }) => {
    test.fail(true, "blocked-both: missing Open customer domain handoff button in user details");
    await buyerRow(page).click();

    await expect(page.getByRole("button", { name: /open customer/i })).toBeVisible();
    await page.getByRole("button", { name: /open customer/i }).click();

    await expect(page).toHaveURL(/\/admin\/customers\//);
  });

  test("UC-USER-05 keeps commerce support separate from account-control actions", async ({ page }) => {
    // INVARIANT: commerce support và account-control là hai surfaces riêng biệt
    // INVARIANT: user root không được mix "Open history" hoặc loyalty behavior vào account-control semantics
    test.fail(true, "blocked-fe-gap: account panel still displays commerce elements like Open history or loyalty info");
    await buyerRow(page).click();

    await expect(page.getByText(/account control/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Open history" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Send message" })).toBeHidden();
    await expect(page.getByText(/loyalty or order behavior/i)).toBeHidden();
  });
});
