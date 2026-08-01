import { BasePage } from "./base.page";

export class HomepagePage extends BasePage {
  async goto() {
    await super.goto("/");
  }

  async getHeroTitle(): Promise<string> {
    return this.page.locator('[data-testid="hero-title"]').innerText();
  }

  async getFeaturedProducts(): Promise<string[]> {
    const cards = this.page.locator('[data-testid="featured-product-card"]');
    const count = await cards.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      titles.push(await cards.nth(i).locator('[data-testid="product-title"]').innerText());
    }
    return titles;
  }

  async getAnnouncement(): Promise<string | null> {
    const el = this.page.locator('[data-testid="announcement-banner"]');
    if (await el.isVisible()) {
      return el.innerText();
    }
    return null;
  }
}
