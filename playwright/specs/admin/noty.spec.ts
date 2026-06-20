import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function sendBroadcastNotification(request: any, title: string) {
  const token = await getAdminToken(request);

  const response = await request.post(`${BACKEND_URL}/v1/admin/messages/broadcast`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      title,
      body: "playwright outbound push",
    },
  });

  expect([200, 201, 202, 204]).toContain(response.status());
}

test.describe("Admin Noty @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/notifications");
    await page.waitForLoadState("networkidle");
  });

  test("UC-NOTY-01 renders outbound readiness controls for notification channels", async ({ page }) => {
    const responses: number[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/v1/admin/notifications")) {
        responses.push(response.status());
      }
    });

    await page.getByRole("button", { name: "Channel Settings" }).click();

    expect(responses.length).toBeGreaterThan(0);
    await expect(page.getByText("Admin Trigger Toggles")).toBeVisible();
    await expect(page.getByText(/configure credentials to receive instant system actions/i)).toBeVisible();
    await expect(page.getByText(/telegram bot configuration/i)).toBeVisible();
    await expect(page.getByText(/email notifications/i)).toBeVisible();
  });

  test("UC-NOTY-02 sends a website push from the compose flow and reflects it in the outbound table", async ({
    page,
  }) => {
    const title = `PW FE Noty ${Date.now()}`;

    await page.getByRole("button", { name: /new push/i }).click();
    await page.getByPlaceholder("Enter push campaign title").fill(title);
    await page.getByPlaceholder("Enter push content text...").fill("playwright notification body");
    await page.getByRole("button", { name: /send campaign now/i }).click();

    await expect(page.getByText(/push campaign sent successfully/i)).toBeVisible();
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: title }) });
    await expect(row.getByRole("cell", { name: title })).toBeVisible();
    await expect(row.getByText(/^Sent$/)).toBeVisible();
  });

  test("UC-NOTY-03 reads outbound notification list from backend state instead of only local scaffolding", async ({
    page,
    request,
  }) => {
    const title = `PW API Noty List ${Date.now()}`;
    await sendBroadcastNotification(request, title);
    const listResponses: number[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/v1/admin/messages")) {
        listResponses.push(response.status());
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    expect(listResponses.length).toBeGreaterThan(0);
    await expect(page.getByRole("cell", { name: title })).toBeVisible();
  });

  test("UC-NOTY-04 exposes send history with outcome trace separate from campaign composition", async ({
    page,
    request,
  }) => {
    const title = `PW API Noty History ${Date.now()}`;
    await sendBroadcastNotification(request, title);
    const listResponses: number[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/v1/admin/messages")) {
        listResponses.push(response.status());
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    expect(listResponses.length).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: /history/i })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(/failed|sent|queued|scheduled/i)).toBeVisible();
  });

  test("UC-NOTY-03 renders empty search state gracefully", async ({ page }) => {
    await page.getByPlaceholder("Search campaigns by title...").fill("nonexistent-campaign-12345xyz");
    await expect(page.getByText("No campaigns match your filters.")).toBeVisible();
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });
});
