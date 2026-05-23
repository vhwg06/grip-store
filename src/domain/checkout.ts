export interface CheckoutOrderInput {
  productId: string
  quantity: number
  email?: string
  usePoints?: boolean
}

export interface CheckoutPaymentResult {
  success: boolean
  url?: string
  params?: Record<string, string | number | boolean | null | undefined>
  orderId?: string
  status?: string
  amount?: string
  pointsUsed?: number
  isZeroPrice?: boolean
  error?: string
}

export interface BuyMetaReview {
  id: number
  username: string
  userId?: string | null
  rating: number
  comment: string | null
  createdAt: string | null
}

export interface BuyPageMeta {
  reviews: BuyMetaReview[]
  averageRating: number
  reviewCount: number
  canReview: boolean
  reviewOrderId?: string
  emailConfigured: boolean
}

export interface PaymentOrderInput {
  amount: number | string
  payee?: string | null
}
