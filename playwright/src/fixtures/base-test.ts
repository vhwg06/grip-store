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
};

export const test = base.extend<CustomFixtures>({
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
