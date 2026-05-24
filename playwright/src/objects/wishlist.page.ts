import { BasePage } from "./base.page";
import type { WishlistItemData } from "./types";

export class WishlistPage extends BasePage {
  async goto() {
    await super.goto("/buy?tab=wishlist");
  }

  async getItems(): Promise<WishlistItemData[]> {
    const items = this.page.locator('[data-testid="wishlist-item"]');
    const count = await items.count();
    const result: WishlistItemData[] = [];
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      result.push({
        productId: (await item.getAttribute("data-product-id")) ?? "",
        title: await item.locator('[data-testid="wishlist-item-title"]').innerText(),
        votes: parseInt(await item.locator('[data-testid="wishlist-item-votes"]').innerText(), 10),
      });
    }
    return result;
  }

  async addItem(productId: string) {
    await this.page.locator(`[data-product-id="${productId}"] [data-testid="add-wishlist-btn"]`).click();
    await this.waitForNetworkIdle();
  }

  async removeItem(productId: string) {
    await this.page.locator(`[data-product-id="${productId}"] [data-testid="remove-wishlist-btn"]`).click();
    await this.waitForNetworkIdle();
  }

  async voteItem(productId: string) {
    await this.page.locator(`[data-product-id="${productId}"] [data-testid="vote-wishlist-btn"]`).click();
    await this.waitForNetworkIdle();
  }
}
