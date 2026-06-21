import { test, expect } from "../../src/fixtures/base-test";
import { BACKEND_URL, getAdminToken } from "../../src/api-helpers/auth.helpers";

async function adminFetch(request: any, path: string, options?: { method?: string; data?: any }) {
  const token = await getAdminToken(request);
  const method = options?.method ?? "GET";
  return request.fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: options?.data,
  });
}

function extractData(payload: any) {
  return payload?.data ?? payload;
}

test.describe("About Page @content", () => {
  test("should render about page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    // About page should have title or content
    const title = page.locator(
      '[data-testid="about-title"], h1'
    );
    await expect(title).toBeVisible();
  });

  test("should load and display dynamic About narrative and gallery correctly", async ({ page, request }) => {
    // 1. Fetch original About page state to restore later
    let originalAbout: any = null;
    try {
      const resp = await request.get(`${BACKEND_URL}/v1/public/content/pages/about`);
      if (resp.ok()) {
        originalAbout = extractData(await resp.json());
      }
    } catch (err) {
      // Ignore
    }

    const ts = Date.now();
    const testTitle = `About Playwright ${ts}`;
    const testBody = `Dynamic narrative content for Playwright testing ${ts}.`;
    const testGallery = ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"];

    try {
      // 2. Set dynamic narrative with a gallery
      const saveResp = await adminFetch(request, "/v1/content/pages/about", {
        method: "PATCH",
        data: {
          title: testTitle,
          slug: "about",
          body: testBody,
          gallery: testGallery,
          template_key: "about-us",
          status: "published",
        },
      });
      expect(saveResp.ok()).toBe(true);

      // 3. Visit public About page and verify reflection
      await page.goto("/about");
      await page.waitForLoadState("networkidle");

      // Verify title, body (narrative), and gallery are displayed
      const title = page.locator('[data-testid="about-title"], h1');
      await expect(title).toContainText(testTitle);

      const content = page.locator('[data-testid="about-content"]');
      await expect(content).toBeVisible();
      await expect(content).toContainText(testBody);

      const gallery = page.locator('[data-testid="about-gallery"]');
      await expect(gallery).toBeVisible();

      const images = page.locator('[data-testid="about-gallery-image"]');
      await expect(images).toHaveCount(1);
      await expect(images.first()).toHaveAttribute("src", testGallery[0]);

      // 4. Set dynamic narrative with empty gallery
      const saveEmptyGalleryResp = await adminFetch(request, "/v1/content/pages/about", {
        method: "PATCH",
        data: {
          title: testTitle,
          slug: "about",
          body: testBody,
          gallery: [],
          template_key: "about-us",
          status: "published",
        },
      });
      expect(saveEmptyGalleryResp.ok()).toBe(true);

      // 5. Visit /about and verify gallery is hidden as per SC-CONT-06
      await page.goto("/about");
      await page.waitForLoadState("networkidle");

      const emptyGallery = page.locator('[data-testid="about-gallery"]');
      await expect(emptyGallery).toBeHidden();

    } finally {
      // 6. Restore original state
      if (originalAbout) {
        await adminFetch(request, "/v1/content/pages/about", {
          method: "PATCH",
          data: {
            title: originalAbout.title,
            slug: "about",
            body: originalAbout.body,
            gallery: originalAbout.gallery || [],
            template_key: originalAbout.template_key || "about-us",
            status: originalAbout.status || "published",
          },
        });
      }
    }
  });
});

