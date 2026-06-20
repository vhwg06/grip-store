import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";
const TEST_USER_ID = "22222222-2222-2222-2222-222222222222";
const TEST_ADMIN_ID = "11111111-1111-1111-1111-111111111111";

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

function extractUsers(payload: any) {
  const root = payload?.data ?? payload;
  return Array.isArray(root) ? root : [];
}

function findUser(users: any[], id: string) {
  return users.find((item: any) => item.id === id || item.userId === id || item.user_id === id);
}

test.describe("Admin User API @api", () => {
  test("UC-USER-01 finds an account from account-centric search", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?q=test_admin&page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    expect(users.length).toBeGreaterThan(0);
    expect(findUser(users, TEST_ADMIN_ID)).toBeTruthy();

    const unrelated = users.find(
      (user: any) => user.username === "test_buyer" || user.email === "test_buyer@example.com",
    );
    expect(unrelated).toBeFalsy();
  });

  test("UC-USER-02 reads account state with explicit account fields", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    const user = findUser(users, TEST_USER_ID);

    expect(user).toMatchObject({
      id: TEST_USER_ID,
      username: "test_buyer",
      email: "test_buyer@example.com",
      role: expect.any(String),
      points: expect.any(Number),
    });
    expect(user).toHaveProperty("last_login_at");
    expect(user).toHaveProperty("is_blocked");
  });

  test("UC-USER-03 manages account state through points and block controls", async ({ request }) => {
    test.fail(true, "blocked-be-gap: PATCH /v1/admin/users/:id/points and /block return 404");

    const points = await adminPatch(request, `/v1/admin/users/${TEST_USER_ID}/points`, {
      points: 1300,
    });
    expect(points.status()).toBe(200);

    const block = await adminPatch(request, `/v1/admin/users/${TEST_USER_ID}/block`, {
      isBlocked: true,
    });
    expect(block.status()).toBe(200);
  });

  test("UC-USER-04 traverses from user to customer context via linked customer metadata", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    const user = findUser(users, TEST_USER_ID);

    expect(user).toBeTruthy();
    expect(
      user.customer_id ??
        user.customerId ??
        user.linked_customer_id ??
        user.linkedCustomerId ??
        user.customer_context_id ??
        user.customerContextId,
    ).toBeTruthy();
  });

  test("UC-USER-05 keeps account control distinct from commerce support in the API contract", async ({ request }) => {
    const response = await adminGet(request, "/v1/admin/users?page=1&pageSize=20");
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const users = extractUsers(payload);
    const user = findUser(users, TEST_USER_ID);

    expect(user).toMatchObject({
      role: expect.any(String),
      status: expect.any(String),
      points: expect.any(Number),
      is_admin: expect.any(Boolean),
    });
    expect(user).not.toHaveProperty("orderCount");
    expect(user).not.toHaveProperty("order_count");
    expect(user).not.toHaveProperty("refundCount");
    expect(user).not.toHaveProperty("reviewCount");
  });
});
