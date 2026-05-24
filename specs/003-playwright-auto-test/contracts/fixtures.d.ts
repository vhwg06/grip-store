/**
 * Contract: Playwright Test Fixtures
 * Defines the shape of custom fixtures available in test functions.
 */

import type { Page } from '@playwright/test';

// --- Page Objects ---

export interface IBasePage {
  readonly page: Page;
  goto(path?: string): Promise<void>;
}

export interface IAuthPage extends IBasePage {
  gotoLogin(): Promise<void>;
  login(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  getErrorMessage(): Promise<string>;
  getUserAvatar(): Promise<string | null>;
  isLoggedIn(): Promise<boolean>;
}

export interface IHomepagePage extends IBasePage {
  getHeroTitle(): Promise<string>;
  getFeaturedProducts(): Promise<string[]>;
  getAnnouncement(): Promise<string | null>;
}

export interface IProductListPage extends IBasePage {
  getProductCards(): Promise<ProductCardData[]>;
  filterByCategory(category: string): Promise<void>;
  sortBy(option: string): Promise<void>;
  goToPage(page: number): Promise<void>;
  search(query: string): Promise<void>;
  getResultCount(): Promise<number>;
}

export interface IProductDetailPage extends IBasePage {
  goto(productId: string): Promise<void>;
  getProductTitle(): Promise<string>;
  getPrice(): Promise<string>;
  addToCart(): Promise<void>;
  getReviews(): Promise<ReviewData[]>;
}

export interface ICartPage extends IBasePage {
  getItems(): Promise<CartItemData[]>;
  updateQuantity(index: number, quantity: number): Promise<void>;
  removeItem(index: number): Promise<void>;
  getTotal(): Promise<string>;
  proceedToCheckout(): Promise<void>;
}

export interface ICheckoutPage extends IBasePage {
  fillEmail(email: string): Promise<void>;
  selectPaymentMethod(method: string): Promise<void>;
  placeOrder(): Promise<void>;
  getOrderConfirmation(): Promise<string | null>;
}

export interface IOrdersPage extends IBasePage {
  getOrders(): Promise<OrderSummaryData[]>;
  viewOrderDetail(orderId: string): Promise<void>;
  cancelOrder(orderId: string): Promise<void>;
  requestRefund(orderId: string, reason: string): Promise<void>;
}

export interface IAdminPage extends IBasePage {
  navigateTo(section: string): Promise<void>;
  getTableRows(): Promise<number>;
  createItem(data: Record<string, string>): Promise<void>;
  editItem(id: string, data: Record<string, string>): Promise<void>;
  deleteItem(id: string): Promise<void>;
}

export interface IProfilePage extends IBasePage {
  getUsername(): Promise<string>;
  getPoints(): Promise<number>;
  updateEmail(email: string): Promise<void>;
  performCheckin(): Promise<void>;
}

export interface IArticlePage extends IBasePage {
  getArticles(): Promise<ArticleSummaryData[]>;
  viewArticle(slug: string): Promise<void>;
  getArticleTitle(): Promise<string>;
  getArticleContent(): Promise<string>;
}

export interface IWishlistPage extends IBasePage {
  getItems(): Promise<WishlistItemData[]>;
  addItem(productId: string): Promise<void>;
  removeItem(productId: string): Promise<void>;
  voteItem(productId: string): Promise<void>;
}

// --- Data Shapes ---

export interface ProductCardData {
  id: string;
  title: string;
  price: string;
  image?: string;
}

export interface ReviewData {
  author: string;
  rating: number;
  content: string;
}

export interface CartItemData {
  productId: string;
  title: string;
  quantity: number;
  price: string;
}

export interface OrderSummaryData {
  id: string;
  status: string;
  total: string;
  createdAt: string;
}

export interface ArticleSummaryData {
  slug: string;
  title: string;
  excerpt: string;
}

export interface WishlistItemData {
  productId: string;
  title: string;
  votes: number;
}

// --- Fixture Type (for base-test.ts) ---

export interface CustomFixtures {
  authPage: IAuthPage;
  homepagePage: IHomepagePage;
  productListPage: IProductListPage;
  productDetailPage: IProductDetailPage;
  cartPage: ICartPage;
  checkoutPage: ICheckoutPage;
  ordersPage: IOrdersPage;
  adminPage: IAdminPage;
  profilePage: IProfilePage;
  articlePage: IArticlePage;
  wishlistPage: IWishlistPage;
  apiClient: IGoBackendClient;
  testUser: TestUserData;
  adminUser: TestUserData;
}

export interface TestUserData {
  email: string;
  password: string;
  token: string;
  id: string;
}

// Re-exported from api-helpers contract
export interface IGoBackendClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
  seedTestData(): Promise<void>;
  resetTestState(): Promise<void>;
  createTestUser(email: string, password: string): Promise<TestUserData>;
}
