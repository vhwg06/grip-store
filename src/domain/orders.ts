export type OrderStatus = "pending" | "paid" | "delivered" | "failed" | "refunded" | "cancelled" | string

export interface OrderSummary {
  orderId: string
  productId: string | null
  productName: string
  amount: string
  status: OrderStatus | null
  createdAt: string | null
  canReview?: boolean
}

export interface OrderDetail extends OrderSummary {
  payee?: string | null
  paidAt: string | null
}

export interface RefundRequestState {
  status: string | null
  reason: string | null
}

export interface OrderDetailResponse {
  order: OrderDetail | null
  isOwner: boolean
  refundRequest: RefundRequestState | null
}

export interface OrdersListResponse {
  items: OrderSummary[]
  page: number
  total: number
}

export interface OrderActionResult {
  success: boolean
  status?: OrderStatus
  error?: string
}
