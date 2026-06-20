import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";

test.describe("Admin Review API @api P2", () => {
  test("UC-REV-01 rejects unauthenticated review moderation reads", async ({ request }) => {
    // GOAL: Admin Reviews Moderation Queue: xác định review nào cần moderation và review nào đã ở public-eligible state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-01 Exception flow
    const response = await request.get(`${BACKEND_URL}/v1/admin/reviews`);
    expect(response.status()).toBe(401);
  });

  test("UC-REV-01 rejects non-admin review moderation reads", async ({ request }) => {
    // GOAL: Admin Reviews Moderation Queue: xác định review nào cần moderation và review nào đã ở public-eligible state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-01 Exception flow
    const token = await getUserToken(request);
    const response = await request.get(`${BACKEND_URL}/v1/admin/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
  });

  test("UC-REV-04 reads moderation context from the review queue payload", async ({ request }) => {
    // GOAL: Admin Reads Review Context Before Moderation: hiểu product, customer, order, attachments liên quan trước khi quyết định moderation.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-04 Main flow
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
