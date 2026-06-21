import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken, getUserToken, registerFreshBuyer } from "../../src/api-helpers/auth.helpers";
const CHECKOUT_PRODUCT_ID = "b2222222-2222-2222-2222-222222222222";

async function createPendingOrderViaApi(request: any) {
  const userToken = await getUserToken(request);
  expect(userToken).toBeTruthy();

  const response = await request.post(`${BACKEND_URL}/v1/checkout/orders`, {
    headers: { Authorization: `Bearer ${userToken}` },
    data: {
      productId: CHECKOUT_PRODUCT_ID,
      quantity: 1,
      email: process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
    },
  });
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const order = payload?.data ?? payload;
  expect(order?.id).toBeTruthy();
  expect(order?.status).toBe("pending");
  return String(order.id);
}

async function fetchAdminOrder(request: any, orderId: string) {
  const adminToken = await getAdminToken(request);
  expect(adminToken).toBeTruthy();

  const response = await request.get(`${BACKEND_URL}/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe("Admin Orders @admin P1 P2", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto();
    await adminPage.navigateTo("orders");
  });

  test("UC-ORD-01 renders queue state and preserves row-to-detail handoff", async ({ page }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Main flow
    // INVARIANT: order queue là projection của server state, không phải kết quả FE tự suy diễn
    // INVARIANT: action availability phải phản ánh business state hiện tại của order
    await expect(page.getByRole("heading", { name: "Order Management" })).toBeVisible();
    await expect(page.locator('[data-testid="admin-table"]')).toBeVisible();

    const deliveredRow = page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first();
    await expect(deliveredRow).toBeVisible();
    await expect(deliveredRow).toContainText("Delivered");
    await expect(deliveredRow.getByRole("button", { name: "Mark delivered" })).toBeDisabled();

    await deliveredRow.getByRole("link", { name: "Open detail" }).click();
    await expect(page).toHaveURL(/\/admin\/orders\/test-order-0001$/);
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
  });

  test("UC-ORD-02 renders order detail context before action", async ({ page }) => {
    // GOAL: Admin Examines Order Detail Before Acting: đọc đầy đủ ngữ cảnh của một order trước khi ra quyết định vận hành.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-02 Main flow
    await page.goto("/admin/orders/test-order-0001");
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();

    await expect(page.getByText("Order Detail #test-order-0001")).toBeVisible();
    await expect(page.getByText("test_buyer@example.com")).toBeVisible();
    await expect(page.getByText("Payment Method")).toBeVisible();
    await expect(page.getByText("Order Timeline & Notes")).toBeVisible();
    await expect(page.getByText("This order is in a terminal state (DELIVERED). No further actions are allowed.")).toBeVisible();
  });

  test("UC-ORD-03 submits a valid pending-to-paid transition from the admin queue", async ({ page, request }) => {
    // GOAL: Admin Performs An Allowed Order Transition: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
    // PRIORITY: P1
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-03 Main flow
    // INVARIANT: không phải mọi action đều hợp lệ trên mọi state
    // INVARIANT: failed transition không được tạo ra partial state — timeline phải nhất quán sau transition
    test.fail(true, "blocked-be-gap: checkout /v1/checkout/orders returns 500");
    const orderId = await createPendingOrderViaApi(request);

    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto(`/admin/orders?q=${orderId}`);
    await listResponse;

    const row = page.locator('[data-testid="order-row"]').filter({ hasText: orderId }).first();
    await expect(row).toBeVisible();
    await expect(row.getByRole("button", { name: "Mark delivered" })).toBeDisabled();

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await row.click();
    await page.getByRole("button", { name: "Mark paid" }).click();
    await page.waitForLoadState("networkidle");

    const payload = await fetchAdminOrder(request, orderId);
    expect(payload.status).toBe("PAID");
    expect(payload.paidAt).toBeTruthy();
  });

  test("UC-ORD-05 renders refund relevance for an order that has a pending refund request", async ({ page }) => {
    // GOAL: Admin Verifies Refund Relevance On An Order: biết order có đang hoặc đã đi qua refund flow hay không trước khi tiếp tục xử lý order.
    // PRIORITY: P2
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-05 Main flow
    // INVARIANT: refund không được ẩn khỏi order context
    // INVARIANT: order domain phải biết sự tồn tại của refund nhưng không tự quyết refund outcome
    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto("/admin/orders?q=test-order-0001");
    await listResponse;

    const row = page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first();
    await expect(row).toBeVisible();
    await row.click();

    await expect(page.getByText("Order Signals")).toBeVisible();
    const refundSignalRow = page.getByText("Refund requested", { exact: true }).locator("xpath=..");
    await expect(refundSignalRow).toBeVisible();
    await expect(refundSignalRow.getByText("Requested", { exact: true })).toBeVisible();
  });

  test("UC-ORD-06 keeps incomplete-context order detail readable with safe fallbacks", async ({ page }) => {
    // GOAL: Admin Reads An Order Even When Operational Data Is Incomplete: vẫn hiểu được order enough to act safely khi một phần dữ liệu phụ trợ không đầy đủ.
    // PRIORITY: P2
    // RELATED DOMAINS: none
    // SCENARIO: SC-ORD-06 Main flow
    test.fail(true, "blocked-fe-gap: /admin/orders/[id] route is broken under static export, direct navigation fails");
    await page.goto("/admin/orders/test-order-0002");
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark delivered" })).toBeDisabled();
    await expect(page.getByText("Awaiting fulfillment (missing tracking ID - safe fallback)")).toBeVisible();
    await expect(page.getByText(/missing shipping address/i)).toBeVisible();
    await expect(page.getByText("COD / QR Transfer")).toBeVisible();
    await expect(page.getByText("Thu Duc, Ho Chi Minh City")).toBeVisible();
  });

  test("UC-ORD-01 alternate: renders empty state gracefully", async ({ page }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Alternate flow
    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto("/admin/orders?q=nonexistent-order-12345xyz");
    await listResponse;
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No orders found")).toBeVisible();
    await expect(page.locator('[data-testid="error-boundary"]')).toHaveCount(0);
  });

  test("UC-ORD-04 opens customer-linked purchase history from customer context", async ({ page, request }) => {
    // GOAL: Admin Reads Purchase History For A Customer: hiểu lịch sử mua hàng của một customer để hỗ trợ xử lý order hiện tại hoặc ra quyết định hỗ trợ.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-04 Main flow
    test.fail(true, "blocked-both: customer Open history navigates with empty query instead of customer ID");
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    const adminToken = await getAdminToken(request);
    const customerResp = await request.get(`${BACKEND_URL}/v1/admin/users?q=test_buyer&page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(customerResp.ok()).toBeTruthy();
    const customerPayload = await customerResp.json();
    const buyer = Array.isArray(customerPayload?.data)
      ? customerPayload.data.find((item: any) => item.username === "test_buyer")
      : null;
    const buyerCustomerId = buyer?.customerId ?? buyer?.customer_id;
    expect(buyerCustomerId).toBeTruthy();

    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByPlaceholder("Search email, phone, user ID...").fill("test_buyer");
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;

    const buyerRow = page.getByText("test_buyer", { exact: false }).first();
    await buyerRow.click();

    await expect(page.getByText("Customer Actions")).toBeVisible();
    await page.getByRole("button", { name: "Open history" }).click();

    await expect(page).toHaveURL(new RegExp(`/admin/orders\\?q=${buyerCustomerId}`));
    await expect(page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first()).toBeVisible();
  });

  test("UC-ORD-01 exception: returns 404 for nonexistent order ID", async ({ page }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-01 Exception flow
    // INVARIANT: order detail request cho nonexistent ID phải render error state/boundary hoặc 404 page
    test.fail(true, "blocked-fe-gap: /admin/orders/[id] route is broken under static export");
    await page.goto("/admin/orders/nonexistent-order-12345xyz");
    await expect(page.getByText("Order not found", { exact: false })).toBeVisible();
  });

  test("UC-ORD-04 alternate: empty purchase history is a valid resolved state", async ({ page, request }) => {
    // GOAL: Admin Reads Purchase History For A Customer: hiểu lịch sử mua hàng của một customer để hỗ trợ xử lý order hiện tại hoặc ra quyết định hỗ trợ.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-04 Alternate flow
    // INVARIANT: purchase history của customer chưa từng mua hàng phải render trạng thái trống, không crash
    test.fail(true, "blocked-both: customer Open history navigates with empty query instead of customer ID");
    const buyer = await registerFreshBuyer(request);

    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Customer Management" })).toBeVisible();

    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByPlaceholder("Search email, phone, user ID...").fill(buyer.username);
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;

    const buyerRow = page.getByText(buyer.username, { exact: false }).first();
    await expect(buyerRow).toBeVisible();
    await buyerRow.click();

    await expect(page.getByText("Customer Actions")).toBeVisible();
    await page.getByRole("button", { name: "Open history" }).click();

    await expect(page).toHaveURL(new RegExp(`/admin/orders\\?q=`));
    await expect(page.getByText("No orders found")).toBeVisible();
  });

  test("UC-ORD-03 alternate: delivered order has no further allowed actions", async ({ page }) => {
    // GOAL: Admin Performs An Allowed Order Transition: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
    // PRIORITY: P1
    // RELATED DOMAINS: refund
    // SCENARIO: SC-ORD-03 Alternate flow
    // INVARIANT: order ở terminal state (DELIVERED) không cho phép bất kỳ transition nào tiếp theo
    test.fail(true, "blocked-fe-gap: /admin/orders/[id] route is broken under static export, direct navigation fails");
    await page.goto("/admin/orders/test-order-0001");
    await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();

    await expect(page.getByRole("button", { name: "Mark paid" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Mark delivered" })).toBeDisabled();
  });

  test("UC-ORD-01 alternate: narrows order queue by filter and sees only matching rows", async ({ page }) => {
    // GOAL: Admin Reviews Order Queue: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
    // PRIORITY: P1
    // RELATED DOMAINS: customer, refund, payment
    // SCENARIO: SC-ORD-01 Alternate flow
    const listResponse = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/orders") && response.status() === 200,
    );
    await page.goto("/admin/orders?q=test-order-0001");
    await listResponse;
    await page.waitForLoadState("networkidle");

    const orderRow = page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" });
    await expect(orderRow.first()).toBeVisible();
    
    const unrelatedRow = page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0002" });
    await expect(unrelatedRow).toHaveCount(0);
  });

  test("UC-ORD-04 alternate: customer purchase history shows multiple orders in high-level pattern", async ({ page, request }) => {
    // GOAL: Admin Reads Purchase History For A Customer: hiểu lịch sử mua hàng của một customer để hỗ trợ xử lý order hiện tại hoặc ra quyết định hỗ trợ.
    // PRIORITY: P1
    // RELATED DOMAINS: customer
    // SCENARIO: SC-ORD-04 Alternate flow
    test.fail(true, "blocked-both: customer Open history navigates with empty query instead of customer ID");
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    const adminToken = await getAdminToken(request);
    const customerResp = await request.get(`${BACKEND_URL}/v1/admin/users?q=test_buyer&page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(customerResp.ok()).toBeTruthy();
    const customerPayload = await customerResp.json();
    const buyer = Array.isArray(customerPayload?.data)
      ? customerPayload.data.find((item: any) => item.username === "test_buyer")
      : null;
    const buyerCustomerId = buyer?.customerId ?? buyer?.customer_id;
    expect(buyerCustomerId).toBeTruthy();

    const responsePromise = page.waitForResponse(
      (response: any) => response.url().includes("/v1/admin/users") && response.status() === 200,
    );
    await page.getByPlaceholder("Search email, phone, user ID...").fill("test_buyer");
    await page.getByRole("button", { name: "Search" }).click();
    await responsePromise;

    const buyerRow = page.getByText("test_buyer", { exact: false }).first();
    await buyerRow.click();

    await page.getByRole("button", { name: "Open history" }).click();

    await expect(page).toHaveURL(new RegExp(`/admin/orders\\?q=${buyerCustomerId}`));
    
    await expect(page.locator('[data-testid="order-row"]').filter({ hasText: "test-order-0001" }).first()).toBeVisible();
  });
});

