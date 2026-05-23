"use client"

import useSWR from "swr"
import { getProduct } from "@/adapters/api/catalog.api"

export function useProduct(id: string | null | undefined) {
  const swr = useSWR(id ? ["catalog-product", id] : null, () => getProduct(id as string))

  return {
    product: swr.data?.product ?? null,
    requiredLevel: swr.data?.requiredLevel ?? null,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
  }
}
