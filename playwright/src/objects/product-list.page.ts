import { BasePage } from "./base.page";
import type { ProductCardData } from "./types";

export class ProductListPage extends BasePage {
  async goto() {
    await super.goto("/products");
  }

  async getProductCards(): Promise<ProductCardData[]> {
    const cards = this.page.locator('[data-testid="product-card"]');
    const count = await cards.count();
    const products: ProductCardData[] = [];
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      products.push({
        id: (await card.getAttribute("data-product-id")) ?? "",
        title: await card.locator('[data-testid="product-title"]').innerText(),
        price: await card.locator('[data-testid="product-price"]').innerText(),
      });
    }
    return products;
  }

  async filterByCategory(category: string) {
    await this.page.locator(`[data-testid="category-filter-${category}"]`).click();
    await this.waitForNetworkIdle();
  }

  async sortBy(option: string) {
    const sort = this.page.locator('[data-testid="sort-select"]');
    const tagName = await sort.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "select") {
      await sort.selectOption(option);
    } else {
      await sort.click();
    }
    await this.waitForNetworkIdle();
  }

  async goToPage(pageNum: number) {
    await this.page.locator(`[data-testid="page-${pageNum}"]`).click();
    await this.waitForNetworkIdle();
  }

  async search(query: string) {
    await this.page.locator('[data-testid="search-input"]').fill(query);
    await this.page.locator('[data-testid="search-submit"]').click();
    await this.waitForNetworkIdle();
  }

  async getResultCount(): Promise<number> {
    const text = await this.page.locator('[data-testid="result-count"]').innerText();
    return parseInt(text, 10);
  }
}
