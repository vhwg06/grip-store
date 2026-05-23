"use client"

import useSWR from "swr"
import { getMyOrders } from "@/adapters/api/orders.api"

export function useOrders(page = 1) {
  const swr = useSWR(["orders", page], () => getMyOrders(page))

  return {
    orders: swr.data?.items ?? [],
    page: swr.data?.page ?? page,
    total: swr.data?.total ?? 0,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
  }
}
