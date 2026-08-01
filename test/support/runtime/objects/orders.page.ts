import { BasePage } from "./base.page";
import type { OrderSummaryData } from "./types";

export class OrdersPage extends BasePage {
  async goto() {
    await super.goto("/admin/orders");
  }

  async getOrders(): Promise<OrderSummaryData[]> {
    const rows = this.page.locator('[data-testid="order-row"]');
    const count = await rows.count();
    const orders: OrderSummaryData[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      orders.push({
        id: (await row.getAttribute("data-order-id")) ?? "",
        status: await row.locator('[data-testid="order-status"]').innerText(),
        total: await row.locator('[data-testid="order-total"]').innerText(),
        createdAt: await row.locator('[data-testid="order-date"]').innerText(),
      });
    }
    return orders;
  }

  async viewOrderDetail(orderId: string) {
    await this.page.locator(`[data-order-id="${orderId}"] [data-testid="view-order-btn"]`).click();
  }

  async cancelOrder(orderId: string) {
    await this.page.locator(`[data-order-id="${orderId}"] [data-testid="cancel-order-btn"]`).click();
    await this.page.locator('[data-testid="confirm-cancel-btn"]').click();
    await this.waitForNetworkIdle();
  }

  async requestRefund(orderId: string, reason: string) {
    await this.page.locator(`[data-order-id="${orderId}"] [data-testid="refund-btn"]`).click();
    await this.page.locator('[data-testid="refund-reason"]').fill(reason);
    await this.page.locator('[data-testid="submit-refund-btn"]').click();
    await this.waitForNetworkIdle();
  }
}
