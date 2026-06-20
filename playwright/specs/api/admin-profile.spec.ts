import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function adminGet(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.get(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function adminPatch(request: any, path: string, data: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.patch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

test.describe("Admin Profile API @api P3", () => {
  test("UC-APRO-01 reads current admin identity from the self-profile contract", async ({ request }) => {
    // GOAL: Admin Reads Own Profile Identity: xác nhận current admin identity đang được trình bày đúng.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-01 Main flow
    const response = await adminGet(request, "/v1/profile");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const data = payload?.data ?? payload;

    expect(data).toMatchObject({
      id: expect.any(String),
      username: expect.any(String),
      email: expect.any(String),
    });
    expect(Boolean(data.role || data.role_id || data.is_admin)).toBeTruthy();
  });

  test("UC-APRO-02 updates the current admin display identity without changing permissions", async ({ request }) => {
    // GOAL: Admin Maintains Own Display Identity: cập nhật cách current admin được nhận diện trong hệ thống vận hành.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-02 Main flow
    const before = await adminGet(request, "/v1/profile");
    expect(before.ok()).toBeTruthy();
    const beforeJson = await before.json();
    const beforePayload = beforeJson?.data ?? beforeJson;

    const nextDisplayName = `PW Admin Profile ${Date.now()}`;
    const patch = await adminPatch(request, "/v1/profile", {
      email: beforePayload.email,
      displayName: nextDisplayName,
      desktopNotificationsEnabled: beforePayload.desktop_notifications_enabled ?? false,
    });
    expect(patch.ok()).toBeTruthy();

    const patchPayload = await patch.json();
    const patched = patchPayload?.data ?? patchPayload;
    expect(patched.display_name).toBe(nextDisplayName);
    expect(patched.email).toBe(beforePayload.email);
    expect(patched.role_id ?? null).toBe(beforePayload.role_id ?? null);
    expect(patched.is_admin ?? null).toBe(beforePayload.is_admin ?? null);

    const after = await adminGet(request, "/v1/profile");
    expect(after.ok()).toBeTruthy();
    const afterJson = await after.json();
    const afterPayload = afterJson?.data ?? afterJson;
    expect(afterPayload.display_name).toBe(nextDisplayName);
  });

  test("UC-APRO-03 exposes backend-owned security posture for the current admin", async ({ request }) => {
    // GOAL: Admin Maintains Security Posture: giữ current admin account ở trạng thái đáng tin cậy.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-03 Main flow
    const response = await adminGet(request, "/v1/profile/security");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const data = payload?.data ?? payload;
    expect(data).toMatchObject({
      password_last_changed_at: expect.any(String),
      two_factor_enabled: expect.any(Boolean),
    });
    expect(data.backups ?? data.backup_methods ?? data.backup_email).toBeTruthy();
  });

  test("UC-APRO-04 exposes recent-access trust signals for the current admin", async ({ request }) => {
    // GOAL: Admin Reviews Recent Access Trust: xác minh các phiên truy cập gần đây có còn đáng tin cậy không.
    // PRIORITY: P3
    // RELATED DOMAINS: none
    // SCENARIO: SC-APRO-04 Main flow
    const response = await adminGet(request, "/v1/profile/sessions");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.sessions)
        ? payload.sessions
        : Array.isArray(payload)
          ? payload
          : [];

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      device: expect.any(String),
      location: expect.any(String),
    });
    expect(Boolean(rows[0].last_seen_at || rows[0].lastSeenAt || rows[0].current)).toBeTruthy();
  });
});
