"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  ProductReview,
  ProductReviewsResponse,
  SubmitReviewInput,
  SubmitWishlistResult,
  ToggleWishlistVoteResult,
  WishlistActionResult,
  WishlistItem,
  WishlistResponse,
} from "@/domain/wishlist"

function normalizeActionResult(payload: unknown): WishlistActionResult {
  const value = (payload ?? {}) as Record<string, any>
  return {
    success: value.success !== false && value.ok !== false,
    error: value.error ? String(value.error) : undefined,
  }
}

function normalizeItem(item: Partial<WishlistItem>): WishlistItem {
  return {
    id: Number(item.id ?? 0),
    title: String(item.title || ""),
    description: item.description ?? null,
    username: item.username ?? null,
    createdAt: item.createdAt ?? null,
    votes: Number(item.votes ?? 0),
    voted: Boolean(item.voted),
  }
}

function normalizeReview(review: Partial<ProductReview>): ProductReview {
  return {
    id: Number(review.id ?? 0),
    username: String(review.username || ""),
    userId: review.userId ?? null,
    rating: Number(review.rating ?? 0),
    comment: review.comment ?? null,
    createdAt: review.createdAt ?? null,
  }
}

export async function getWishlistItems(limit = 30): Promise<WishlistResponse> {
  const payload = await apiFetch<unknown>(`/api/wishlist?limit=${encodeURIComponent(String(limit))}`)
  if (Array.isArray(payload)) {
    return {
      enabled: true,
      items: payload.map((item) => normalizeItem(item as WishlistItem)),
    }
  }

  const value = (payload ?? {}) as Partial<WishlistResponse>
  return {
    enabled: value.enabled !== false,
    items: Array.isArray(value.items) ? value.items.map((item) => normalizeItem(item)) : [],
  }
}

export async function submitWishlistItem(title: string, description?: string): Promise<SubmitWishlistResult> {
  const payload = (await apiFetch<unknown>("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  })) as Record<string, any>

  return {
    ...normalizeActionResult(payload),
    item: payload.item ? normalizeItem(payload.item) : undefined,
  }
}

export async function toggleWishlistVote(id: number): Promise<ToggleWishlistVoteResult> {
  const payload = (await apiFetch<unknown>(`/api/wishlist/${encodeURIComponent(String(id))}/vote`, {
    method: "POST",
  })) as Record<string, any>

  return {
    ...normalizeActionResult(payload),
    voted: payload.voted,
    count: typeof payload.count === "number" ? payload.count : undefined,
  }
}

export async function deleteWishlistItem(id: number): Promise<WishlistActionResult> {
  const payload = await apiFetch<unknown>(`/api/wishlist/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  })
  return normalizeActionResult(payload)
}

export async function getProductReviews(productId: string): Promise<ProductReviewsResponse> {
  const payload = await apiFetch<Partial<ProductReviewsResponse>>(
    `/api/products/${encodeURIComponent(productId)}/reviews`,
  )

  const reviews = Array.isArray(payload.reviews)
    ? payload.reviews.map((review) => normalizeReview(review))
    : []

  return {
    reviews,
    averageRating: Number(payload.averageRating ?? 0),
    reviewCount: Number(payload.reviewCount ?? reviews.length),
  }
}

export async function submitReview(productId: string, input: SubmitReviewInput): Promise<WishlistActionResult> {
  const payload = await apiFetch<unknown>(`/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  })
  return normalizeActionResult(payload)
}
