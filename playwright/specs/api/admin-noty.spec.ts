import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function adminJson(request: any, path: string, options?: { method?: string; data?: any }) {
  const token = await getAdminToken(request);
  return request.fetch(`${BACKEND_URL}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options?.data ? { "Content-Type": "application/json" } : {}),
    },
    data: options?.data,
  });
}

function extractData(payload: any) {
  return payload?.data ?? payload;
}

test.describe("Admin Noty API @api", () => {
  test("UC-NOTY-01 reads outbound readiness from a notification-settings contract", async ({ request }) => {
    const response = await adminJson(request, "/v1/admin/notifications");
    expect(response.ok()).toBeTruthy();

    const payload = extractData(await response.json());
    expect(payload).toMatchObject({
      telegramEnabled: expect.any(Boolean),
      barkEnabled: expect.any(Boolean),
      resendEnabled: expect.any(Boolean),
    });
  });

  test("UC-NOTY-02 accepts a website push send and leaves a traceable outbound artifact", async ({ request }) => {
    const title = `playwright-noty-send-${Date.now()}`;

    const sendResponse = await adminJson(request, "/v1/admin/messages/broadcast", {
      method: "POST",
      data: {
        title,
        body: "playwright push body",
      },
    });
    expect([200, 201, 202, 204]).toContain(sendResponse.status());

    const listResponse = await adminJson(request, "/v1/admin/messages");
    expect(listResponse.ok()).toBeTruthy();

    const payload = await listResponse.json();
    const history = extractData(payload);
    expect(Array.isArray(history)).toBe(true);
    expect(
      history.some((item: any) => (item.title ?? item.subject ?? "") === title),
    ).toBe(true);
  });

  test("UC-NOTY-03 lists outbound notification artifacts for admin review", async ({ request }) => {
    const response = await adminJson(request, "/v1/admin/messages");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const items = extractData(payload);
    expect(Array.isArray(items)).toBe(true);
  });

  test("UC-NOTY-04 exposes operational send history with outcome trace fields", async ({ request }) => {
    const response = await adminJson(request, "/v1/admin/messages");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const items = extractData(payload);
    expect(Array.isArray(items)).toBe(true);
    if (items.length > 0) {
      expect(items[0]).toMatchObject({
        title: expect.any(String),
      });
      expect(items[0].status ?? items[0].result ?? items[0].outcome).toBeTruthy();
      expect(items[0].createdAt ?? items[0].created_at ?? items[0].sentAt ?? items[0].sent_at).toBeTruthy();
    }
  });
});
