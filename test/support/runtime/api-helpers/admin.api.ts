import { GoBackendClient, type ApiResponse } from "./go-backend.client";
import type { Product, Category, PaginatedResponse } from "./catalog.api";
import type { Order } from "./checkout.api";
import type { UserProfile } from "./auth.api";

export interface PaginationParams {
  page?: number;
  limit?: number;
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
  target: "all" | "admins";
}

export interface ImportData {
  type: string;
  data: unknown[];
}

export class AdminApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  /* ── Products ─────────────────────────────── */

  async getProducts(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return this.client.get(`/v1/admin/products${query}`);
  }

  async createProduct(data: CreateProductData): Promise<ApiResponse<Product>> {
    return this.client.post("/v1/admin/products", data);
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<ApiResponse<Product>> {
    return this.client.put(`/v1/admin/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/v1/admin/products/${id}`);
  }

  async toggleProduct(id: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/admin/products/${id}/toggle`);
  }

  async reorderProducts(ids: string[]): Promise<ApiResponse<void>> {
    return this.client.post("/v1/admin/products/reorder", { ids });
  }
  /* ── Orders ───────────────────────────────── */

  async getOrders(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return this.client.get(`/v1/admin/orders${query}`);
  }

  async updateOrder(id: string, data: UpdateOrderData): Promise<ApiResponse<Order>> {
    return this.client.put(`/v1/admin/orders/${id}`, data);
  }

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/v1/admin/orders/${id}`);
  }

  async approveRefund(requestId: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/admin/refunds/${requestId}/approve`);
  }

  async rejectRefund(requestId: string, reason: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/admin/refunds/${requestId}/reject`, { reason });
  }

  /* ── Users & Settings ─────────────────────── */

  async getUsers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<UserProfile>>> {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return this.client.get(`/v1/admin/users${query}`);
  }

  async getSettings(): Promise<ApiResponse<AdminSettings>> {
    return this.client.get("/v1/admin/settings");
  }

  async updateSettings(data: Partial<AdminSettings>): Promise<ApiResponse<AdminSettings>> {
    return this.client.put("/v1/admin/settings", data);
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.client.get("/v1/admin/categories");
  }

  async createCategory(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    return this.client.post("/v1/admin/categories", data);
  }

  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<ApiResponse<Category>> {
    return this.client.put(`/v1/admin/categories/${id}`, data);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/v1/admin/categories/${id}`);
  }

  /* ── Notifications & Data ─────────────────── */

  async sendTestNotification(userId: string): Promise<ApiResponse<void>> {
    return this.client.post("/v1/admin/notifications/test", { user_id: userId });
  }

  async broadcastNotification(data: BroadcastData): Promise<ApiResponse<void>> {
    return this.client.post("/v1/admin/notifications/broadcast", data);
  }

  async importData(data: ImportData): Promise<ApiResponse<{ imported: number }>> {
    return this.client.post("/v1/admin/data/import", data);
  }

  async repairData(): Promise<ApiResponse<{ repaired: number }>> {
    return this.client.post("/v1/admin/data/repair-aggregates");
  }
}
