import { BasePage } from "./base.page";
import type { ProductCardData } from "./types";

export class ProductListPage extends BasePage {
  async goto() {
    await super.goto("/products");
  }

  async getProductCards(): Promise<ProductCardData[]> {
    await this.page
      .waitForFunction(
        () =>
          Boolean(
            document.querySelector(
              '[data-testid="product-card"], [data-testid="product-card-item"], [data-testid="no-results"]'
            )
          ),
        undefined,
        { timeout: 10_000 }
      )
      .catch(() => undefined);

    const cards = this.page.locator('[data-testid="product-card"], [data-testid="product-card-item"]');
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
    let clicked = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const pageBtn = this.page.locator(`[data-testid="page-${pageNum}"]`).first();
      const visible = await pageBtn.isVisible({ timeout: 2_000 }).catch(() => false);
      if (!visible) return;
      try {
        await pageBtn.click({ timeout: 3_000 });
        clicked = true;
        break;
      } catch {
        await this.page.waitForTimeout(150);
      }
    }

    if (!clicked) return;

    await this.page
      .waitForURL(new RegExp(`[?&]page=${pageNum}(?:&|$)`), { timeout: 5_000 })
      .catch(() => undefined);
    await this.page.waitForLoadState("domcontentloaded");
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
