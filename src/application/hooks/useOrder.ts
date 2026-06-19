"use client"

import useSWR from "swr"
import { getOrder } from "@/adapters/api/orders.api"

export function useOrder(id: string | null | undefined) {
  const swr = useSWR(id ? ["order", id] : null, () => getOrder(id as string))

  return {
    order: swr.data?.order ?? null,
    isOwner: Boolean(swr.data?.isOwner),
    refundRequest: swr.data?.refundRequest ?? null,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
  }
}
