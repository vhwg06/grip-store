import { GoBackendClient, type ApiResponse } from "./go-backend.client";

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

export class EngagementApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  /* ── Wishlist ─────────────────────────────── */

  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    return this.client.get("/v1/wishlist");
  }

  async addToWishlist(productId: string): Promise<ApiResponse<WishlistItem>> {
    return this.client.post("/v1/wishlist", { product_id: productId });
  }

  async voteWishlistItem(id: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/wishlist/${id}/vote`);
  }

  async removeFromWishlist(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/v1/wishlist/${id}`);
  }

  /* ── Reviews ──────────────────────────────── */

  async getReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.client.get(`/v1/catalog/products/${productId}/reviews`);
  }

  async createReview(productId: string, data: CreateReviewData): Promise<ApiResponse<Review>> {
    return this.client.post("/v1/reviews", { product_id: productId, ...data });
  }

  /* ── Notifications ────────────────────────── */

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.client.get("/v1/user/notifications");
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.client.get("/v1/user/notifications/unread-count");
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/user/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.client.post("/v1/user/notifications/read-all");
  }

  async clearNotifications(): Promise<ApiResponse<void>> {
    return this.client.delete("/v1/user/notifications");
  }
}
