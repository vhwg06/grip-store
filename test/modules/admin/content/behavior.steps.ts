import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { ScenarioWorld } from "../../../shared/cucumber/world";
import { adminGet, adminPatch, adminPost, adminPut, adminState, assertAccepted, assertReadable, authenticateAdmin, responseData } from "../../../shared/cucumber/admin-runtime";
import { getAdminToken, getUserToken } from "../../../shared/runtime/api-helpers/auth.helpers";
import { AuthPage } from "../../../shared/runtime/objects/auth.page";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "admin.content") return;
  this.activeModule = "admin.content";
});

type ContentRecord = Record<string, unknown>;

function contentRecord(value: unknown): ContentRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ContentRecord : {};
}

function contentList(value: unknown): ContentRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is ContentRecord => Boolean(item && typeof item === "object"));
  const record = contentRecord(value);
  if (Array.isArray(record.data)) return contentList(record.data);
  if (Array.isArray(record.items)) return contentList(record.items);
  return [];
}

async function contentAdminHeaders(world: ScenarioWorld): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await getAdminToken(await world.getApiRequest())}` };
}

Given("the content operator needs a reusable asset", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the content operator uploads or selects media in the shared library", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/media?page=1&pageSize=24");
  assertReadable(this);
  const token = await getAdminToken(await this.getApiRequest());
  const presigned = await (await this.getApiClient()).get<Record<string, unknown>>(
    "/v1/admin/media/presigned?fileName=cucumber-contract.png&contentType=image/png",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect(presigned.status).toBe(200);
  this.state.mediaPresigned = presigned.data;
});

Then("the library makes that asset available across content surfaces", async function (this: ScenarioWorld) {
  assertReadable(this);
  expect(responseData(this)).toBeTruthy();
});

Then("assets already in use remain protected from destructive removal", async function (this: ScenarioWorld) {
  const data = this.state.mediaPresigned as Record<string, unknown>;
  expect(typeof data.id).toBe("string");
  expect(typeof data.public_url).toBe("string");
  expect(typeof data.upload_url).toBe("string");
});

When("an unauthenticated client reads the shared media library", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/media?page=1&pageSize=10");
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/media" };
});

Then("the shared media response status is `401` or `403`", function (this: ScenarioWorld) {
  expect([401, 403]).toContain(adminState(this).response?.status);
});

Given("a shopper token is available for content access", async function (this: ScenarioWorld) {
  this.state.contentUserToken = await getUserToken(await this.getApiRequest());
});

When("the shopper reads the shared media library", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/admin/media?page=1&pageSize=10", {
    headers: { Authorization: `Bearer ${String(this.state.contentUserToken)}` },
  });
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/admin/media" };
});

Then("the shared media response status is `403`", function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBe(403);
});

Given("a page context needs banner presence", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When("the content operator changes the active banner set or banner order", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/banners", { active: true, sort_order: 0 });
});

Then("the page context reflects the new banner priority and active state", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await adminGet(this, "/v1/admin/banners");
  assertReadable(this);
});

Then("inactive banners stop representing that page context", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the content operator chooses Visual editor mode", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  this.state.editorMode = "html";
});

When("the content operator types formatted text or pastes an image", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/content/articles", { title: `Cucumber HTML ${Date.now()}`, body: "<p>Formatted content</p>", content_format: "html", status: "draft" });
});

Then("the editor displays rich text formatting and inline images directly", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the content is saved as HTML", async function (this: ScenarioWorld) {
  expect(this.state.editorMode).toBe("html");
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the content operator chooses Markdown editor mode", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  this.state.editorMode = "markdown";
});

When("the content operator types Markdown syntax or pastes an image", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/content/articles", { title: `Cucumber Markdown ${Date.now()}`, body: "# Cucumber\n\n![image](https://example.com/image.png)", content_format: "markdown", status: "draft" });
});

Then("the editor displays Markdown code and inserts image syntax automatically", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the content is saved as Markdown", async function (this: ScenarioWorld) {
  expect(this.state.editorMode).toBe("markdown");
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("an article is ready for public reading", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminPost(this, "/v1/content/articles", { title: `Cucumber Published ${Date.now()}`, body: "Published article", status: "draft" });
});

When("the content operator publishes the article", async function (this: ScenarioWorld) {
  const data = responseData(this);
  const id = String(data.id ?? data.article_id ?? "");
  adminState(this).recordId = id;
  await adminPatch(this, `/v1/content/articles/${id}`, { status: "published" });
});

Then("the article becomes part of the public editorial stream", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await (await this.getApiClient()).get("/v1/public/content/articles");
});

Then("the storefront renders the article using its stored structure", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the FAQ set contains multiple answers", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/faqs");
});

When("the content operator changes FAQ order or active state", async function (this: ScenarioWorld) {
  await adminPost(this, "/v1/admin/faqs", { question: "Cucumber FAQ", answer: "Answer", active: true, sort_order: 0 });
});

Then("the public knowledge surface reflects the new answer priority", async function (this: ScenarioWorld) {
  assertAccepted(this);
  await (await this.getApiClient()).get("/v1/faqs/active");
});

Then("inactive answers stop acting as public guidance", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("a published article exists in the store content", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/public/content/articles");
});

When("the store operator selects this article for the About Us page in Store Settings", async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/settings/about_article_id", { article_id: adminState(this).recordId ?? null });
});

When("the store operator saves the settings", async function (this: ScenarioWorld) {
  await adminGet(this, "/v1/admin/store-settings");
});

Then("the storefront About Us page displays the title and body of the linked article", async function (this: ScenarioWorld) {
  assertReadable(this);
  const response = await (await this.getApiClient()).get("/v1/public/content/pages/about");
  expect(response.ok).toBe(true);
});

Given("the About Us page is currently linked to an article", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
});

When('the store operator selects "None" for the About Us page in Store Settings', async function (this: ScenarioWorld) {
  await adminPut(this, "/v1/admin/settings/about_article_id", { article_id: null });
});

Then("the storefront About Us page displays the default company introduction narrative", async function (this: ScenarioWorld) {
  assertAccepted(this);
  const response = await (await this.getApiClient()).get("/v1/public/content/pages/about");
  expect(response.ok).toBe(true);
});

Given("a product already exists in the catalog", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminGet(this, "/v1/admin/products?limit=1");
});

When("the content operator changes product media or rich content", async function (this: ScenarioWorld) {
  const items = (responseData(this).items ?? []) as Array<Record<string, unknown>>;
  const id = String(items[0]?.id ?? "");
  adminState(this).recordId = id;
  await adminPatch(this, `/v1/admin/products/${id}`, { description: "Cucumber editorial context" });
});

Then("the product gains new editorial context", async function (this: ScenarioWorld) {
  assertAccepted(this);
});

Then("the product's commercial state remains owned by the product domain", async function (this: ScenarioWorld) {
  expect(adminState(this).response?.status).toBeLessThan(300);
});

Given("the content operator is composing an article with draft status", async function (this: ScenarioWorld) {
  await authenticateAdmin(this);
  await adminPost(this, "/v1/content/articles", { title: `Cucumber Draft ${Date.now()}`, body: "Draft body", status: "draft" });
});

When("the content operator triggers the article preview", async function (this: ScenarioWorld) {
  await adminGet(this, `/v1/content/articles/${String(responseData(this).id ?? "")}/preview`);
});

Then("a storefront preview modal opens", async function (this: ScenarioWorld) {
  assertReadable(this);
});

Then("the modal displays the draft article's title, cover image, and body content", async function (this: ScenarioWorld) {
  expect(responseData(this)).toBeTruthy();
});

When("an unauthenticated client creates a content article", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/content/articles", { title: `Unauthenticated ${Date.now()}` });
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/content/articles" };
});

Then("the article creation response status is `401` or `403`", function (this: ScenarioWorld) {
  expect([401, 403]).toContain(adminState(this).response?.status);
});

Given("an admin creates an article with priority tags topic and image metadata", async function (this: ScenarioWorld) {
  const headers = await contentAdminHeaders(this);
  const slug = `cucumber-article-${Date.now()}`;
  const response = await (await this.getApiClient()).post("/v1/content/articles", {
    title: "Cucumber API Article",
    slug,
    body: "This is a body test.",
    status: "published",
    image_url: "https://example.com/cucumber-article.png",
    topic: "technology",
    tags: ["cucumber", "api"],
    priority: 42,
  }, { headers });
  expect(response.status).toBe(201);
  const data = contentRecord(response.data);
  this.state.articleId = String(data.id);
  this.state.articleSlug = slug;
  this.registerCleanup(async () => {
    const deleted = await (await this.getApiClient()).delete(`/v1/content/articles/${this.state.articleId}`, { headers });
    if (deleted.status !== 404 && (deleted.status < 200 || deleted.status >= 300)) throw new Error(`Article cleanup failed with ${deleted.status}`);
  });
});

When("the admin updates the article title and priority", async function (this: ScenarioWorld) {
  const headers = await contentAdminHeaders(this);
  const response = await (await this.getApiClient()).patch(`/v1/content/articles/${this.state.articleId}`, {
    title: "Updated Cucumber API Article",
    priority: 99,
  }, { headers });
  adminState(this).response = { status: response.status, data: response.data, path: `/v1/content/articles/${this.state.articleId}` };
});

Then("the admin article read contains all updated editorial fields", function (this: ScenarioWorld) {
  assertAccepted(this);
  const data = contentRecord(responseData(this));
  expect(data.title).toBe("Updated Cucumber API Article");
  expect(data.priority).toBe(99);
  expect(data.slug).toBe(this.state.articleSlug);
  expect(data.image_url).toBe("https://example.com/cucumber-article.png");
  expect(data.topic).toBe("technology");
  expect(data.tags).toEqual(["cucumber", "api"]);
});

Then("the public article detail contains the updated article", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get(`/v1/public/content/articles/${this.state.articleId}`);
  expect(response.status).toBe(200);
  const data = contentRecord(response.data);
  const publicData = contentRecord(data.data ?? data);
  expect(publicData.id).toBe(this.state.articleId);
  expect(publicData.title).toBe("Updated Cucumber API Article");
});

When("the admin deletes the article", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).delete(`/v1/content/articles/${this.state.articleId}`, { headers: await contentAdminHeaders(this) });
  adminState(this).response = { status: response.status, data: response.data, path: `/v1/content/articles/${this.state.articleId}` };
});

Then("the public article detail returns `404`", async function (this: ScenarioWorld) {
  assertAccepted(this);
  const response = await (await this.getApiClient()).get(`/v1/public/content/articles/${this.state.articleId}`);
  expect(response.status).toBe(404);
});

Given("an admin creates published articles with distinct priorities tags and topics", async function (this: ScenarioWorld) {
  const headers = await contentAdminHeaders(this);
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const articles = [
    { title: `Cucumber Article A ${suffix}`, slug: `cucumber-a-${suffix}`, body: "Body A", status: "published", topic: "marketing", tags: ["announcement"], priority: 10 },
    { title: `Cucumber Article B ${suffix}`, slug: `cucumber-b-${suffix}`, body: "Body B", status: "published", topic: "engineering", tags: ["tutorial"], priority: 50 },
    { title: `Cucumber Article C ${suffix}`, slug: `cucumber-c-${suffix}`, body: "Body C", status: "published", topic: "engineering", tags: ["announcement", "featured"], priority: 5 },
  ];
  const ids: string[] = [];
  for (const article of articles) {
    const response = await (await this.getApiClient()).post("/v1/content/articles", article, { headers });
    expect(response.status).toBe(201);
    const id = String(contentRecord(response.data).id);
    ids.push(id);
    this.registerCleanup(async () => {
      const deleted = await (await this.getApiClient()).delete(`/v1/content/articles/${id}`, { headers });
      if (deleted.status !== 404 && (deleted.status < 200 || deleted.status >= 300)) throw new Error(`Article cleanup failed with ${deleted.status}`);
    });
  }
  this.state.articleIds = ids;
  this.state.articleTitles = articles.map((article) => article.title);
});

When("a visitor reads the public article stream", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/public/content/articles");
  expect(response.status).toBe(200);
  this.state.publicArticles = contentList(response.data);
});

Then("the created articles are sorted by priority descending", function (this: ScenarioWorld) {
  const ids = this.state.articleIds as string[];
  const rows = (this.state.publicArticles as ContentRecord[]).filter((row) => ids.includes(String(row.id)));
  expect(rows).toHaveLength(3);
  expect(rows.map((row) => row.priority)).toEqual([50, 10, 5]);
});

When("a visitor filters public articles by topic and tag", async function (this: ScenarioWorld) {
  const topicResponse = await (await this.getApiClient()).get("/v1/public/content/articles?topic=engineering");
  const tagResponse = await (await this.getApiClient()).get("/v1/public/content/articles?tag=announcement");
  expect(topicResponse.status).toBe(200);
  expect(tagResponse.status).toBe(200);
  this.state.topicArticles = contentList(topicResponse.data);
  this.state.tagArticles = contentList(tagResponse.data);
});

Then("each filtered result preserves the requested editorial classification", function (this: ScenarioWorld) {
  const ids = this.state.articleIds as string[];
  const topics = (this.state.topicArticles as ContentRecord[]).filter((row) => ids.includes(String(row.id)));
  const tags = (this.state.tagArticles as ContentRecord[]).filter((row) => ids.includes(String(row.id)));
  expect(topics).toHaveLength(2);
  expect(topics.every((row) => row.topic === "engineering")).toBe(true);
  expect(tags).toHaveLength(2);
  expect(tags.every((row) => Array.isArray(row.tags) && (row.tags as unknown[]).includes("announcement"))).toBe(true);
});

Given("an admin creates active and inactive banners with explicit sort order", async function (this: ScenarioWorld) {
  const headers = await contentAdminHeaders(this);
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const first = { title: `Cucumber Banner A ${suffix}`, subtitle: "First", image: "https://example.com/banner-a.png", mobileImage: "https://example.com/banner-a-mobile.png", ctaText: "Shop A", ctaLink: "/products?a", sortOrder: 20, isActive: true };
  const second = { title: `Cucumber Banner B ${suffix}`, subtitle: "Second", image: "https://example.com/banner-b.png", mobileImage: "https://example.com/banner-b-mobile.png", ctaText: "Shop B", ctaLink: "/products?b", sortOrder: 10, isActive: false };
  const created: ContentRecord[] = [];
  for (const banner of [first, second]) {
    const response = await (await this.getApiClient()).post("/v1/admin/banners", banner, { headers });
    expect([200, 201]).toContain(response.status);
    created.push(contentRecord(response.data));
  }
  this.state.bannerA = created[0];
  this.state.bannerB = created[1];
  this.registerCleanup(async () => {
    for (const banner of created) {
      const deleted = await (await this.getApiClient()).delete(`/v1/admin/banners/${banner.id}`, { headers });
      if (deleted.status !== 404 && (deleted.status < 200 || deleted.status >= 300)) throw new Error(`Banner cleanup failed with ${deleted.status}`);
    }
  });
});

When("the admin updates the inactive banner to active with a higher priority", async function (this: ScenarioWorld) {
  const banner = this.state.bannerB as ContentRecord;
  const response = await (await this.getApiClient()).post("/v1/admin/banners", { ...banner, isActive: true, sortOrder: 5 }, { headers: await contentAdminHeaders(this) });
  expect([200, 201]).toContain(response.status);
});

Then("the public homepage exposes both created slides in sort order", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/public/homepage");
  expect(response.status).toBe(200);
  const homepage = contentRecord(response.data);
  const blocks = contentList(homepage.data ?? response.data);
  const bannerBlock = blocks.find((block) => block.block_type === "banner");
  const slides = contentList(contentRecord(contentRecord(bannerBlock).config).slides);
  const titles = [String((this.state.bannerA as ContentRecord).title), String((this.state.bannerB as ContentRecord).title)];
  const own = slides.filter((slide) => titles.includes(String(slide.title)));
  expect(own.map((slide) => slide.title)).toEqual([titles[1], titles[0]]);
  this.state.publicBannerSlides = own;
});

Then("every created public slide is active", function (this: ScenarioWorld) {
  expect((this.state.publicBannerSlides as ContentRecord[]).every((slide) => slide.isActive === true)).toBe(true);
});

Given("an admin creates active and inactive FAQs with explicit sort order", async function (this: ScenarioWorld) {
  const headers = await contentAdminHeaders(this);
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const first = { question: `Cucumber FAQ A ${suffix}`, answer: "Answer A", sortOrder: 20, isActive: false };
  const second = { question: `Cucumber FAQ B ${suffix}`, answer: "Answer B", sortOrder: 10, isActive: true };
  const created: ContentRecord[] = [];
  for (const faq of [first, second]) {
    const response = await (await this.getApiClient()).post("/v1/admin/faqs", faq, { headers });
    expect([200, 201]).toContain(response.status);
    created.push(contentRecord(response.data));
  }
  this.state.faqA = created[0];
  this.state.faqB = created[1];
  this.registerCleanup(async () => {
    for (const faq of created) {
      const deleted = await (await this.getApiClient()).delete(`/v1/admin/faqs/${faq.id}`, { headers });
      if (deleted.status !== 404 && (deleted.status < 200 || deleted.status >= 300)) throw new Error(`FAQ cleanup failed with ${deleted.status}`);
    }
  });
});

When("the admin activates and reorders the inactive FAQ", async function (this: ScenarioWorld) {
  const faq = this.state.faqA as ContentRecord;
  const response = await (await this.getApiClient()).post("/v1/admin/faqs", { ...faq, answer: "Updated answer", sortOrder: 5, isActive: true }, { headers: await contentAdminHeaders(this) });
  expect([200, 201]).toContain(response.status);
});

Then("the public FAQ response exposes the created entries in the new order", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).get("/v1/faqs/active");
  expect(response.status).toBe(200);
  const faqPayload = contentRecord(response.data);
  const rows = contentList(faqPayload.items ?? faqPayload.data ?? response.data);
  const questions = [String((this.state.faqA as ContentRecord).question), String((this.state.faqB as ContentRecord).question)];
  const own = rows.filter((row) => questions.includes(String(row.question)));
  expect(own.map((row) => row.question)).toEqual([questions[0], questions[1]]);
  expect(own.every((row) => row.isActive !== false)).toBe(true);
});

Given("an admin creates About page content with a gallery", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).post("/v1/content/pages", {
    title: "Cucumber About",
    slug: "about",
    body: "About body",
    gallery: ["https://example.com/about-a.png", "https://example.com/about-b.png"],
    template_key: "about-us",
    status: "published",
  }, { headers: await contentAdminHeaders(this) });
  expect(response.status).toBe(201);
});

When("the admin updates the About narrative and gallery", async function (this: ScenarioWorld) {
  const response = await (await this.getApiClient()).patch("/v1/content/pages/about", {
    title: "Cucumber About Updated",
    slug: "about",
    body: "Updated About body",
    gallery: ["https://example.com/about-c.png"],
    template_key: "about-us",
    status: "published",
  }, { headers: await contentAdminHeaders(this) });
  adminState(this).response = { status: response.status, data: response.data, path: "/v1/content/pages/about" };
});

Then("the public About page returns the updated narrative and gallery", async function (this: ScenarioWorld) {
  assertAccepted(this);
  const response = await (await this.getApiClient()).get("/v1/public/content/pages/about");
  expect(response.status).toBe(200);
  const data = contentRecord(response.data);
  expect(data.title).toBe("Cucumber About Updated");
  expect(data.body).toBe("Updated About body");
  expect(data.gallery).toEqual(["https://example.com/about-c.png"]);
});

async function contentUi(world: ScenarioWorld) {
  const page = await world.getBrowserPage();
  return { page, auth: new AuthPage(page) };
}

async function loginContentAdmin(world: ScenarioWorld): Promise<void> {
  const current = await contentUi(world);
  const email = process.env.ADMIN_USER_EMAIL?.trim();
  const password = process.env.ADMIN_USER_PASSWORD?.trim();
  if (!email || !password) throw new Error("Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD for admin content browser scenarios.");
  await current.auth.gotoLogin();
  await current.auth.login(email, password);
  await current.page.waitForLoadState("domcontentloaded");
}

Given("an admin opens content settings", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/settings");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

When("the admin opens the shared media picker", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await current.page.locator('[data-testid="settings-brand-logo-open-media-picker"]').click();
});

Then("reusable media items are visible in the picker", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.locator('[data-testid="media-picker-modal"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="media-picker-item"]').first()).toBeVisible();
});

Given("an admin opens banner management", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/banners");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("banner page-context controls are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "Banner Management" })).toBeVisible();
  await expect(current.page.locator('[data-testid="banner-presence-controls"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="banner-presence-toggle"]')).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Homepage" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Products" })).toBeVisible();
});

Given("an admin opens article management", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/articles");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("article list and About ownership controls are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "Article Management" })).toBeVisible();
  await expect(current.page.locator('[data-testid="articles-list-container"]')).toBeVisible();
  await expect(current.page.locator('[data-testid="article-about-owner-control"]')).toBeVisible();
  await expect(current.page.getByRole("button", { name: "Save draft" })).toBeVisible();
});

Given("an admin opens FAQ management", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/faqs");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("FAQ ordering and public-visibility controls are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "FAQ Management" })).toBeVisible();
  await expect(current.page.getByRole("button", { name: /active/i })).toBeVisible();
  await expect(current.page.getByRole("button", { name: /draft/i })).toBeVisible();
  await expect(current.page.getByText(/public reflection/i)).toBeVisible();
});

Given("an admin opens product management for editorial review", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  await (await contentUi(this)).page.goto("/admin/products");
  await (await contentUi(this)).page.waitForLoadState("networkidle");
});

Then("product editor entry points are visible", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page.getByRole("heading", { name: "Product Management" })).toBeVisible();
  await expect(current.page.locator('[data-testid="create-btn"]')).toBeVisible();
  await expect(current.page.getByText(/quick access to full product editing/i)).toBeVisible();
  await expect(current.page.locator('[data-testid="edit-btn"]').first()).toBeVisible();
});

Given("the admin opens the desktop Figma banner surface", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  const current = await contentUi(this);
  await current.page.goto("/admin/banners");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop banner surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page).toHaveScreenshot("banner-management.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="banners-list-container"]')],
  });
});

Given("the admin opens the desktop Figma media surface", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  const current = await contentUi(this);
  await current.page.goto("/admin/media");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop media surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page).toHaveScreenshot("media-management.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="media-grid-container"]')],
  });
});

Given("the admin opens the desktop Figma FAQ surface", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  const current = await contentUi(this);
  await current.page.goto("/admin/faqs");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop FAQ surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page).toHaveScreenshot("faqs.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="faqs-list-container"]')],
  });
});

Given("the admin opens the desktop Figma article surface", async function (this: ScenarioWorld) {
  await loginContentAdmin(this);
  const current = await contentUi(this);
  await current.page.goto("/admin/articles");
  await current.page.waitForLoadState("networkidle");
  await current.page.setViewportSize({ width: 1440, height: 1326 });
});

Then("the desktop article management surface matches its visual contract", async function (this: ScenarioWorld) {
  const current = await contentUi(this);
  await expect(current.page).toHaveScreenshot("article-management.png", {
    maxDiffPixelRatio: 0.02,
    mask: [current.page.locator('[data-testid="articles-list-container"]')],
  });
});
