import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function fetchReviews(request: any, status?: string) {
  const token = await getAdminToken(request);
  const suffix = status ? `?status=${status}` : "";
  const response = await request.get(`${BACKEND_URL}/v1/admin/reviews${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  const data = payload?.data ?? payload;
  return Array.isArray(data?.reviews) ? data.reviews : [];
}

async function openReviews(page: any) {
  await page.goto("/admin/reviews");
  await page.waitForLoadState("networkidle");
}

async function searchForReview(page: any, query: string) {
  const search = page.getByPlaceholder("Search reviews by product, user or comment...");
  const responsePromise = page.waitForResponse(
    (response: any) => response.url().includes("/v1/admin/reviews") && response.status() === 200,
  );
  await search.fill(query);
  await responsePromise;
}

function queueItemByText(page: any, text: string) {
  return page.locator('[data-testid="review-queue-item"]').filter({ hasText: text }).first();
}

test.describe("Admin Review Moderation E2E @admin P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("UC-REV-01 reviews the moderation queue", async ({ page, request }) => {
    // GOAL: Admin Reviews Moderation Queue: xác định review nào cần moderation và review nào đã ở public-eligible state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-01 Main flow
    const pending = await fetchReviews(request, "PENDING");
    expect(pending.length).toBeGreaterThan(0);
    const target = pending[0];

    await openReviews(page);
    await searchForReview(page, String(target.comment ?? target.username));

    await expect(page.getByRole("heading", { name: "Review Moderation" })).toBeVisible();
    await expect(page.locator('[data-testid="reviews-stats-pending"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-stats-featured"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-stats-hidden"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-queue-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-action-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-context-panel"]')).toBeVisible();
    await expect(queueItemByText(page, String(target.comment ?? target.username))).toBeVisible();
  });

  test("UC-REV-02 moderates a single review", async ({ page, request }) => {
    // GOAL: Admin Moderates A Single Review: đưa một review sang state phù hợp với business moderation policy.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-02 Main flow
    // INVARIANT: approve, hide, delete, feature không đồng nghĩa nhau — mỗi action có public visibility consequence khác nhau
    // INVARIANT: hide → button disabled sau khi executed (không thể hide thêm lần nữa)
    const approved = await fetchReviews(request, "APPROVED");
    const target = approved.find((review: any) => review.comment?.includes("probe approve"));
    expect(target?.comment).toBeTruthy();

    await openReviews(page);
    await searchForReview(page, target.comment);

    const reviewCard = queueItemByText(page, target.comment);
    await expect(reviewCard).toBeVisible();
    await reviewCard.click();

    const hideButton = page.locator('[data-testid="review-action-hide"]');
    await expect(hideButton).toBeEnabled();
    await hideButton.click();

    await expect(page.locator('[data-testid="reviews-context-panel"]')).toContainText("HIDDEN");
    await expect(hideButton).toBeDisabled();
    await expect(reviewCard).toContainText("HIDDEN");
  });

  test("UC-REV-03 bulk publishes selected pending reviews", async ({ page, request }) => {
    // GOAL: Admin Bulk Publishes Eligible Reviews: xử lý nhiều review pending cùng lúc khi chúng cùng đủ điều kiện public.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-REV-03 Main flow
    const pending = await fetchReviews(request, "PENDING");
    expect(pending.length).toBeGreaterThanOrEqual(2);

    await openReviews(page);

    const bulkButton = page.locator('[data-testid="reviews-bulk-publish-btn"]');
    const firstCard = page.locator('[data-testid="review-queue-item"]').nth(0);
    const secondCard = page.locator('[data-testid="review-queue-item"]').nth(1);

    await expect(firstCard).toContainText("PENDING");
    await expect(secondCard).toContainText("PENDING");
    await firstCard.locator('[data-testid="review-item-checkbox"]').check();
    await secondCard.locator('[data-testid="review-item-checkbox"]').check();

    await expect(bulkButton).toHaveText("Publish Selected (2)");
    await bulkButton.click();

    await expect(bulkButton).toHaveText("Publish Selected (0)");
    await expect(firstCard).toContainText("APPROVED");
    await expect(secondCard).toContainText("APPROVED");
  });

  test("UC-REV-04 reads moderation context for a selected review", async ({ page, request }) => {
    // GOAL: Admin Reads Review Context Before Moderation: hiểu product, customer, order, attachments liên quan trước khi quyết định moderation.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-04 Main flow
    const reviews = await fetchReviews(request);
    expect(reviews.length).toBeGreaterThan(0);
    const target = reviews[0];

    await openReviews(page);
    await searchForReview(page, String(target.comment ?? target.username));

    const reviewCard = queueItemByText(page, String(target.comment ?? target.username));
    await expect(reviewCard).toBeVisible();
    await reviewCard.click();

    await expect(page.locator('[data-testid="context-product-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-buyer-profile"]')).toContainText(String(target.username));
    await expect(page.locator('[data-testid="context-buyer-profile"]')).toContainText(String(target.userId));
    await expect(page.locator('[data-testid="context-order-id"]')).toHaveText(String(target.orderId));
    await expect(page.locator('[data-testid="context-attachment-count"]')).toContainText(
      `${Array.isArray(target.attachments) ? target.attachments.length : 0} files`,
    );
    await expect(page.locator('[data-testid="reviews-context-panel"]')).toContainText(String(target.comment));
  });

  test("UC-REV-05 removes a review from the moderation surface", async ({ page, request }) => {
    // GOAL: Admin Removes A Review From The Moderation Surface: loại bỏ một review khỏi moderation surface khi review đó không nên tiếp tục tồn tại như review artifact.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-05 Main flow
    // INVARIANT: delete khác hide vì delete chấm dứt artifact thay vì chỉ đổi public meaning
    // INVARIANT: sau delete, review không còn tồn tại trong moderation surface
    const hidden = await fetchReviews(request, "HIDDEN");
    expect(hidden.length).toBeGreaterThan(0);
    const target = hidden[0];

    await openReviews(page);
    await searchForReview(page, String(target.comment ?? target.username));

    const reviewCard = queueItemByText(page, String(target.comment ?? target.username));
    await expect(reviewCard).toBeVisible();
    await reviewCard.click();

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator('[data-testid="review-action-delete"]').click();

    await expect(reviewCard).toBeHidden();
    await expect(page.locator('[data-testid="reviews-queue-container"]')).toContainText("No reviews found");
  });

  test("UC-REV-01 alternate: renders empty state gracefully", async ({ page }) => {
    // GOAL: Admin Reviews Moderation Queue: xác định review nào cần moderation và review nào đã ở public-eligible state.
    // PRIORITY: P2
    // RELATED DOMAINS: product
    // SCENARIO: SC-REV-01 Alternate flow
    await openReviews(page);
    await searchForReview(page, "nonexistent-review-12345xyz");
    await expect(page.locator('[data-testid="reviews-queue-container"]')).toContainText("No reviews found");
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });

  test("UC-REV-02 alternate: approves a single pending review from the moderation surface", async ({ page, request }) => {
    // GOAL: Admin Moderates A Single Review: đưa một review sang state phù hợp với business moderation policy.
    // PRIORITY: P2
    // RELATED DOMAINS: product, customer, order
    // SCENARIO: SC-REV-02 Alternate flow
    const pending = await fetchReviews(request, "PENDING");
    expect(pending.length).toBeGreaterThan(0);
    const target = pending[0];

    await openReviews(page);
    await searchForReview(page, String(target.comment ?? target.username));

    const reviewCard = queueItemByText(page, String(target.comment ?? target.username));
    await expect(reviewCard).toBeVisible();
    await reviewCard.click();

    const approveButton = page.locator('[data-testid="review-action-approve"]');
    await expect(approveButton).toBeEnabled();
    await approveButton.click();

    await expect(page.locator('[data-testid="reviews-context-panel"]')).toContainText("APPROVED");
    await expect(approveButton).toBeDisabled();
    await expect(reviewCard).toContainText("APPROVED");
  });

  test("UC-REV-02 alternate: features an approved review to elevate its prominence", async ({ page, request }) => {
    // GOAL: Admin Moderates A Single Review: đưa một review sang state phù hợp với business moderation policy.
    // PRIORITY: P2
    // RELATED DOMAINS: product, customer, order
    // SCENARIO: SC-REV-04 Alternate flow
    const approved = await fetchReviews(request, "APPROVED");
    expect(approved.length).toBeGreaterThan(0);
    const target = approved[0];

    await openReviews(page);
    await searchForReview(page, String(target.comment ?? target.username));

    const reviewCard = queueItemByText(page, String(target.comment ?? target.username));
    await expect(reviewCard).toBeVisible();
    await reviewCard.click();

    const featureButton = page.locator('[data-testid="review-action-feature"]');
    await expect(featureButton).toBeEnabled();
    await featureButton.click();

    await expect(page.locator('[data-testid="reviews-context-panel"]')).toContainText("FEATURED");
    await expect(featureButton).toBeDisabled();
  });

  test("UC-REV-03 alternate: bulk publish with partial valid selection only applies to eligible reviews", async ({ page, request }) => {
    // GOAL: Admin Bulk Publishes Eligible Reviews: xử lý nhiều review pending cùng lúc khi chúng cùng đủ điều kiện public.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-REV-05 Alternate flow
    const pending = await fetchReviews(request, "PENDING");
    const hidden = await fetchReviews(request, "HIDDEN");
    expect(pending.length).toBeGreaterThan(0);
    expect(hidden.length).toBeGreaterThan(0);

    await openReviews(page);

    const pendingCard = queueItemByText(page, String(pending[0].comment ?? pending[0].username));
    const hiddenCard = queueItemByText(page, String(hidden[0].comment ?? hidden[0].username));

    await pendingCard.locator('[data-testid="review-item-checkbox"]').check();
    await hiddenCard.locator('[data-testid="review-item-checkbox"]').check();

    const bulkButton = page.locator('[data-testid="reviews-bulk-publish-btn"]');
    await expect(bulkButton).toHaveText("Publish Selected (2)");
    await bulkButton.click();

    await expect(pendingCard).toContainText("APPROVED");
    await expect(hiddenCard).toContainText("HIDDEN");
  });
});

