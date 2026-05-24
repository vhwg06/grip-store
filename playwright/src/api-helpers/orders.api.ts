import { GoBackendClient, type ApiResponse } from "./go-backend.client";
import type { Order } from "./checkout.api";
import type { PaginatedResponse } from "./catalog.api";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RefundRequest {
  id: string;
  order_id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export class OrdersApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  async getOrders(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    // Reuse checkout orders endpoint with list semantics
    return this.client.get(`/v1/checkout/orders${query}`) as unknown as Promise<ApiResponse<PaginatedResponse<Order>>>;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.client.get(`/v1/checkout/orders/${id}/status`) as unknown as Promise<ApiResponse<Order>>;
  }

  async getOrderStatus(id: string): Promise<ApiResponse<{ status: string }>> {
    return this.client.get(`/v1/checkout/orders/${id}/status`);
  }

  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/checkout/orders/${id}/cancel`);
  }

  async requestRefund(id: string, reason: string): Promise<ApiResponse<RefundRequest>> {
    return this.client.post(`/v1/checkout/orders/${id}/refund`, { reason });
  }
}
