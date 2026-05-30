import { BasePage } from "./base.page";
import type { ReviewData } from "./types";

export class ProductDetailPage extends BasePage {
  async goto(productId: string) {
    await super.goto(`/products/placeholder?id=${encodeURIComponent(productId)}`);
  }

  async getProductTitle(): Promise<string> {
    return this.page.locator('[data-testid="product-detail-title"]').innerText();
  }

  async getPrice(): Promise<string> {
    return this.page.locator('[data-testid="product-detail-price"]').innerText();
  }

  async addToCart() {
    await this.page.locator('[data-testid="add-to-cart-btn"]').click();
    await this.page.waitForTimeout(150);
  }

  async getReviews(): Promise<ReviewData[]> {
    const items = this.page.locator('[data-testid="review-item"]');
    const count = await items.count();
    const reviews: ReviewData[] = [];
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      reviews.push({
        author: await item.locator('[data-testid="review-author"]').innerText(),
        rating: parseInt(await item.locator('[data-testid="review-rating"]').getAttribute("data-rating") ?? "0", 10),
        content: await item.locator('[data-testid="review-content"]').innerText(),
      });
    }
    return reviews;
  }
}
