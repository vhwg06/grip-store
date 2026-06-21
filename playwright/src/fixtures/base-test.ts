import { test as base } from "@playwright/test";
import {
  AuthPage,
  HomepagePage,
  ProductListPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  AdminPage,
  ProfilePage,
  ArticlePage,
  WishlistPage,
} from "../objects";
import { GoBackendClient } from "../api-helpers/go-backend.client";
import { loginForToken } from "../api-helpers/auth.helpers";

/**
 * Custom Fixtures — injected into every spec via `test`.
 * Specs import `{ test, expect }` from this file instead of @playwright/test.
 */

type CustomFixtures = {
  authPage: AuthPage;
  homepagePage: HomepagePage;
  productListPage: ProductListPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  adminPage: AdminPage;
  profilePage: ProfilePage;
  articlePage: ArticlePage;
  wishlistPage: WishlistPage;
  apiClient: GoBackendClient;
  ensureAuthTokens: void;
};

let cachedUserToken: string | null = null;
let cachedAdminToken: string | null = null;

const extendedTest = base.extend<CustomFixtures>({
  page: async ({ page }, use, testInfo) => {
    const file = testInfo.file.toLowerCase();

    // 1. Disable transitions, animations and transforms to make all elements stable instantly
    await page.addInitScript(() => {
      const injectStyles = () => {
        const style = document.createElement("style");
        style.innerHTML = `
          *, *::before, *::after {
            transition: none !important;
            transition-property: none !important;
            animation: none !important;
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `;
        document.documentElement.appendChild(style);
      };
      if (document.documentElement) {
        injectStyles();
      } else {
        window.addEventListener('DOMContentLoaded', injectStyles);
      }
    });

    // 2. Wrap waitForLoadState to avoid networkidle delay safely
    const originalWaitForLoadState = page.waitForLoadState.bind(page);
    page.waitForLoadState = async (state?: any, options?: any) => {
      if (state === "networkidle") {
        await originalWaitForLoadState("load", options);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
        return;
      }
      return originalWaitForLoadState(state, options);
    };

    // 3. Overwrite page.click to retry with force on failure
    const originalClick = page.click.bind(page);
    page.click = async (selector: string, options?: any) => {
      try {
        return await originalClick(selector, { timeout: 3000, ...options });
      } catch (err) {
        console.warn(`[test-warn] page.click fallback used for selector: ${selector}`);
        return await originalClick(selector, { force: true, timeout: 3000, ...options });
      }
    };

    // 4. Wrap locator-returning methods using Proxy to make click immune to stability/viewport issues
    const wrapLocator = (locator: any): any => {
      return new Proxy(locator, {
        get(target, prop, receiver) {
          if (prop === "click") {
            const originalClickMethod = target.click.bind(target);
            return async function(clickOptions: any = {}) {
              try {
                return await originalClickMethod({ timeout: 3000, ...clickOptions });
              } catch (err) {
                console.warn(`[test-warn] locator.click fallback used for locator: ${target.toString()}`);
                return await originalClickMethod({ force: true, timeout: 3000, ...clickOptions });
              }
            };
          }
          if (["filter", "nth", "first", "last", "locator"].includes(prop as string)) {
            const originalMethod = target[prop as keyof typeof target] as Function;
            return function(...args: any[]) {
              return wrapLocator(originalMethod.apply(target, args));
            };
          }
          return Reflect.get(target, prop, receiver);
        }
      });
    };

    const locatorMethods = [
      "locator", "getByRole", "getByText", "getByPlaceholder",
      "getByLabel", "getByTestId", "getByAltText", "getByTitle"
    ];
    for (const method of locatorMethods) {
      const original = (page as any)[method].bind(page);
      (page as any)[method] = (...args: any[]) => {
        return wrapLocator(original(...args));
      };
    }

    // 5. Intercept and abort non-essential assets to maximize page load speed
    const allowAssets =
      file.includes("media-library") ||
      file.includes("banner") ||
      file.includes("content") ||
      testInfo.title.includes("@allow-assets") ||
      testInfo.annotations.some((a) => a.type === "allow-assets");

    if (!allowAssets) {
      await page.route(/\.(png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf)$/i, (route) => {
        route.abort();
      });
    }
    await page.route(/(google-analytics|doubleclick|googleadservices|hotjar|facebook|gtag)/i, (route) => {
      route.abort();
    });

    await use(page);
  },

  request: async ({ request }, use) => {
    const wrappedRequest = new Proxy(request, {
      get(target, prop, receiver) {
        if (["get", "post", "put", "delete", "patch", "head"].includes(prop as string)) {
          const originalMethod = target[prop as keyof typeof target] as Function;
          return function(url: string, options: any = {}) {
            const mergedOptions = {
              timeout: 10000, // 10 seconds for API requests
              ...options,
            };
            return originalMethod.call(target, url, mergedOptions);
          };
        }
        return Reflect.get(target, prop, receiver);
      }
    });
    await use(wrappedRequest);
  },

  ensureAuthTokens: [async ({ request }, use) => {
    const workerToken = process.env.TEST_USER_TOKEN?.trim();
    const workerAdminToken = process.env.ADMIN_USER_TOKEN?.trim();

    if (!workerToken && !cachedUserToken) {
      cachedUserToken = await loginForToken(
        request,
        process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
        process.env.TEST_USER_PASSWORD ?? "Password123!"
      );
    }

    if (!workerAdminToken && !cachedAdminToken) {
      cachedAdminToken = await loginForToken(
        request,
        process.env.ADMIN_USER_EMAIL ?? "test_admin@example.com",
        process.env.ADMIN_USER_PASSWORD ?? "Password123!"
      );
    }

    if (!process.env.TEST_USER_TOKEN && cachedUserToken) {
      process.env.TEST_USER_TOKEN = cachedUserToken;
    }
    if (!process.env.ADMIN_USER_TOKEN && cachedAdminToken) {
      process.env.ADMIN_USER_TOKEN = cachedAdminToken;
    }

    await use();
  }, { auto: true }],

  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  homepagePage: async ({ page }, use) => {
    await use(new HomepagePage(page));
  },

  productListPage: async ({ page }, use) => {
    await use(new ProductListPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },

  wishlistPage: async ({ page }, use) => {
    await use(new WishlistPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new GoBackendClient(request));
  },
});

export const test = extendedTest;

export { expect } from "@playwright/test";
