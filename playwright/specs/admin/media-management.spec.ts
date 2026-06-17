import { test, expect } from "../../src/fixtures/base-test";

/**
 * Minimal 1×1 transparent PNG – used to avoid hitting real R2 in tests.
 * The backend /simulate-upload route accepts any PUT and stores it locally.
 */
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for and assert that every <img> inside `container` has a non-empty src. */
async function assertImagesHaveSrc(page: any, containerSelector: string) {
  const imgs = page.locator(`${containerSelector} img`);
  const count = await imgs.count();
  expect(count, `Expected at least one <img> inside ${containerSelector}`).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute("src");
    expect(src, `img[${i}] inside ${containerSelector} must have a non-empty src`).toBeTruthy();
    // Must NOT be a placeholder/broken empty src
    expect(src!.length, "src must not be an empty string").toBeGreaterThan(0);
  }
}

/** Returns the src of the first <img> inside a container, or null if none. */
async function getFirstImgSrc(page: any, containerSelector: string): Promise<string | null> {
  const img = page.locator(`${containerSelector} img`).first();
  if (await img.count() === 0) return null;
  return img.getAttribute("src");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Admin Media Management @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  // ── 1. Sidebar nav ────────────────────────────────────────────────────────

  test("should show banner management link in admin sidebar nav", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="admin-nav-banners"]')).toBeVisible();
    await page.locator('[data-testid="admin-nav-banners"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/admin\/banners/);
  });

  // ── 2. Admin /media – existing images render on page load ─────────────────
  //
  // WHY THIS TEST PREVIOUSLY PASSED BUT PRODUCTION FAILED:
  // The old test only checked that the library container and dropzone were
  // visible (UI skeleton), and then uploaded a *new* file, verifying the
  // blob:// preview that is set from `URL.createObjectURL`. It never asserted
  // that *already-uploaded* images returned by GET /api/admin/media were
  // actually rendered.
  //
  // In production the frontend called `getAdminMedia` which parsed the backend
  // response `{ data: [...], meta: {...} }` but tried to read `value?.total`
  // where `value = payload.data` (an array), so `total` was undefined and the
  // code fell back to `items.length`. More importantly, the items *were* still
  // extracted correctly (Array.isArray branch) so the grid was rendered—but
  // image network requests failed when R2 public-URL wasn't reachable from
  // the test environment. The fix (reading meta.total) ensures pagination is
  // correct; img rendering works as long as URLs are reachable.
  //
  // The new test:
  //  a) intercepts GET /v1/admin/media and injects a seeded asset so we own
  //     the URL and don't depend on real R2 connectivity.
  //  b) asserts the grid card and <img> with a real src appear after load.

  test("admin /media – shows already-uploaded images on page load", async ({ page }) => {
    // Intercept the backend media list API and return a predictable asset.
    const publicImageUrl = "https://pub-test.r2.dev/test-seed-image.png";

    await page.route("**/v1/admin/media**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "seed-id-001",
              file_name: "test-seed-image.png",
              mime_type: "image/png",
              size_bytes: 1024,
              url: publicImageUrl,
              created_at: new Date().toISOString(),
            },
          ],
          meta: { limit: 24, offset: 0, total: 1 },
        }),
      });
    });

    // Also stub the image request so it doesn't fail due to network.
    await page.route(publicImageUrl, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: tinyPng,
      });
    });

    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    // Library container must be visible
    await expect(page.locator('[data-testid="admin-media-library"]')).toBeVisible();

    // At least one media card must appear
    const card = page.locator('[data-testid="media-asset-card"]').first();
    await expect(card).toBeVisible({ timeout: 10_000 });

    // The img inside the card must have a real, non-empty src
    const imgSrc = await getFirstImgSrc(page, '[data-testid="media-asset-card"]');
    expect(imgSrc, "Media card img must have a non-empty src on page load").toBeTruthy();
    expect(imgSrc).toContain("test-seed-image.png");
  });

  // ── 3. Admin /media – upload creates a preview ───────────────────────────

  test("admin /media – upload shows local blob preview immediately", async ({ page }) => {
    // Stub presign so upload doesn't hit real R2
    await page.route("**/v1/admin/media/presigned**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          upload_url: "http://localhost:8080/v1/media/simulate-upload/admin-media-library.png",
          public_url: "https://pub-test.r2.dev/admin-media-library.png",
          id: "presign-001",
        }),
      });
    });

    // Stub the actual PUT to R2 (simulate-upload)
    await page.route("**/simulate-upload/**", async (route) => {
      await route.fulfill({ status: 200 });
    });

    // Stub metadata registration
    await page.route("**/v1/media", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      } else {
        await route.continue();
      }
    });

    // Stub list to return empty initially (new page state)
    await page.route("**/v1/admin/media**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], meta: { limit: 24, offset: 0, total: 0 } }),
      });
    });

    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    await page.locator('input[data-testid="media-file-input"]').first().setInputFiles({
      name: "admin-media-library.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });

    // After upload the local blob preview must appear
    await expect(page.locator('[data-testid="media-preview-image"]').first()).toBeVisible({ timeout: 10_000 });
  });

  // ── 4. Admin /banners – existing banner images render on page load ────────
  //
  // WHY THIS TEST PREVIOUSLY PASSED BUT PRODUCTION FAILED (same root cause):
  // The old test clicked the upload dropzone and verified the blob:// preview.
  // It never checked that *existing* banners from the GET /api/admin/banners
  // response rendered their <img> inside the MediaUploader component.
  //
  // The MediaUploader reads `value` prop (the image URL stored in the banner)
  // and shows it via `previewItems`. When `value` is a valid HTTPS URL the
  // component renders `<img src={url} ...>`. In production the URL is correct
  // but the R2 image might not be reachable. The *component* renders the img
  // correctly—the visible failure is a broken-image icon in the browser, not
  // a missing element, which is why a naive `toBeVisible()` test still passes.
  //
  // The new test: intercepts the banners API, injects a seeded banner, stubs
  // the image network request, and verifies the img src is the R2 public URL.

  test("admin /banners – renders image preview for existing banners", async ({ page }) => {
    const bannerImageUrl = "https://pub-test.r2.dev/existing-banner.png";

    await page.route("**/v1/admin/banners**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            banners: [
              {
                id: 42,
                title: "Seeded Banner",
                subtitle: "Test subtitle",
                image: bannerImageUrl,
                mobile_image: null,
                cta_text: "Xem ngay",
                cta_link: "/products",
                sort_order: 0,
                is_active: true,
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(bannerImageUrl, async (route) => {
      await route.fulfill({ status: 200, contentType: "image/png", body: tinyPng });
    });

    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('h1').filter({ hasText: /banner/i }).first()).toBeVisible();

    // The table row for our seeded banner must have an <img> with the R2 URL
    const tableImgs = page.locator(`tr img[src="${bannerImageUrl}"], tr img[src*="existing-banner"]`);
    await expect(tableImgs.first()).toBeVisible({ timeout: 10_000 });

    const src = await tableImgs.first().getAttribute("src");
    expect(src, "Banner table row must render the R2 image URL as src").toBe(bannerImageUrl);
  });

  // ── 5. Admin /banners – upload + add banner form ──────────────────────────

  test("admin /banners – upload shows preview in the Add form", async ({ page }) => {
    await page.route("**/v1/admin/media/presigned**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          upload_url: "http://localhost:8080/v1/media/simulate-upload/homepage-banner.png",
          public_url: "https://pub-test.r2.dev/homepage-banner.png",
          id: "presign-002",
        }),
      });
    });
    await page.route("**/simulate-upload/**", (r) => r.fulfill({ status: 200 }));
    await page.route("**/v1/media", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      } else await route.continue();
    });
    await page.route("**/v1/admin/banners**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ banners: [] }),
        });
      } else await route.continue();
    });

    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="banner-desktop-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="banner-mobile-media"]')).toBeVisible();

    await page
      .locator('[data-testid="banner-desktop-media"] input[data-testid="media-file-input"]')
      .setInputFiles({ name: "homepage-banner.png", mimeType: "image/png", buffer: tinyPng });

    await expect(
      page.locator('[data-testid="banner-desktop-media"] [data-testid="media-preview-image"]').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── 6. Article featured image upload ─────────────────────────────────────

  test("should use media picker for article featured image", async ({ page }) => {
    await page.goto("/admin/article/new");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="article-featured-media"]')).toBeVisible();
    await page
      .locator('[data-testid="article-featured-media"] input[data-testid="media-file-input"]')
      .setInputFiles({ name: "article-featured.png", mimeType: "image/png", buffer: tinyPng });

    await expect(
      page.locator('[data-testid="article-featured-media"] [data-testid="media-preview-image"]').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── 7. Product media controls ─────────────────────────────────────────────

  test("should keep product media controls available for detail images", async ({ page }) => {
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="product-main-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-gallery-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="field-description"]')).toBeVisible();
  });

  // ── 8. Full flow: add banner → homepage shows correct image ──────────────
  //
  // This is the CRITICAL integration scenario.
  //
  // WHAT WAS WRONG IN PRODUCTION:
  //  1. GET /api/admin/media returned `{ data: [...], meta: {...} }` but the
  //     frontend code read `value.total` from the *array* (value = payload.data),
  //     always getting undefined → falling back to items.length. This didn't
  //     prevent images from showing, but pagination was broken.
  //
  //  2. Homepage banner: the `getActiveBanners()` API reads the public homepage
  //     endpoint (`/api/public/homepage`) which returns blocks config. The banner
  //     image URL is stored in `config.slides[n].image`. The HeroBanner
  //     component renders `<img src={slide.imageUrl}>`. If `slide.imageUrl` is
  //     an R2 URL that isn't publicly accessible the img tag exists in the DOM
  //     but shows as broken. The old E2E test asserted
  //     `expect(src).toContain('/static/uploads/')` which NEVER matches R2 URLs
  //     (https://…r2.dev/…) → test was already wrong/fragile.
  //
  // WHY TESTS PASSED BUT PRODUCTION FAILED:
  //  • The test asserted UI elements (container visible, img tag exists) but
  //    NOT that the img src was a valid, reachable URL pointing to the uploaded
  //    file. `<img>` elements with broken src are still "visible" to Playwright
  //    because the DOM element exists and isn't hidden.
  //  • `toBeVisible()` does NOT verify that the image has loaded successfully—
  //    only that the element is in the DOM and not CSS-hidden.
  //
  // THE NEW TEST:
  //  • Stubs presign, R2 upload, metadata registration.
  //  • Stubs banner POST/GET and homepage blocks API.
  //  • After "saving" the banner, navigates to homepage and asserts the hero
  //    img src matches the R2 public URL (not empty, not undefined, not blob).

  test("full flow: add banner with image → homepage shows correct R2 image URL", async ({ page }) => {
    page.on("console", (msg) => console.log("BROWSER:", msg.text()));

    const r2PublicUrl = "https://pub-test.r2.dev/e2e-banner-flow.png";
    let savedBanner: any = null;

    // ── Stub presigned URL ──────────────────────────────────────────────────
    await page.route("**/v1/admin/media/presigned**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          upload_url: "http://localhost:8080/v1/media/simulate-upload/e2e-banner-flow.png",
          public_url: r2PublicUrl,
          id: "flow-presign-id",
        }),
      });
    });

    // ── Stub simulate-upload (acts as R2 PUT) ───────────────────────────────
    await page.route("**/simulate-upload/**", (r) => r.fulfill({ status: 200 }));

    // ── Stub media metadata POST ────────────────────────────────────────────
    await page.route("**/v1/media", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      } else await route.continue();
    });

    // ── Stub banners GET (initially empty) + POST (save) + GET (after save) ─
    await page.route("**/v1/admin/banners**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        const banners = savedBanner ? [savedBanner] : [];
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ banners }),
        });
      } else if (method === "POST") {
        savedBanner = {
          id: 99,
          title: "E2E Test Banner Title",
          subtitle: "E2E Test Banner Subtitle",
          image: r2PublicUrl,
          mobile_image: null,
          cta_text: "Shop E2E",
          cta_link: "/products",
          sort_order: 999,
          is_active: true,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, banner: savedBanner }),
        });
      } else {
        await route.continue();
      }
    });

    // ── Stub public homepage blocks (used by HeroBanner) ───────────────────
    await page.route("**/v1/public/homepage**", async (route) => {
      const slides = savedBanner
        ? [
            {
              id: "slide-1",
              title: savedBanner.title,
              subtitle: savedBanner.subtitle,
              image: savedBanner.image,
              cta_text: savedBanner.cta_text,
              cta_link: savedBanner.cta_link,
              sort_order: savedBanner.sort_order,
            },
          ]
        : [];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              block_type: "banner",
              is_active: true,
              config: { slides },
            },
          ],
        }),
      });
    });

    // ── Stub the R2 image request so it loads ──────────────────────────────
    await page.route(r2PublicUrl, (r) =>
      r.fulfill({ status: 200, contentType: "image/png", body: tinyPng })
    );

    // ── STEP 1: Go to Admin Banners ────────────────────────────────────────
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // ── STEP 2: Fill form ──────────────────────────────────────────────────
    await page.locator("#banner-title").fill("E2E Test Banner Title");
    await page.locator("#banner-subtitle").fill("E2E Test Banner Subtitle");
    await page.locator("#banner-cta").fill("Shop E2E");
    await page.locator("#banner-link").fill("/products");
    await page.locator("#banner-sort").fill("999");

    // ── STEP 3: Upload banner image ────────────────────────────────────────
    await page
      .locator('[data-testid="banner-desktop-media"] input[data-testid="media-file-input"]')
      .setInputFiles({ name: "e2e-banner-flow.png", mimeType: "image/png", buffer: tinyPng });

    // Preview must appear immediately (blob URL while upload is in flight)
    await expect(
      page.locator('[data-testid="banner-desktop-media"] [data-testid="media-preview-image"]').first()
    ).toBeVisible({ timeout: 10_000 });

    // ── STEP 4: Save banner ───────────────────────────────────────────────
    const postPromise = page.waitForResponse((r) =>
      r.url().includes("/v1/admin/banners") && r.request().method() === "POST"
    );
    await page.locator('[data-testid="banner-add-btn"]').click();
    const postResponse = await postPromise;
    expect(postResponse.status()).toBe(200);

    // ── STEP 5: Navigate to homepage ──────────────────────────────────────
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hero section must be visible
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();

    // Hero title must show our banner title
    await expect(
      page.locator('[data-testid="hero-title"]').filter({ hasText: "E2E Test Banner Title" }).first()
    ).toBeVisible({ timeout: 10_000 });

    // The banner <img> must have the R2 public URL as its src
    // (NOT a blob:// URL, NOT undefined, NOT empty)
    const bannerImg = page.locator('[data-testid="hero"] img').first();
    await expect(bannerImg).toBeVisible({ timeout: 10_000 });
    const src = await bannerImg.getAttribute("src");
    expect(src, "Homepage banner img src must be the R2 public URL, not empty or blob").toBeTruthy();
    // Decode for encoded URLs
    expect(
      decodeURIComponent(src!),
      "Homepage banner img src must point to the uploaded R2 file"
    ).toContain("pub-test.r2.dev/e2e-banner-flow.png");

    // ── STEP 6: Clean up – delete the banner ─────────────────────────────
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // After reload the seeded banner row must be visible
    const deleteRow = page
      .locator("tr")
      .filter({ has: page.locator('img[src*="e2e-banner-flow"]') });
    await expect(deleteRow).toBeVisible({ timeout: 10_000 });

    let deleteCalled = false;
    await page.route("**/v1/admin/banners/99", async (route) => {
      if (route.request().method() === "DELETE") {
        savedBanner = null;
        deleteCalled = true;
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      } else await route.continue();
    });

    page.once("dialog", (d) => d.accept());
    const deletePromise = page.waitForResponse(
      (r) => r.url().includes("/v1/admin/banners/99") && r.request().method() === "DELETE"
    );
    await deleteRow.locator('[data-testid="banner-delete-btn"]').click();
    const deleteResponse = await deletePromise;
    expect(deleteResponse.status()).toBe(200);
    expect(deleteCalled).toBe(true);
  });
});
