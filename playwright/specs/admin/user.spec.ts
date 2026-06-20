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
    await buyerRow(page).click();

    await expect(page.getByText("Account Actions")).toBeVisible();
    await expect(page.getByText("test_buyer@example.com")).toBeVisible();
    await expect(page.getByText(/last activity/i)).toBeVisible();
    await expect(page.getByText(/blocked state/i)).toBeVisible();
    await expect(page.getByText(/points/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Open history" })).toBeHidden();
  });

  test("UC-USER-03 keeps points and block mutations in explicit account-control semantics", async ({ page }) => {
    await buyerRow(page).click();

    await expect(page.getByText("Account Actions")).toBeVisible();
    await expect(page.getByText(/customer profile/i)).toBeHidden();
    await expect(page.getByRole("button", { name: "Adjust points" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Block / unblock" })).toBeVisible();
  });

  test("UC-USER-03 submits points adjustment (blocked-be-gap)", async ({ page }) => {
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
    test.fail(true, "blocked-be-gap: PATCH /v1/admin/users/:id/block returns 404");

    // Dismiss dialog automatically by accepting it
    page.on("dialog", dialog => dialog.accept());

    await buyerRow(page).click();
    await page.getByRole("button", { name: "Block / unblock" }).click();

    // Verify success toast appears if fixed, otherwise fails due to 404
    await expect(page.locator(".toast-success, [role='status']").first()).toBeVisible();
  });

  test("UC-USER-04 exposes a domain handoff from account context into customer context", async ({ page }) => {
    await buyerRow(page).click();

    await expect(page.getByRole("button", { name: /open customer/i })).toBeVisible();
    await page.getByRole("button", { name: /open customer/i }).click();

    await expect(page).toHaveURL(/\/admin\/customers\//);
  });

  test("UC-USER-05 keeps commerce support separate from account-control actions", async ({ page }) => {
    await buyerRow(page).click();

    await expect(page.getByText(/account control/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Open history" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Send message" })).toBeHidden();
    await expect(page.getByText(/loyalty or order behavior/i)).toBeHidden();
  });
});
