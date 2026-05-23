export interface WishlistItem {
  id: number
  title: string
  description?: string | null
  username?: string | null
  createdAt?: number | null
  votes: number
  voted: boolean
}

export interface WishlistResponse {
  items: WishlistItem[]
  enabled: boolean
}

export interface WishlistActionResult {
  success: boolean
  error?: string
}

export interface SubmitWishlistResult extends WishlistActionResult {
  item?: WishlistItem
}

export interface ToggleWishlistVoteResult extends WishlistActionResult {
  voted?: boolean
  count?: number
}

export interface ProductReview {
  id: number
  username: string
  userId?: string | null
  rating: number
  comment: string | null
  createdAt: string | null
}

export interface ProductReviewsResponse {
  reviews: ProductReview[]
  averageRating: number
  reviewCount: number
}

export interface SubmitReviewInput {
  orderId: string
  rating: number
  comment: string
}
