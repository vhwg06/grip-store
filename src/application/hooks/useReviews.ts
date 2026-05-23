"use client"

import useSWR from "swr"
import { getProductReviews, submitReview } from "@/adapters/api/wishlist.api"

export function useReviews(productId: string | null | undefined) {
  const swr = useSWR(productId ? ["product-reviews", productId] : null, () => getProductReviews(productId as string))

  return {
    reviews: swr.data?.reviews ?? [],
    averageRating: swr.data?.averageRating ?? 0,
    reviewCount: swr.data?.reviewCount ?? 0,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
    submitReview,
  }
}
