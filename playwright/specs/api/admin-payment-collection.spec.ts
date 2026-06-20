import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function adminGet(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPut(request: any, path: string, data: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.put(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

test.describe("Admin Payment Collection API @api", () => {
  test("UC-PCOL-01 reads collection sources with explicit source-state metadata", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/collect");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const data = payload?.data ?? payload;
    const sources = Array.isArray(data?.sources) ? data.sources : [];

    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0]).toMatchObject({
      id: expect.any(String),
      label: expect.any(String),
      status: expect.stringMatching(/active|inactive|draft/i),
    });
  });

  test("UC-PCOL-02 updates payee identity for the live collection source", async ({ request }) => {
    const nextPayee = `PW Payee ${Date.now()}`;
    const nextPayLink = `PW-COLLECT-${Date.now()}`;

    const save = await adminPut(request, "/v1/admin/collect", {
      payLink: nextPayLink,
      payee: nextPayee,
    });
    expect(save.ok()).toBeTruthy();

    const savePayload = await save.json();
    const saved = savePayload?.data ?? savePayload;
    expect(saved).toMatchObject({
      payLink: nextPayLink,
      payee: nextPayee,
    });

    const readBack = await adminGet(request, "/v1/admin/collect");
    expect(readBack.ok()).toBeTruthy();
    const readBackPayload = await readBack.json();
    const current = readBackPayload?.data ?? readBackPayload;
    expect(current.payee).toBe(nextPayee);
  });

  test("UC-PCOL-03 rejects invalid QR or transfer setup instead of saving it live", async ({ request }) => {
    const response = await adminPut(request, "/v1/admin/collect", {
      payLink: "1234",
      payee: "",
    });

    expect(response.ok()).toBeFalsy();
  });

  test("UC-PCOL-04 exposes readiness warnings for the current collection setup", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/collect");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const data = payload?.data ?? payload;

    expect(Boolean(data.ready ?? data.is_ready)).toBe(true);
    expect(Array.isArray(data.warnings)).toBeTruthy();
  });
});
