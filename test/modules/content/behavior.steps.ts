import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../shared/cucumber/world";
import { ArticlePage } from "../../shared/runtime/objects/article.page";

type ContentState = { slug?: string };

function state(world: ScenarioWorld): ContentState {
  return world.state as ContentState;
}

async function page(world: ScenarioWorld) {
  const browserPage = await world.getBrowserPage();
  return { page: browserPage, articles: new ArticlePage(browserPage) };
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "content") return;
  this.activeModule = "content";
});

Given("a visitor opens the About page", async function (this: ScenarioWorld) {
  await (await page(this)).page.goto("/about");
  await (await page(this)).page.waitForLoadState("domcontentloaded");
});

When("the page loads", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator("body")).toBeVisible();
});

Then("the About content is visible", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="about-content"], [data-testid="about-title"], h1').first()).toBeVisible();
});

Given("the store has an About narrative and gallery", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/public/content/pages/about");
  expect(response.ok, "public About content must be reachable").toBe(true);
  expect(response.data).toBeTruthy();
});

Then("the dynamic narrative and gallery are displayed", async function (this: ScenarioWorld) {
  const current = await page(this);
  await expect(current.page.locator('[data-testid="about-content"], [data-testid="about-title"], h1').first()).toBeVisible();
  await expect(current.page.locator('[data-testid="about-gallery"], [data-testid="about-gallery-image"]').first()).toBeVisible();
});

Given("published articles exist", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.articles.goto();
  await expect(current.page.locator('[data-testid="article-card"], [data-testid="articles-empty"]').first()).toBeVisible();
});

When("a visitor opens the article list", async function (this: ScenarioWorld) {
  await (await page(this)).articles.goto();
});

Then("article cards are visible", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="article-card"]').first()).toBeVisible();
});

Given("a visitor sees an article", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.articles.goto();
  const card = current.page.locator('[data-testid="article-card"]').first();
  await expect(card).toBeVisible();
  state(this).slug = (await card.getAttribute("data-slug")) ?? undefined;
});

When("the visitor opens it", async function (this: ScenarioWorld) {
  const current = await page(this);
  if (state(this).slug) {
    await current.page.locator(`[data-slug="${state(this).slug}"]`).click();
  } else {
    await current.page.locator('[data-testid="article-card"]').first().click();
  }
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the article detail is displayed", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="article-detail-title"]').first()).toBeVisible();
});

Given("an article detail exists", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.articles.goto();
  await expect(current.page.locator('[data-testid="article-card"]').first()).toBeVisible();
});

When("a visitor opens the detail", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.page.locator('[data-testid="article-card"]').first().click();
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the article content is displayed", async function (this: ScenarioWorld) {
  const current = await page(this);
  await expect(current.page.locator('[data-testid="article-detail-content"]').first()).toBeVisible();
  expect(await current.articles.getArticleContent()).not.toHaveLength(0);
});

Given("the article list has multiple pages", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<{ total?: number }>("/v1/public/content/articles");
  expect(response.ok).toBe(true);
  expect(Number(response.data.total ?? 0)).toBeGreaterThan(1);
  await (await page(this)).articles.goto();
});

When("a visitor changes the page", async function (this: ScenarioWorld) {
  const current = await page(this);
  const next = current.page.locator('[data-testid="page-2"], [data-testid="articles-page-2"]').first();
  await expect(next).toBeVisible();
  await next.click();
});

Then("the corresponding article page is displayed", async function (this: ScenarioWorld) {
  await expect((await page(this)).page).toHaveURL(/[?&]page=2/);
});

Given("a visitor opens the Contact page", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.page.goto("/contact");
  await current.page.waitForLoadState("domcontentloaded");
});

Then("the contact form is visible", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="contact-form"], form').first()).toBeVisible();
});

Given("the store has a contact map configuration", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/public/content/pages/contact");
  expect(response.ok).toBe(true);
});

Then("the map embed is visible", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="contact-map"], iframe[src*="map"]').first()).toBeVisible();
});

Given("the store has contact information", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get<Record<string, unknown>>("/v1/site-config");
  expect(response.ok).toBe(true);
});

Then("the company contact information is visible", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="contact-company-info"], [data-testid="contact-address"]').first()).toBeVisible();
});

Given("a visitor has entered valid contact details", async function (this: ScenarioWorld) {
  const current = await page(this);
  await current.page.goto("/contact");
  await current.page.locator('[data-testid="contact-name"]').fill("Cucumber Visitor");
  await current.page.locator('[data-testid="contact-email"]').fill("cucumber-contact@example.com");
  await current.page.locator('[data-testid="contact-message"]').fill("Please contact me about a product.");
});

When("the visitor submits the contact form", async function (this: ScenarioWorld) {
  await (await page(this)).page.locator('[data-testid="contact-submit-btn"]').click();
});

Then("the contact request is accepted", async function (this: ScenarioWorld) {
  await expect((await page(this)).page.locator('[data-testid="contact-success"], [data-testid="toast"]').first()).toBeVisible();
});
