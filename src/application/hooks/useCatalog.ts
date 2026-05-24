"use client"

import useSWR from "swr"
import { getActiveProducts, getAnnouncement, getCategories, getPublicSettings } from "@/adapters/api/catalog.api"
import type { CatalogCategory, CatalogSearchParams } from "@/domain/catalog"

export function useCatalog(params: CatalogSearchParams = {}) {
  const products = useSWR(
    [
      "catalog-products",
      params.q ?? "",
      params.category ?? "",
      params.brand ?? "",
      params.minPrice ?? "",
      params.maxPrice ?? "",
      params.page ?? 1,
      params.limit ?? 24,
      params.sort ?? "default",
    ],
    () => getActiveProducts(params),
  )
  const categories = useSWR("catalog-categories", getCategories)
  const settings = useSWR("catalog-settings", getPublicSettings)
  const announcement = useSWR("catalog-announcement", getAnnouncement)

  return {
    products: products.data?.items ?? [],
    total: products.data?.total ?? 0,
    page: products.data?.page ?? params.page ?? 1,
    limit: products.data?.limit ?? params.limit ?? 24,
    categories: (categories.data ?? []) as CatalogCategory[],
    settings: settings.data ?? null,
    announcement: announcement.data ?? null,
    isLoading: products.isLoading || categories.isLoading || settings.isLoading || announcement.isLoading,
    error: products.error || categories.error || settings.error || announcement.error || null,
  }
}

export function usePublicSettings() {
  const swr = useSWR("catalog-settings", getPublicSettings)

  return {
    settings: swr.data ?? null,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
  }
}
