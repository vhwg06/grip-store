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

test.describe("Admin Review API @api", () => {
  test("UC-REV-04 reads moderation context from the review queue payload", async ({ request }) => {
    const token = await getAdminToken(request);

    const response = await request.get(`${BACKEND_URL}/v1/admin/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    const reviews = Array.isArray(payload?.data?.reviews) ? payload.data.reviews : [];
    expect(reviews.length).toBeGreaterThan(0);

    const match = reviews[0];
    expect(match).toMatchObject({
      id: expect.any(Number),
      orderId: expect.any(String),
      productId: expect.any(String),
      productName: expect.any(String),
      userId: expect.any(String),
      username: expect.any(String),
      rating: expect.any(Number),
      comment: expect.any(String),
      status: expect.any(String),
      isVerifiedPurchase: expect.any(Boolean),
    });
    expect(Array.isArray(match?.attachments)).toBeTruthy();
  });
});
