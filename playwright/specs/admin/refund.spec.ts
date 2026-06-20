import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

async function createRefundRequest(request: any, reason: string) {
  const adminToken = await getAdminToken(request);
  const userToken = await getUserToken(request);

  const createdOrder = await request.post(`${BACKEND_URL}/v1/checkout/orders`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: {
      productId: CHECKOUT_PRODUCT_ID,
      quantity: 1,
      email: process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
    },
  });
  expect(createdOrder.ok()).toBeTruthy();
  const orderId = String((await createdOrder.json())?.data?.id);

  await request.patch(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: "paid" },
  });
  await request.patch(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: "delivered" },
  });

  const refund = await request.post(`${BACKEND_URL}/v1/orders/${orderId}/refund-request`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: { reason },
  });
  expect(refund.status()).toBe(201);
  const refundPayload = await refund.json();
  const data = refundPayload?.data ?? refundPayload;

  return {
    orderId,
    refundId: Number(data.id),
  };
}

async function fetchRefunds(request: any, status = "all") {
  const adminToken = await getAdminToken(request);
  const response = await request.get(`${BACKEND_URL}/v1/admin/refunds?status=${status}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function searchRefund(page: any, query: string) {
  await page.getByPlaceholder("Search refund or order...").fill(query);
  await page.waitForTimeout(300);
}

test.describe("Admin Refund @admin P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/refunds");
    await page.waitForLoadState("networkidle");
  });

  test("UC-REF-01 reviews the refund queue and opens evidence", async ({ page }) => {
    // GOAL: Admin Reviews Refund Queue: xác định refund request nào cần xử lý và request nào chỉ cần theo dõi.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-01 Main flow
    // INVARIANT: refund queue là operational decision surface — chỉ hiển thị pending requests
    // INVARIANT: request đã có decision không được bị hiểu như request còn pending
    await expect(page.getByRole("heading", { name: "Refund Requests" })).toBeVisible();
    await expect(page.locator('[data-testid="refunds-queue-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Open request" }).first()).toBeVisible();

    const items = page.locator('[data-testid="refund-queue-item"]');
    const count = await items.count();
    for (let index = 0; index < count; index += 1) {
      await expect(items.nth(index)).not.toContainText(/approved/i);
      await expect(items.nth(index)).not.toContainText(/rejected/i);
    }
  });

  test("UC-REF-02 reads refund evidence before deciding", async ({ page, request }) => {
    // GOAL: Admin Reads Refund Evidence Before Deciding: đọc đủ dữ kiện cần thiết trước khi approve hoặc reject.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-02 Main flow
    // INVARIANT: evidence review là bước nghiệp vụ bắt buộc trước decision — panel phải expose actual values
    // INVARIANT: refund decision không được ra chỉ từ queue row
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const created = await createRefundRequest(request, `evidence-probe ${Date.now()}`);
    await searchRefund(page, created.orderId);
    await page.getByText(created.orderId, { exact: false }).first().click();

    await expect(page.locator('[data-testid="refunds-decision-panel"]')).toContainText(created.orderId);
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).toContainText("Customer Reason");
    await expect(page.locator('[data-testid="refunds-evidence-panel"]')).not.toContainText("undefined");

    test.fail(true, "blocked-both: refund detail endpoint /v1/admin/refunds/:id missing — payment context unavailable");
    await expect(page.locator('[data-testid="refunds-evidence-payment-context"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="refunds-evidence-trade-ref"]')).not.toBeEmpty();
  });

  test("UC-REF-03 approves a refund from the admin decision surface", async ({ page, request }) => {
    // GOAL: Admin Approves A Refund: chấp nhận refund request khi dữ kiện hỗ trợ cho refund outcome đó.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-03 Main flow
    // INVARIANT: approved refund phải disappear khỏi pending queue (reconciled out)
    // INVARIANT: duplicate approve không được tạo extra transition
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const created = await createRefundRequest(request, `approve-fe ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    const approveResponse = page.waitForResponse(
      (response: any) =>
        response.url().includes(`/v1/admin/refunds/${created.refundId}/approve`) &&
        [200, 201, 204].includes(response.status()),
    );
    await page.getByRole("button", { name: "Approve refund" }).click();
    await page.getByRole("button", { name: "Yes, Confirm" }).click();
    await approveResponse;

    await expect(
      page.locator('[data-testid="refunds-queue-container"]').getByText(created.orderId, { exact: false }),
    ).toBeHidden();
  });

  test("UC-REF-04 rejects a refund from the admin decision surface", async ({ page, request }) => {
    // GOAL: Admin Rejects A Refund: từ chối refund request khi dữ kiện không đủ hoặc không phù hợp.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-04 Exception flow
    // INVARIANT: reject phải kết thúc pending decision state — không thể reject thêm lần 2
    // INVARIANT: rejected refund vẫn phải để lại decision history (admin_note)
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const created = await createRefundRequest(request, `reject-fe ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    const rejectResponse = page.waitForResponse(
      (response: any) =>
        response.url().includes(`/v1/admin/refunds/${created.refundId}/reject`) &&
        [200, 201, 204].includes(response.status()),
    );
    await page.getByRole("button", { name: "Reject request" }).click();
    await page.getByRole("button", { name: "Yes, Confirm" }).click();
    await rejectResponse;

    await expect(
      page.locator('[data-testid="refunds-queue-container"]').getByText(created.orderId, { exact: false }),
    ).toBeHidden();
  });

  test("UC-REF-05 reviews a refund that is already decided", async ({ page, request }) => {
    // GOAL: Admin Reviews A Refund That Is Already Decided: hiểu historical refund outcome trước khi xử lý downstream operational questions.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-REF-05 Main flow
    test.fail(true, "blocked-both: approved refunds tab does not list resolved refunds from API");
    const approvedPayload = await fetchRefunds(request, "approved");
    const approvedItems = Array.isArray(approvedPayload?.data) ? approvedPayload.data : [];
    expect(approvedItems.length).toBeGreaterThan(0);
    const approved = approvedItems[0];

    await searchRefund(page, String(approved.order_id));

    await expect(page.getByText(String(approved.order_id), { exact: false })).toBeVisible();
    await expect(page.getByText(/approved/i)).toBeVisible();
    await expect(page.getByText(String(approved.admin_note), { exact: false })).toBeVisible();
  });

  test("UC-REF-01 alternate: renders empty state gracefully", async ({ page }) => {
    // GOAL: Admin Reviews Refund Queue: xác định refund request nào cần xử lý và request nào chỉ cần theo dõi.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-01 Alternate flow
    await searchRefund(page, "nonexistent-refund-12345xyz");
    await expect(page.getByText("No refund requests in queue matching the filters.")).toBeVisible();
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });

  test("UC-REF-01 exception: approved refund does not appear in pending queue", async ({ page, request }) => {
    // GOAL: Admin Reviews Refund Queue: xác định refund request nào cần xử lý và request nào chỉ cần theo dõi.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-01 Exception flow
    // INVARIANT: approved refund must not be present in the pending queue
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const created = await createRefundRequest(request, `approved-disappear ${Date.now()}`);

    const adminToken = await getAdminToken(request);
    const approveResp = await request.post(`${BACKEND_URL}/v1/admin/refunds/${created.refundId}/approve`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { adminNote: "Approved to verify disappear" },
    });
    expect(approveResp.ok()).toBeTruthy();

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    await expect(
      page.locator('[data-testid="refunds-queue-container"]').getByText(created.orderId, { exact: false }),
    ).toBeHidden();
  });

  test("UC-REF-04 exception: cannot reject an already-decided refund", async ({ page, request }) => {
    // GOAL: Admin Rejects A Refund: từ chối refund request khi dữ kiện không đủ hoặc không phù hợp.
    // PRIORITY: P2
    // RELATED DOMAINS: order
    // SCENARIO: SC-REF-04 Exception flow
    // INVARIANT: a refund with a final decision cannot be rejected again
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const created = await createRefundRequest(request, `reject-already-decided ${Date.now()}`);

    const adminToken = await getAdminToken(request);
    const approveResp = await request.post(`${BACKEND_URL}/v1/admin/refunds/${created.refundId}/approve`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { adminNote: "Decided to test rejection block" },
    });
    expect(approveResp.ok()).toBeTruthy();

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    await expect(page.getByRole("button", { name: "Reject request" })).toBeHidden();
  });

  test("UC-REF-03 alternate: admin adds decision note before approving refund", async ({ page, request }) => {
    // GOAL: Admin Approves A Refund: chấp nhận refund request khi dữ kiện hỗ trợ cho refund outcome đó.
    // PRIORITY: P2
    // RELATED DOMAINS: order, payment
    // SCENARIO: SC-REF-02 Alternate flow
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const created = await createRefundRequest(request, `approve-with-note ${Date.now()}`);

    await page.goto(`/admin/refunds`);
    await page.waitForLoadState("networkidle");
    await searchRefund(page, created.orderId);

    const refundCard = page.getByText(created.orderId, { exact: false }).first();
    await expect(refundCard).toBeVisible();
    await refundCard.click();

    const noteInput = page.locator('[data-testid="refund-decision-note"]');
    await expect(noteInput).toBeVisible();
    await noteInput.fill("Persisted decision note from test");

    await page.getByRole("button", { name: "Approve request" }).click();
    await expect(page.locator(".toast-success, [data-type='success'], [role='status']").first()).toBeVisible();

    await page.getByRole("tab", { name: "History" }).click();
    await searchRefund(page, created.orderId);
    await page.getByText(created.orderId, { exact: false }).first().click();
    await expect(page.getByText("Persisted decision note from test")).toBeVisible();
  });
});

