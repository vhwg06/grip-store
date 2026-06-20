import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function saveCollectState(request: any, payLink: string, payee: string) {
  const token = await getAdminToken(request);
  return request.put(`${BACKEND_URL}/v1/admin/collect`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { payLink, payee },
  });
}

test.describe("Admin Payment Collection @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-PCOL-01 reads collection sources from backend state instead of a static source catalog", async ({
    page,
  }) => {
    const collectRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/v1/admin/collect")) {
        collectRequests.push(request.url());
      }
    });

    await page.goto("/admin/collect");
    await page.waitForLoadState("networkidle");

    expect(collectRequests.length).toBeGreaterThan(0);
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
    const invalidSeed = await saveCollectState(request, "1234", "");

    await page.goto("/admin/collect");
    await page.waitForLoadState("networkidle");

    test.skip(
      invalidSeed.status() === 400 || invalidSeed.status() === 422,
      "blocked-by-validation-fix: backend now rejects invalid collect state seeding",
    );

    await expect(page.getByText(/invalid bank code/i)).toBeVisible();
    await expect(page.getByText("Active", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/verify configurations before saving to live checkout/i)).toHaveCount(0);
  });
});
