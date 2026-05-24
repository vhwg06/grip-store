import { GoBackendClient, type ApiResponse } from "./go-backend.client";

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
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

export class CheckoutApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  async createOrder(items: OrderItem[]): Promise<ApiResponse<Order>> {
    return this.client.post("/v1/checkout/orders", { items });
  }

  async getPaymentOrders(orderId: string): Promise<ApiResponse<PaymentOrder>> {
    return this.client.post("/v1/checkout/payment-orders", { order_id: orderId });
  }

  async getPaymentParams(orderId: string): Promise<ApiResponse<PaymentParams>> {
    return this.client.get(`/v1/checkout/orders/${orderId}/payment-params`);
  }

  async getOrderStatus(orderId: string): Promise<ApiResponse<{ status: string }>> {
    return this.client.get(`/v1/checkout/orders/${orderId}/status`);
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    return this.client.post(`/v1/checkout/orders/${orderId}/cancel`);
  }

  async getPreview(): Promise<ApiResponse<unknown>> {
    return this.client.get("/v1/checkout/preview");
  }
}
