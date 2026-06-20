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

async function adminPost(request: any, path: string, data: Record<string, unknown>) {
  const token = await getAdminToken(request);
  return request.post(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

async function adminDelete(request: any, path: string) {
  const token = await getAdminToken(request);
  return request.delete(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function listReviews(request: any, status?: string) {
  const suffix = status ? `?status=${status}` : "";
  const response = await adminGet(request, `/v1/admin/reviews${suffix}`);
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  const data = payload?.data ?? payload;

  return {
    payload,
    data,
    reviews: Array.isArray(data?.reviews) ? data.reviews : [],
  };
}

test.describe("Admin Review Moderation API @api P2", () => {
  test("UC-REV-01 reviews the moderation queue", async ({ request }) => {
    // GOAL: Admin Reviews Moderation Queue: xác định review nào cần moderation và review nào đã ở public-eligible state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-01 Main flow
    const pending = await listReviews(request, "PENDING");
    expect(pending.reviews.length).toBeGreaterThan(0);
    expect(pending.reviews.every((review: any) => review.status === "PENDING")).toBeTruthy();
    expect(pending.data?.stats?.pending).toBeGreaterThan(0);
  });

  test("UC-REV-02 moderates a single review", async ({ request }) => {
    // GOAL: Admin Moderates A Single Review: đưa một review sang state phù hợp với business moderation policy.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-02 Main flow
    const approved = await listReviews(request, "APPROVED");
    const target = approved.reviews.find((review: any) => review.comment?.includes("probe bulk"));
    expect(target?.id).toBeTruthy();

    const hide = await adminPut(request, `/v1/admin/reviews/${target.id}/hide`, {});
    expect(hide.ok()).toBeTruthy();
    const hidePayload = await hide.json();
    const hideData = hidePayload?.data ?? hidePayload;
    expect(hideData).toMatchObject({
      id: target.id,
      status: "HIDDEN",
      success: true,
    });

    const hidden = await listReviews(request, "HIDDEN");
    expect(hidden.reviews.some((review: any) => review.id === target.id)).toBeTruthy();
  });

  test("UC-REV-03 bulk publishes selected reviews", async ({ request }) => {
    // GOAL: Admin Bulk Publishes Eligible Reviews: xử lý nhiều review pending cùng lúc khi chúng cùng đủ điều kiện public.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-REV-03 Main flow
    const pending = await listReviews(request, "PENDING");
    expect(pending.reviews.length).toBeGreaterThanOrEqual(2);

    const selected = pending.reviews.slice(0, 2).map((review: any) => Number(review.id));
    const publish = await adminPost(request, "/v1/admin/reviews/publish-selected", {
      ids: selected,
    });
    expect(publish.ok()).toBeTruthy();
    const publishPayload = await publish.json();
    const publishData = publishPayload?.data ?? publishPayload;
    expect(publishData).toMatchObject({
      count: 2,
      status: "APPROVED",
      success: true,
    });

    const after = await listReviews(request, "PENDING");
    expect(after.reviews.some((review: any) => selected.includes(Number(review.id)))).toBeFalsy();
  });

  test("UC-REV-05 removes a review from the moderation surface", async ({ request }) => {
    // GOAL: Admin Removes A Review From The Moderation Surface: loại bỏ một review khỏi moderation surface khi review đó không nên tiếp tục tồn tại như review artifact.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-05 Main flow
    const hidden = await listReviews(request, "HIDDEN");
    const target = hidden.reviews.find((review: any) => review.comment?.includes("probe hide"));
    expect(target?.id).toBeTruthy();

    const deleted = await adminDelete(request, `/v1/admin/reviews/${target.id}`);
    expect(deleted.ok()).toBeTruthy();
    const deletedPayload = await deleted.json();
    const deletedData = deletedPayload?.data ?? deletedPayload;
    expect(deletedData).toMatchObject({
      id: target.id,
      success: true,
    });

    const all = await listReviews(request);
    expect(all.reviews.some((review: any) => review.id === target.id)).toBeFalsy();
  });
});
