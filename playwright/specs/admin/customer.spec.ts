import { test, expect } from "../../src/fixtures/base-test";

test.describe("Admin Customer @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  async function registerEmptyHistoryUser(request: any) {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const email = `pw-empty-${suffix}@example.com`;
    const username = `pw_empty_${suffix}`;
    const response = await request.post("https://grip.vn/api/v1/auth/register", {
      data: {
        username,
        email,
        password: "Password123!",
      },
    });
    expect(response.ok()).toBeTruthy();
    return { username, email };
  }

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
  });

  test("UC-CUS-01 finds a customer record from customer-centric search", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    await page.getByPlaceholder("Search email, phone, user ID...").fill("test_buyer");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("test_buyer", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("test_admin", { exact: false }).first()).toBeHidden();
  });

  test("UC-CUS-02 renders customer summary and commerce indicators", async ({ page }) => {
    await page.getByText("test_buyer", { exact: false }).first().click();

    await expect(page.getByText("Customer Actions")).toBeVisible();
    await expect(page.getByText("test_buyer@example.com")).toBeVisible();
    await expect(page.getByText(/order/i)).toBeVisible();
    await expect(page.getByText(/refund/i)).toBeVisible();
    await expect(page.getByText(/review/i)).toBeVisible();
  });

  test("UC-CUS-03 traverses commerce links from the customer root", async ({ page }) => {
    await page.getByText("test_buyer", { exact: false }).first().click();

    await expect(page.getByRole("button", { name: "Open history" })).toBeVisible();
    await expect(page.getByRole("button", { name: /refund/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /review/i })).toBeVisible();
  });

  test("UC-CUS-04 distinguishes customer root from user-domain controls", async ({ page }) => {
    await page.getByText("test_buyer", { exact: false }).first().click();

    await expect(page.getByText(/linked user/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /account/i })).toBeVisible();
  });

  test("UC-CUS-05 treats empty commerce history as a valid customer state", async ({ page, request }) => {
    const created = await registerEmptyHistoryUser(request);

    await page.getByPlaceholder("Search email, phone, user ID...").fill(created.email);
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(created.username, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/empty commerce history/i)).toBeVisible();
  });

  test("UC-ORD-04 opens customer-linked purchase history from customer context", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    const buyerRow = page.getByText("test_buyer", { exact: false }).first();
    await buyerRow.click();

    await expect(page.getByText("Customer Actions")).toBeVisible();
    await page.getByRole("button", { name: "Open history" }).click();

    await expect(page).toHaveURL(/\/admin\/orders\?q=22222222-2222-2222-2222-222222222222/);
    await expect(page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first()).toBeVisible();
  });
});
