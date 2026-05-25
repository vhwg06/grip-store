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

async function loginForToken(request: any, email: string, password: string): Promise<string | null> {
  const response = await request.post("/v1/auth/login", {
    data: { email, password },
  });
  if (!response.ok()) return null;
  const payload = await response.json();
  return (
    payload?.token ??
    payload?.access_token ??
    payload?.accessToken ??
    payload?.data?.token ??
    payload?.data?.access_token ??
    payload?.data?.accessToken ??
    null
  );
}

export const test = base.extend<CustomFixtures>({
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

export { expect } from "@playwright/test";
