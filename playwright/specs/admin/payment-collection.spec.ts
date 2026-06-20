import { test, expect } from "../../src/fixtures/base-test";

const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";

async function loginForToken(request: any, email: string, password: string) {
  const response = await request.post(`${BACKEND_URL}/v1/auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return (
    payload?.data?.accessToken ??
    payload?.data?.access_token ??
    payload?.data?.token ??
    payload?.accessToken ??
    payload?.access_token ??
    payload?.token ??
    null
  ) as string | null;
}

async function getAdminToken(request: any) {
  const token = await loginForToken(
    request,
    process.env.ADMIN_USER_EMAIL ?? "test_admin@example.com",
    process.env.ADMIN_USER_PASSWORD ?? "Password123!",
  );
  expect(token).toBeTruthy();
  return token as string;
}

async function saveCollectState(request: any, payLink: string, payee: string) {
  const token = await getAdminToken(request);
  const response = await request.put(`${BACKEND_URL}/v1/admin/collect`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { payLink, payee },
  });
  expect(response.ok()).toBeTruthy();
}

test.describe("Admin Payment Collection @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-PCOL-01 reads collection sources from backend state instead of a static source catalog", async ({
    page,
  }) => {
    await page.goto("/admin/collect");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("VCB QR primary", { exact: true })).toHaveCount(0);
    await expect(page.getByText("MoMo disabled", { exact: true })).toHaveCount(0);
  });

  test("UC-PCOL-02 persists payee identity from the admin collection surface", async ({ page }) => {
    const nextPayee = `PW FE Payee ${Date.now()}`;
    const nextPayLink = `PW-FE-COLLECT-${Date.now()}`;

    await page.goto("/admin/collect");
    await page.waitForLoadState("networkidle");
    await page.locator("#accountName").fill(nextPayee);
    await page.locator("#bankNumber").fill(nextPayLink);
    await page.getByRole("button", { name: "Save payment codes" }).click();
    await expect(page.getByText(/success/i)).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#accountName")).toHaveValue(nextPayee);
    await expect(page.locator("#bankNumber")).toHaveValue(nextPayLink);
  });

  test("UC-PCOL-03 blocks invalid QR or transfer setup from being saved live", async ({
    page,
    request,
  }) => {
    const originalPayee = `PW Valid Payee ${Date.now()}`;
    const originalPayLink = `PW-VALID-${Date.now()}`;
    await saveCollectState(request, originalPayLink, originalPayee);

    await page.goto("/admin/collect");
    await page.waitForLoadState("networkidle");
    await page.locator("#accountName").fill("");
    await page.locator("#bankNumber").fill("1234");
    await expect(page.getByText(/invalid bank code/i)).toBeVisible();
    await page.getByRole("button", { name: "Save payment codes" }).click();
    await expect(page.getByText(/success/i)).toHaveCount(0);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#accountName")).toHaveValue(originalPayee);
    await expect(page.locator("#bankNumber")).toHaveValue(originalPayLink);
  });

  test("UC-PCOL-04 renders collection readiness from backend signals instead of hardcoded active badges", async ({
    page,
    request,
  }) => {
    await saveCollectState(request, "1234", "");

    await page.goto("/admin/collect");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/invalid bank code/i)).toBeVisible();
    await expect(page.getByText("Active", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/verify configurations before saving to live checkout/i)).toHaveCount(0);
  });
});
