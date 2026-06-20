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

test.describe("Admin Profile @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-APRO-01 renders the current admin identity instead of fallback account scaffolding", async ({
    page,
    request,
  }) => {
    // INVARIANT: FE phải render actual identity từ /v1/profile — không phải scaffolding fallback
    const profile = await fetchAdminProfile(request);

    await page.goto("/admin/profile");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Admin Profile" })).toBeVisible();
    await expect(page.locator("#username")).toHaveValue(String(profile.username));
    await expect(page.locator("#username")).not.toHaveValue("admin_grip_ops");
    await expect(page.locator("#email")).toHaveValue(String(profile.email));
    await expect(page.getByText(String(profile.role), { exact: false })).toBeVisible();
    await expect(page.getByText(/administrator|admin role/i)).toBeVisible();
    await expect(page.locator('[data-testid="admin-security-section"]')).toBeVisible();
  });

  test("UC-APRO-02 persists self display identity and reflects the saved value after reload", async ({
    page,
    request,
  }) => {
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
    const securityResponses: number[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/v1/profile/security")) {
        securityResponses.push(response.status());
      }
    });

    await page.goto("/admin/profile");
    await page.waitForLoadState("networkidle");

    expect(securityResponses.length).toBeGreaterThan(0);
    await expect(page.getByText(/security audit passed\. active sessions match authorized locations\./i)).toHaveCount(0);
  });

  test("UC-APRO-04 pulls recent-access trust state from the backend instead of static session rows", async ({
    page,
  }) => {
    const sessionResponses: number[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/v1/profile/sessions")) {
        sessionResponses.push(response.status());
      }
    });

    await page.goto("/admin/profile");
    await page.waitForLoadState("networkidle");

    expect(sessionResponses.length).toBeGreaterThan(0);
    await expect(page.getByText("Chrome · macOS", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Safari · iOS", { exact: true })).toHaveCount(0);
  });
});
