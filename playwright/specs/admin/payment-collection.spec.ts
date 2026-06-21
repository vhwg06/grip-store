import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function saveCollectState(request: any, payLink: string, payee: string) {
  const token = await getAdminToken(request);
  return request.put(`${BACKEND_URL}/v1/admin/collect`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { payLink, payee },
  });
}

async function readCollectState(request: any) {
  const token = await getAdminToken(request);
  const response = await request.get(`${BACKEND_URL}/v1/admin/collect`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload?.data ?? payload;
}

test.describe("Admin Payment Collection @admin P3", () => {
  test.describe.configure({ mode: "serial" });

  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-PCOL-01 reads collection sources from backend state instead of a static source catalog", async ({
    page,
  }) => {
    // GOAL: Admin Reads Collection Sources: hiểu những nguồn nhận tiền nào đang được cấu hình cho doanh nghiệp.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-PCOL-01 Main flow
    const collectResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/v1/admin/collect") &&
        response.request().method() === "GET",
    );

    await page.goto("/admin/collect");
    const collectResponse = await collectResponsePromise;

    expect(collectResponse.ok()).toBeTruthy();
    const payload = await collectResponse.json();
    const collectState = payload?.data ?? payload;
    const sources = Array.isArray(collectState?.sources) ? collectState.sources : [];

    expect(sources.length).toBeGreaterThan(0);

    for (const source of sources) {
      await expect(page.getByText(String(source.label), { exact: true })).toBeVisible();
    }

    const readyCount = sources.filter((source: any) => source.status === "active" || source.enabled).length;
    const unavailableCount = sources.length - readyCount;

    await expect(page.getByText("Ready", { exact: true })).toHaveCount(readyCount);
    await expect(page.getByText("Unavailable", { exact: true })).toHaveCount(unavailableCount);
    await expect(page.getByText("VCB QR primary", { exact: true })).toHaveCount(0);
    await expect(page.getByText("MoMo disabled", { exact: true })).toHaveCount(0);
  });

  test("UC-PCOL-02 persists payee identity from the admin collection surface", async ({ page }) => {
    // GOAL: Admin Maintains Payee Identity: đảm bảo người nhận tiền và thông tin định danh nhận tiền là đúng.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-PCOL-02 Main flow
    // INVARIANT: payee identity must be persisted durably to the backend and remain consistent across reloads
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
    // GOAL: Admin Maintains QR Or Transfer Collection Setup: duy trì QR hoặc transfer instructions mà storefront/checkout có thể dựa vào.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-PCOL-03 Main flow
    // INVARIANT: validation errors must block saving, ensuring invalid configurations are never written live
    const originalPayee = `PW Valid Payee ${Date.now()}`;
    const originalPayLink = `PW-VALID-${Date.now()}`;
    const seedResponse = await saveCollectState(request, originalPayLink, originalPayee);
    expect(seedResponse.ok()).toBeTruthy();

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
    // GOAL: Admin Verifies Collection Readiness: biết collection setup đã đủ sẵn sàng cho live use hay chưa.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-PCOL-04 Main flow
    const collectState = await readCollectState(request);
    const collectResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/v1/admin/collect") &&
        response.request().method() === "GET",
    );

    await page.goto("/admin/collect");
    const collectResponse = await collectResponsePromise;

    expect(collectResponse.ok()).toBeTruthy();
    await expect(page.getByText("Active", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/verify configurations before saving to live checkout/i)).toHaveCount(0);
    if (Array.isArray(collectState.warnings) && collectState.warnings.length > 0) {
      await expect(page.getByText(String(collectState.warnings[0]), { exact: false })).toBeVisible();
    } else if (collectState.ready ?? collectState.is_ready) {
      await expect(page.getByText(/collection setup is ready for live checkout/i)).toBeVisible();
    }
  });
});
