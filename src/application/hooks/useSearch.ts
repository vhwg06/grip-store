"use client"

import useSWR from "swr"
import { getCategories, searchProducts } from "@/adapters/api/catalog.api"
import type { CatalogSearchParams } from "@/domain/catalog"

export function useSearch(params: CatalogSearchParams) {
  const results = useSWR(
    ["catalog-search", params.q ?? "", params.category ?? "", params.page ?? 1, params.limit ?? 24, params.sort ?? "default"],
    () => searchProducts(params),
  )
  const categories = useSWR("catalog-categories", getCategories)

  return {
    products: results.data?.items ?? [],
    total: results.data?.total ?? 0,
    page: results.data?.page ?? params.page ?? 1,
    pageSize: results.data?.limit ?? params.limit ?? 24,
    categories: categories.data ?? [],
    isLoading: results.isLoading || categories.isLoading,
    error: results.error || categories.error || null,
  }
}
