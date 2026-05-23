"use client"

import useSWR from "swr"
import {
  deleteWishlistItem,
  getWishlistItems,
  submitWishlistItem,
  toggleWishlistVote,
} from "@/adapters/api/wishlist.api"

export function useWishlist(limit = 30) {
  const swr = useSWR(["wishlist", limit], () => getWishlistItems(limit))

  return {
    items: swr.data?.items ?? [],
    enabled: swr.data?.enabled ?? false,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
    submitWishlistItem,
    toggleWishlistVote,
    deleteWishlistItem,
  }
}
