"use client"

import useSWR from "swr"
import { getActiveProducts, getAnnouncement, getCategories, getPublicSettings } from "@/adapters/api/catalog.api"
import type { CatalogSearchParams } from "@/domain/catalog"

export function useCatalog(params: CatalogSearchParams = {}) {
  const products = useSWR(
    ["catalog-products", params.q ?? "", params.category ?? "", params.page ?? 1, params.limit ?? 24, params.sort ?? "default"],
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
    categories: categories.data ?? [],
    settings: settings.data ?? null,
    announcement: announcement.data ?? null,
    isLoading: products.isLoading || categories.isLoading || settings.isLoading || announcement.isLoading,
    error: products.error || categories.error || settings.error || announcement.error || null,
  }
}
