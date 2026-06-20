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

test.describe("Admin Profile API @api", () => {
  test("UC-APRO-01 reads current admin identity from the self-profile contract", async ({ request }) => {
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
