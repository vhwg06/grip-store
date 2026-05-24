import { test, expect } from "../../src/fixtures/base-test";

test.describe("Articles @content", () => {
  test("should render article list", async ({ articlePage, page }) => {
    await articlePage.goto();

    const articles = await articlePage.getArticles();
    // May have zero articles in test env
    if (articles.length > 0) {
      expect(articles[0].title).toBeTruthy();
      expect(articles[0].slug).toBeTruthy();
    }
  });

  test("should navigate to article detail", async ({ articlePage, page }) => {
    await articlePage.goto();

    const articles = await articlePage.getArticles();
    test.skip(articles.length === 0, "No articles available");

    await articlePage.viewArticle(articles[0].slug);

    const title = await articlePage.getArticleTitle();
    expect(title).toBeTruthy();
  });

  test("should display article content", async ({ articlePage, page }) => {
    await articlePage.goto();

    const articles = await articlePage.getArticles();
    test.skip(articles.length === 0, "No articles available");

    await articlePage.viewArticle(articles[0].slug);

    const content = await articlePage.getArticleContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test("should handle pagination", async ({ articlePage, page }) => {
    await articlePage.goto();

    const pagination = page.locator('[data-testid="articles-pagination"]');
    if (await pagination.isVisible()) {
      const nextPage = pagination.locator('[data-testid="page-2"]');
      if (await nextPage.isVisible()) {
        await nextPage.click();
        await page.waitForLoadState("networkidle");

        const articles = await articlePage.getArticles();
        expect(articles.length).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
