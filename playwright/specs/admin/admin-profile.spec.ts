import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function fetchAdminProfile(request: any) {
  const token = await getAdminToken(request);
  const response = await request.get(`${BACKEND_URL}/v1/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload?.data ?? payload;
}

async function fetchAdminSessions(request: any) {
  const token = await getAdminToken(request);
  const response = await request.get(`${BACKEND_URL}/v1/profile/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.sessions)
      ? payload.sessions
      : Array.isArray(payload)
        ? payload
        : [];
}

test.describe("Admin Profile @admin P3", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-APRO-01 renders the current admin identity instead of fallback account scaffolding", async ({
    page,
    request,
  }) => {
    // GOAL: Admin Reads Own Profile Identity: xác nhận current admin identity đang được trình bày đúng.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-01 Main flow
    // INVARIANT: FE phải render actual identity từ /v1/profile — không phải scaffolding fallback
    const profile = await fetchAdminProfile(request);

    await page.goto("/admin/profile");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Admin Profile" })).toBeVisible();
    await expect(page.locator("#username")).toHaveValue(String(profile.username));
    await expect(page.locator("#username")).not.toHaveValue("admin_grip_ops");
    await expect(page.locator("#email")).toHaveValue(String(profile.email));
    await expect(page.getByText(String(profile.role), { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/administrator|admin role/i).first()).toBeVisible();
    await expect(page.locator('[data-testid="admin-security-section"]')).toBeVisible();
  });

  test("UC-APRO-02 persists self display identity and reflects the saved value after reload", async ({
    page,
    request,
  }) => {
    // GOAL: Admin Maintains Own Display Identity: cập nhật cách current admin được nhận diện trong hệ thống vận hành.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-02 Main flow
    // INVARIANT: profile display name update must persist and survive page reloads
    const nextDisplayName = `PW Admin FE ${Date.now()}`;

    await page.goto("/admin/profile");
    await page.waitForLoadState("networkidle");
    await page.locator("#displayName").fill(nextDisplayName);
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText(/profile saved successfully/i)).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");
    const profileAfter = await fetchAdminProfile(request);
    await expect(page.locator("#displayName")).toHaveValue(String(profileAfter.display_name));
  });

  test("UC-APRO-03 pulls backend-owned security posture instead of rendering a hardcoded green audit", async ({
    page,
  }) => {
    // GOAL: Admin Maintains Security Posture: giữ current admin account ở trạng thái đáng tin cậy.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-03 Main flow
    const securityResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/v1/profile/security") &&
        response.request().method() === "GET",
    );

    await page.goto("/admin/profile");
    const securityResponse = await securityResponsePromise;

    expect(securityResponse.ok()).toBeTruthy();
    await expect(page.getByText(/security audit passed\. active sessions match authorized locations\./i)).toHaveCount(0);
  });

  test("UC-APRO-04 pulls recent-access trust state from the backend instead of static session rows", async ({
    page,
    request,
  }) => {
    // GOAL: Admin Reviews Recent Access Trust: xác minh các phiên truy cập gần đây có còn đáng tin cậy không.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-04 Main flow
    const backendSessions = await fetchAdminSessions(request);
    const sessionResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/v1/profile/sessions") &&
        response.request().method() === "GET",
    );

    await page.goto("/admin/profile");
    const sessionResponse = await sessionResponsePromise;

    expect(sessionResponse.ok()).toBeTruthy();
    expect(backendSessions.length).toBeGreaterThan(0);
    await expect(page.getByText(String(backendSessions[0].device), { exact: false }).first()).toBeVisible();
    await expect(page.getByText(String(backendSessions[0].location), { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Safari · iOS", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Hanoi", { exact: true })).toHaveCount(0);
  });
});
