"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  CatalogCategory,
  CatalogSearchParams,
  CatalogSettings,
  CatalogProductViewState,
  CatalogAvailableOption,
  CatalogProductsResponse,
  CatalogVariant,
} from "@/domain/catalog"
import {
  catalogProductFromModel,
  normalizeCatalogOptions,
  normalizeCatalogProductModel,
  normalizeCatalogVariant,
  unwrapCatalogPayload,
} from "@/adapters/api/catalog-model"

function withQuery(path: string, params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    const normalized = String(value).trim()
    if (!normalized) return
    search.set(key, normalized)
  })

  const query = search.toString()
  return query ? `${path}?${query}` : path
}

type UnknownRecord = Record<string, unknown>

function object(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {}
}

export async function getActiveProducts(options: CatalogSearchParams = {}): Promise<CatalogProductsResponse> {
  const supportedSort = options.sort === "price_asc" || options.sort === "price_desc" || options.sort === "newest"
    ? options.sort
    : undefined
  const payload = await apiFetch<unknown>(
    withQuery("/api/catalog/product-models", {
      search: options.q,
      categoryId: options.category && options.category !== "all" ? options.category : undefined,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      page: options.page,
      limit: options.limit,
      sort: supportedSort,
    }),
  )

  const value = unwrapCatalogPayload(payload)
  const record = object(value)
  const rawItems = Array.isArray(value)
    ? value
    : (Array.isArray(record.items) ? record.items : [])
  const items = rawItems
    .map(normalizeCatalogProductModel)
    .map(catalogProductFromModel)

  return {
    items,
    page: Number(record.page ?? options.page ?? 1),
    limit: Number(record.limit ?? options.limit ?? 20),
    total: Number(record.total ?? items.length),
  }
}

export async function getProduct(id: string): Promise<CatalogProductViewState> {
  const payload = await apiFetch<unknown>(`/api/catalog/product-models/${encodeURIComponent(id)}`)
  const model = normalizeCatalogProductModel(payload)

  return {
    product: model.id ? catalogProductFromModel(model) : null,
    requiredLevel: null,
  }
}

export async function searchProducts(options: CatalogSearchParams = {}): Promise<CatalogProductsResponse> {
  return getActiveProducts(options)
}

export async function getProductModelOptions(
  modelId: string,
  selected: Record<string, string>,
): Promise<CatalogAvailableOption[]> {
  const payload = await apiFetch<unknown>(
    withQuery(`/api/catalog/product-models/${encodeURIComponent(modelId)}/options`, {
      selected: JSON.stringify(selected),
    }),
  )
  return normalizeCatalogOptions(payload)
}

export async function resolveProductModelVariant(
  modelId: string,
  selectedOptions: Record<string, string>,
): Promise<CatalogVariant> {
  const payload = await apiFetch<unknown>(
    `/api/catalog/product-models/${encodeURIComponent(modelId)}/variants:resolve`,
    {
      method: "POST",
      body: JSON.stringify({ selectedOptions }),
    },
  )
  return normalizeCatalogVariant(unwrapCatalogPayload(payload))
}

export async function getCategories(): Promise<CatalogCategory[]> {
  const payload = await apiFetch<unknown>("/api/catalog/categories")
  const value = unwrapCatalogPayload(payload)
  const record = object(value)
  const items = Array.isArray(value)
    ? value
    : (Array.isArray(record.items) ? record.items : [])

  return items.map((value): CatalogCategory => {
    const item = object(value)
    return {
      id: String(item.id ?? ""),
      name: String(item.name || ""),
      slug: item.slug == null ? undefined : String(item.slug),
      icon: item.icon == null ? null : String(item.icon),
      sortOrder: Number(item.position ?? item.sortOrder ?? 0),
      parentId: item.parentId == null ? null : String(item.parentId),
      productCount: item.productCount == null ? undefined : Number(item.productCount),
      active: item.active !== false,
    }
  })
}

export async function getCategoryTree() {
  const items = await getCategories()
  // Can be extended to build actual tree if frontend needs nested structure
  return items
}

export async function getPublicSettings() {
  const payload = await apiFetch<any>("/api/catalog/settings")
  return (payload?.data !== undefined ? payload.data : payload) as CatalogSettings
}

export async function getAnnouncement() {
  const payload = await apiFetch<unknown>("/api/catalog/announcement")
  const value = (payload ?? {}) as any
  const raw = value.data !== undefined ? value.data : value

  if (typeof raw === "string") {
    return raw
  }
  return raw?.value || raw?.content || null
}
