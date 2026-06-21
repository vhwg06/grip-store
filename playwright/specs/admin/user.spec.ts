import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

const TEST_USER_ID = "22222222-2222-2222-2222-222222222222";

test.describe("Admin User @admin P2", () => {
  test.describe.configure({ mode: "serial" });
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
  });

  function userRow(page: any, username: string) {
    return page
      .locator('[data-testid="user-row"]')
      .filter({
        has: page.getByRole("link", { name: username }),
      })
      .first();
  }

  async function readBuyerState(request: any) {
    const token = await getAdminToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/users?page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    const users = Array.isArray(payload?.data) ? payload.data : [];
    const user = users.find((item: any) => item.id === TEST_USER_ID || item.user_id === TEST_USER_ID);
    expect(user).toBeTruthy();
    return {
      points: Number(user.points ?? 0),
      isBlocked: Boolean(user.is_blocked ?? user.isBlocked),
    };
  }

  async function restoreBuyerState(request: any, state: { points: number; isBlocked: boolean }) {
    const token = await getAdminToken(request);
    await request.patch(`${BACKEND_URL}/v1/admin/users/${TEST_USER_ID}/points`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { points: state.points },
    });
    await request.patch(`${BACKEND_URL}/v1/admin/users/${TEST_USER_ID}/block`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { isBlocked: state.isBlocked },
    });
  }

  async function expectBuyerState(
    request: any,
    expected: Partial<{ points: number; isBlocked: boolean }>,
  ) {
    await expect
      .poll(async () => {
        const current = await readBuyerState(request);
        return JSON.stringify(current);
      })
      .toBe(
        JSON.stringify({
          points: expected.points,
          isBlocked: expected.isBlocked,
        }),
      );
  }

  test("UC-USER-01 presents an account-centric management root", async ({ page }) => {
    // GOAL: Admin Finds An Account: xác định account nào cần được kiểm tra hoặc quản trị.
    // PRIORITY: P2
    // RELATED DOMAINS: customer
    // SCENARIO: SC-USER-01 Main flow
    // INVARIANT: user management root là account/system domain — không phải commerce/customer domain
    // INVARIANT: search phải filter theo account identity, không trả loyalty/order rows
    await expect(page.getByTestId("user-management-title")).toBeVisible();
    const search = page.getByTestId("user-search-input");
    await expect(search).toBeVisible();

    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await search.fill("test_admin");
    await search.press("Enter");
    await responsePromise;
    const rows = page.locator('[data-testid="user-row"]');
    await expect(rows).toHaveCount(1);
    await expect(userRow(page, "test_admin")).toBeVisible();
    await expect(userRow(page, "test_buyer")).toHaveCount(0);
  });

  test("UC-USER-02 reads account state without switching into customer-domain actions", async ({ page }) => {
    // GOAL: Admin Reads Account State: hiểu account đang ở trạng thái nào trong hệ thống.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-USER-02 Main flow
    await userRow(page, "test_buyer").click();

    const panel = page.getByTestId("account-actions-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId("summary-email")).toHaveText("test_buyer@example.com");
    await expect(panel.getByTestId("summary-last-activity")).not.toHaveText("");
    await expect(panel.getByTestId("summary-blocked-state")).toHaveText(/Blocked|Active/);
    await expect(panel.getByTestId("summary-points")).toContainText("pts");
    await expect(panel.getByRole("button", { name: "Open history" })).toHaveCount(0);
  });

  test("UC-USER-03 keeps points and block mutations in explicit account-control semantics", async ({ page }) => {
    // GOAL: Admin Manages Account State: thay đổi account state ở phạm vi admin được phép.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-USER-03 Main flow
    // INVARIANT: points và block mutations là explicit account-control operations, không phải marketing preferences hay UI configuration đơn thuần
    await userRow(page, "test_buyer").click();

    const panel = page.getByTestId("account-actions-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId("account-adjust-points")).toBeVisible();
    await expect(panel.getByTestId("account-block-toggle")).toBeVisible();
    await expect(panel.getByRole("button", { name: "Open history" })).toHaveCount(0);
  });

  test("UC-USER-03 submits points adjustment (blocked-be-gap)", async ({ page, request }) => {
    // GOAL: Admin Manages Account State: thay đổi account state ở phạm vi admin được phép.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-USER-03 Main flow
    // INVARIANT: points mutation là account-control operation, không phải customer loyalty behavior tự do
    const original = await readBuyerState(request);

    try {
      await userRow(page, "test_buyer").click();
      await page.getByRole("button", { name: "Adjust points" }).click();
      
      await page.locator("#new-points").fill(String(original.points + 100));
      await page.getByRole("button", { name: "Save" }).click();

      await expectBuyerState(request, {
        points: original.points + 100,
        isBlocked: original.isBlocked,
      });
    } finally {
      await restoreBuyerState(request, original);
    }
  });

  test("UC-USER-03 submits block mutation (blocked-be-gap)", async ({ page, request }) => {
    // GOAL: Admin Manages Account State: thay đổi account state ở phạm vi admin được phép.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-USER-03 Main flow
    // INVARIANT: block mutation phải lập tức vô hiệu hóa account access rights của user, không cho phép bypass
    const original = await readBuyerState(request);
    page.on("dialog", dialog => dialog.accept());

    try {
      await userRow(page, "test_buyer").click();
      await page.getByRole("button", { name: "Block / unblock" }).click();

      await expectBuyerState(request, {
        points: original.points,
        isBlocked: !original.isBlocked,
      });
    } finally {
      await restoreBuyerState(request, original);
    }
  });

  test("UC-USER-04 exposes a domain handoff from account context into customer context", async ({ page }) => {
    // GOAL: Admin Traverses From User To Customer Context: khi concern chuyển từ account sang commerce, admin đi đúng sang customer root.
    // PRIORITY: P2
    // RELATED DOMAINS: customer
    // SCENARIO: SC-USER-04 Main flow
    await userRow(page, "test_buyer").click();

    await expect(page.getByTestId("account-open-customer")).toBeVisible();
    await page.getByTestId("account-open-customer").click();

    await expect(page).toHaveURL(/\/admin\/customers\//);
  });

  test("UC-USER-05 keeps commerce support separate from account-control actions", async ({ page }) => {
    // GOAL: Admin Distinguishes Account Control From Commerce Support: tránh dùng account-management actions để giải quyết commerce issues.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-USER-05 Main flow
    // INVARIANT: commerce support và account-control là hai surfaces riêng biệt
    // INVARIANT: user root không được mix "Open history" hoặc loyalty behavior vào account-control semantics
    await userRow(page, "test_buyer").click();

    const panel = page.getByTestId("account-actions-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId("account-adjust-points")).toBeVisible();
    await expect(panel.getByTestId("account-block-toggle")).toBeVisible();
    await expect(panel.getByTestId("account-open-customer")).toBeVisible();
    await expect(panel.getByRole("button", { name: "Open history" })).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Open refunds" })).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Open reviews" })).toHaveCount(0);
  });

  test("UC-USER-01 alternate: admin refines search multiple times before reaching the correct account", async ({ page }) => {
    // GOAL: Admin Finds An Account: xác định account nào cần được kiểm tra hoặc quản trị.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-USER-01 Alternate flow
    const search = page.getByTestId("user-search-input");
    await expect(search).toBeVisible();

    const responsePromise1 = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await search.fill("xyz_no_result");
    await search.press("Enter");
    await responsePromise1;

    await expect(page.getByText("No results")).toBeVisible();

    const responsePromise2 = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await search.fill("test_buyer");
    await search.press("Enter");
    await responsePromise2;

    await expect(userRow(page, "test_buyer")).toBeVisible();
  });
});
