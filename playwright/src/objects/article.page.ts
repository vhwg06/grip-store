import { BasePage } from "./base.page";
import type { ArticleSummaryData } from "./types";

export class ArticlePage extends BasePage {
  async goto() {
    await super.goto("/articles");
  }

  async getArticles(): Promise<ArticleSummaryData[]> {
    const cards = this.page.locator('[data-testid="article-card"]');
    const count = await cards.count();
    const articles: ArticleSummaryData[] = [];
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      articles.push({
        slug: (await card.getAttribute("data-slug")) ?? "",
        title: await card.locator('[data-testid="article-title"]').innerText(),
        excerpt: await card.locator('[data-testid="article-excerpt"]').innerText(),
      });
    }
    return articles;
  }

  async viewArticle(slug: string) {
    await this.page.locator(`[data-slug="${slug}"]`).click();
    await this.waitForNetworkIdle();
  }

  async getArticleTitle(): Promise<string> {
    return this.page.locator('[data-testid="article-detail-title"]').innerText();
  }

  async getArticleContent(): Promise<string> {
    return this.page.locator('[data-testid="article-detail-content"]').innerText();
  }
}
