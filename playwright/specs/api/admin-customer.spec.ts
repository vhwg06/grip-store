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

async function registerEmptyHistoryUser(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const email = `pw-empty-${suffix}@example.com`;
  const username = `pw_empty_${suffix}`;
  const response = await request.post(`${BACKEND_URL}/v1/auth/register`, {
    data: {
      username,
      email,
      password: "Password123!",
    },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return {
    id: String(payload?.id ?? payload?.data?.id ?? ""),
    username,
    email,
  };
}

function extractUsers(payload: any) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

test.describe("Admin Customer API @api", () => {
  test("UC-CUS-01 finds a customer record by commerce identity query", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    expect(users.length).toBeGreaterThan(0);
    expect(users.some((item: any) => item.username === "test_buyer")).toBeTruthy();
    expect(users.every((item: any) => item.username === "test_buyer")).toBeTruthy();
  });

  test("UC-CUS-02 returns a customer summary with commerce indicators", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    const buyer = users.find((item: any) => item.username === "test_buyer");
    expect(buyer).toBeTruthy();
    expect(buyer).toHaveProperty("customerId");
    expect(
      typeof buyer.displayName === "string" ||
      typeof buyer.email === "string" ||
      typeof buyer.phone === "string",
    ).toBeTruthy();
    expect(buyer).toHaveProperty("orderCount");
  });

  test("UC-CUS-03 exposes linked commerce context from the customer root", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?q=test_buyer&page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    const buyer = users.find((item: any) => item.username === "test_buyer");
    expect(buyer).toBeTruthy();
    expect(buyer).toHaveProperty("orderCount");
    expect(buyer).toHaveProperty("refundCount");
    expect(buyer).toHaveProperty("reviewCount");
  });

  test("UC-CUS-04 keeps customer identity distinct from user-account identity", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    expect(users.some((item: any) => item.is_admin === true || item.role === "Administrator")).toBeFalsy();
  });

  test("UC-CUS-05 returns a valid customer root even with empty commerce history", async ({ request }) => {
    const created = await registerEmptyHistoryUser(request);

    const response = await adminGet(request, `/v1/admin/users?q=${encodeURIComponent(created.email)}&page=1&pageSize=20`);
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    const emptyHistory = users.find((item: any) => item.email === created.email);
    expect(emptyHistory).toBeTruthy();
    expect(emptyHistory.orderCount ?? 0).toBe(0);
  });
});
