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
    const cartCount = this.page.locator('[data-testid="cart-count"]').first();
    const hadCount = (await cartCount.count()) > 0;
    const before = hadCount
      ? Number((await cartCount.innerText()).trim() || "0")
      : 0;

    await this.page.locator('[data-testid="add-to-cart-btn"]').click();

    await this.page.waitForFunction(
      ({ selector, previous }) => {
        const el = document.querySelector(selector);
        if (!el) return previous === 0;
        const value = Number((el.textContent || "").trim() || "0");
        return Number.isFinite(value) && value >= previous + 1;
      },
      { selector: '[data-testid="cart-count"]', previous: before },
      { timeout: 5_000 }
    );
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
