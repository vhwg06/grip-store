import { BasePage } from "./base.page";
import type { CartItemData } from "./types";

export class CartPage extends BasePage {
  async goto() {
    await super.goto("/cart");
    await this.waitForCartReady();
  }

  async getItems(): Promise<CartItemData[]> {
    await this.waitForCartReady();
    const rows = this.page.locator('[data-testid="cart-item"]');
    const count = await rows.count();
    const items: CartItemData[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      items.push({
        productId: (await row.getAttribute("data-product-id")) ?? "",
        title: await row.locator('[data-testid="cart-item-title"]').innerText(),
        quantity: parseInt(await row.locator('[data-testid="cart-item-qty"]').inputValue(), 10),
        price: await row.locator('[data-testid="cart-item-price"]').innerText(),
      });
    }
    return items;
  }

  private async waitForCartReady() {
    const row = this.page.locator('[data-testid="cart-item"]').first();
    const emptyState = this.page.locator('[data-testid="empty-cart"]');
    await Promise.race([
      row.waitFor({ state: "visible", timeout: 4000 }).catch(() => undefined),
      emptyState.waitFor({ state: "visible", timeout: 4000 }).catch(() => undefined),
    ]);
  }

  async updateQuantity(index: number, quantity: number) {
    const row = this.page.locator('[data-testid="cart-item"]').nth(index);
    await row.locator('[data-testid="cart-item-qty"]').fill(String(quantity));
    await row.locator('[data-testid="cart-item-qty"]').press("Enter");
    await this.waitForNetworkIdle();
  }

  async removeItem(index: number) {
    await this.page.locator('[data-testid="cart-item"]').nth(index).locator('[data-testid="remove-item-btn"]').click();
    await this.waitForNetworkIdle();
  }

  async getTotal(): Promise<string> {
    return this.page.locator('[data-testid="cart-total"]').innerText();
  }

  async proceedToCheckout() {
    await this.page.locator('[data-testid="checkout-btn"]').click();
  }
}
