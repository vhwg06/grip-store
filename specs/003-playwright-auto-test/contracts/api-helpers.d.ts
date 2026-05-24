/**
 * Contract: API Helper Classes
 * Defines the shape of API helper classes used in tests for type-safe backend interaction.
 */

// --- Base Client ---

export interface IGoBackendClient {
  readonly baseUrl: string;
  setToken(token: string): void;
  get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  delete<T>(path: string): Promise<ApiResponse<T>>;
  seedTestData(): Promise<void>;
  resetTestState(): Promise<void>;
  createTestUser(email: string, password: string): Promise<{ id: string; token: string }>;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

// --- Auth API ---

export interface IAuthApiHelper {
  refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refresh_token: string }>>;
  logout(): Promise<ApiResponse<void>>;
  getMe(): Promise<ApiResponse<UserProfile>>;
}

// --- Catalog API ---

export interface ICatalogApiHelper {
  getProducts(params?: ProductQueryParams): Promise<ApiResponse<PaginatedResponse<Product>>>;
  getProduct(id: string): Promise<ApiResponse<Product>>;
  getBuyMeta(id: string): Promise<ApiResponse<BuyMeta>>;
  search(query: string): Promise<ApiResponse<Product[]>>;
  getCategories(): Promise<ApiResponse<Category[]>>;
  getSettings(): Promise<ApiResponse<SiteSettings>>;
  getAnnouncement(): Promise<ApiResponse<Announcement | null>>;
}

// --- Checkout API ---

export interface ICheckoutApiHelper {
  createOrder(items: OrderItem[]): Promise<ApiResponse<Order>>;
  getPaymentOrders(orderId: string): Promise<ApiResponse<PaymentOrder>>;
  getPaymentParams(paymentOrderId: string): Promise<ApiResponse<PaymentParams>>;
  getOrderStatus(orderId: string): Promise<ApiResponse<{ status: string }>>;
  cancelOrder(orderId: string): Promise<ApiResponse<void>>;
}

// --- Orders API ---

export interface IOrdersApiHelper {
  getOrders(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>>;
  getOrder(id: string): Promise<ApiResponse<Order>>;
  getOrderStatus(id: string): Promise<ApiResponse<{ status: string }>>;
  cancelOrder(id: string): Promise<ApiResponse<void>>;
  requestRefund(id: string, reason: string): Promise<ApiResponse<RefundRequest>>;
}

// --- Profile API ---

export interface IProfileApiHelper {
  getProfile(): Promise<ApiResponse<UserProfile>>;
  updateEmail(email: string): Promise<ApiResponse<void>>;
  updateNotifications(settings: NotificationSettings): Promise<ApiResponse<void>>;
  getPoints(): Promise<ApiResponse<{ points: number; history: PointsEntry[] }>>;
  checkin(): Promise<ApiResponse<{ points: number; streak: number }>>;
  getCheckinStatus(): Promise<ApiResponse<{ checked_in_today: boolean; streak: number }>>;
}

// --- Engagement API ---

export interface IEngagementApiHelper {
  // Wishlist
  getWishlist(): Promise<ApiResponse<WishlistItem[]>>;
  addToWishlist(productId: string): Promise<ApiResponse<WishlistItem>>;
  voteWishlistItem(id: string): Promise<ApiResponse<void>>;
  removeFromWishlist(id: string): Promise<ApiResponse<void>>;
  // Reviews
  getReviews(productId: string): Promise<ApiResponse<Review[]>>;
  createReview(productId: string, data: CreateReviewData): Promise<ApiResponse<Review>>;
  // Notifications
  getNotifications(): Promise<ApiResponse<Notification[]>>;
  getUnreadCount(): Promise<ApiResponse<{ count: number }>>;
  markAsRead(id: string): Promise<ApiResponse<void>>;
  markAllAsRead(): Promise<ApiResponse<void>>;
  clearNotifications(): Promise<ApiResponse<void>>;
}

// --- Admin API ---

export interface IAdminApiHelper {
  // Products
  getProducts(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Product>>>;
  createProduct(data: CreateProductData): Promise<ApiResponse<Product>>;
  updateProduct(id: string, data: Partial<CreateProductData>): Promise<ApiResponse<Product>>;
  deleteProduct(id: string): Promise<ApiResponse<void>>;
  toggleProduct(id: string): Promise<ApiResponse<void>>;
  reorderProducts(ids: string[]): Promise<ApiResponse<void>>;
  // Cards
  getCards(): Promise<ApiResponse<Card[]>>;
  importCards(data: ImportCardsData): Promise<ApiResponse<{ imported: number }>>;
  deleteCard(id: string): Promise<ApiResponse<void>>;
  pullCards(): Promise<ApiResponse<{ pulled: number }>>;
  // Orders
  getOrders(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>>;
  updateOrder(id: string, data: UpdateOrderData): Promise<ApiResponse<Order>>;
  deleteOrder(id: string): Promise<ApiResponse<void>>;
  approveRefund(requestId: string): Promise<ApiResponse<void>>;
  rejectRefund(requestId: string, reason: string): Promise<ApiResponse<void>>;
  // Users & Settings
  getUsers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<UserProfile>>>;
  getSettings(): Promise<ApiResponse<AdminSettings>>;
  updateSettings(data: Partial<AdminSettings>): Promise<ApiResponse<AdminSettings>>;
  getCategories(): Promise<ApiResponse<Category[]>>;
  createCategory(data: CreateCategoryData): Promise<ApiResponse<Category>>;
  updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<ApiResponse<Category>>;
  deleteCategory(id: string): Promise<ApiResponse<void>>;
  // Notifications & Data
  sendTestNotification(userId: string): Promise<ApiResponse<void>>;
  broadcastNotification(data: BroadcastData): Promise<ApiResponse<void>>;
  importData(data: ImportData): Promise<ApiResponse<{ imported: number }>>;
  repairData(): Promise<ApiResponse<{ repaired: number }>>;
}

// --- Shared Types ---

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductQueryParams extends PaginationParams {
  category?: string;
  sort?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'user' | 'admin';
  points: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  active: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface BuyMeta {
  product_id: string;
  available: boolean;
  stock: number;
}

export interface PaymentOrder {
  id: string;
  order_id: string;
  amount: number;
  status: string;
}

export interface PaymentParams {
  url: string;
  params: Record<string, string>;
}

export interface RefundRequest {
  id: string;
  order_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  currency: string;
}

export interface Announcement {
  id: string;
  content: string;
  active: boolean;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product_title: string;
  votes: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface CreateReviewData {
  rating: number;
  content: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
}

export interface PointsEntry {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Card {
  id: string;
  code: string;
  product_id: string;
  used: boolean;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
}

export interface UpdateOrderData {
  status: string;
}

export interface ImportCardsData {
  product_id: string;
  codes: string[];
}

export interface AdminSettings {
  site_name: string;
  site_description: string;
  currency: string;
  payment_enabled: boolean;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
}

export interface BroadcastData {
  title: string;
  content: string;
  target: 'all' | 'admins';
}

export interface ImportData {
  type: string;
  data: unknown[];
}
