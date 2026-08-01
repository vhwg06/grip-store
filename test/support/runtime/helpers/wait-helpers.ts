import type { Page, Locator } from "@playwright/test";

/**
 * Reusable wait utilities for Playwright tests.
 */
export const WaitHelpers = {
  /** Wait for network to be idle (no pending requests for 500ms) */
  async networkIdle(page: Page, timeout = 10_000) {
    await page.waitForLoadState("networkidle", { timeout });
  },

  /** Wait for a specific API response by URL pattern */
  async apiResponse(page: Page, urlPattern: string | RegExp, timeout = 15_000) {
    return page.waitForResponse(
      (resp) =>
        typeof urlPattern === "string"
          ? resp.url().includes(urlPattern)
          : urlPattern.test(resp.url()),
      { timeout }
    );
  },

  /** Wait for an element to become visible */
  async visible(locator: Locator, timeout = 10_000) {
    await locator.waitFor({ state: "visible", timeout });
  },

  /** Wait for an element to be removed from DOM */
  async detached(locator: Locator, timeout = 10_000) {
    await locator.waitFor({ state: "detached", timeout });
  },

  /** Wait for a toast / notification to appear and optionally disappear */
  async toast(page: Page, options?: { text?: string; disappear?: boolean; timeout?: number }) {
    const timeout = options?.timeout ?? 10_000;
    const locator = options?.text
      ? page.locator('[data-testid="toast"]', { hasText: options.text })
      : page.locator('[data-testid="toast"]');
    await locator.waitFor({ state: "visible", timeout });
    if (options?.disappear) {
      await locator.waitFor({ state: "detached", timeout });
    }
  },

  /** Wait for page URL to contain a path segment */
  async urlContains(page: Page, segment: string, timeout = 10_000) {
    await page.waitForURL(`**/*${segment}*`, { timeout });
  },

  /** Poll a condition until it's true */
  async poll(fn: () => Promise<boolean>, interval = 500, timeout = 15_000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await fn()) return;
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(`Polling timed out after ${timeout}ms`);
  },
};
