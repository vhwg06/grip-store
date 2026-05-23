"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductDetail,
  CatalogProductsResponse,
  CatalogSearchParams,
  CatalogSettings,
  CatalogProductViewState,
} from "@/domain/catalog"

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

function normalizeProduct(product: Partial<CatalogProduct>): CatalogProduct {
  return {
    id: String(product.id || ""),
    name: String(product.name || ""),
    description: product.description ?? null,
    price: String(product.price || "0"),
    compareAtPrice: product.compareAtPrice ?? null,
    image: product.image ?? null,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category ?? null,
    categoryId: typeof product.categoryId === 'number' ? product.categoryId : undefined,
    brand: product.brand ?? undefined,
    brandId: typeof product.brandId === 'number' ? product.brandId : undefined,
    sku: product.sku ?? undefined,
    isHot: Boolean(product.isHot),
    isNew: Boolean(product.isNew),
    isBestSeller: Boolean(product.isBestSeller),
    isShared: Boolean(product.isShared),
    purchaseLimit: product.purchaseLimit ?? null,
    purchaseWarning: product.purchaseWarning ?? null,
    visibilityLevel: Number(product.visibilityLevel ?? -1),
    stock: Number(product.stock ?? 0),
    sold: Number(product.sold ?? 0),
    rating: Number(product.rating ?? 0),
    reviewCount: Number(product.reviewCount ?? 0),
    usageGuide: product.usageGuide ?? null,
    bundledGifts: product.bundledGifts ?? null,
    discountPercent: typeof product.discountPercent === 'number' ? product.discountPercent : undefined,
  }
}

function normalizeProductsResponse(payload: unknown, fallback: CatalogSearchParams = {}): CatalogProductsResponse {
  if (Array.isArray(payload)) {
    return {
      items: payload.map((item) => normalizeProduct(item as CatalogProduct)),
      page: fallback.page ?? 1,
      limit: fallback.limit ?? (payload.length || 20),
      total: payload.length,
    }
  }

  const value = (payload ?? {}) as Partial<CatalogProductsResponse> & { items?: CatalogProduct[] }
  const items = Array.isArray(value.items) ? value.items.map((item) => normalizeProduct(item)) : []

  return {
    items,
    page: Number(value.page ?? fallback.page ?? 1),
    limit: Number(value.limit ?? fallback.limit ?? 20),
    total: Number(value.total ?? items.length),
  }
}

export async function getActiveProducts(options: CatalogSearchParams = {}) {
  const payload = await apiFetch<unknown>(
    withQuery("/api/catalog/products", {
      q: options.q,
      category: options.category,
      page: options.page,
      limit: options.limit,
      sort: options.sort,
    }),
  )

  return normalizeProductsResponse(payload, options)
}

export async function getProduct(id: string): Promise<CatalogProductViewState> {
  const payload = await apiFetch<unknown>(`/api/catalog/products/${encodeURIComponent(id)}`)
  const value = (payload ?? {}) as { product?: CatalogProductDetail; requiredLevel?: number | null }

  if ("product" in value) {
    return {
      product: value.product ? normalizeProduct(value.product) : null,
      requiredLevel: value.requiredLevel ?? null,
    }
  }

  return {
    product: normalizeProduct(value as CatalogProductDetail),
    requiredLevel: null,
  }
}

export async function searchProducts(options: CatalogSearchParams = {}) {
  const payload = await apiFetch<unknown>(
    withQuery("/api/catalog/search", {
      q: options.q,
      category: options.category,
      page: options.page,
      limit: options.limit,
      sort: options.sort,
    }),
  )

  return normalizeProductsResponse(payload, options)
}

export async function getCategories() {
  const payload = await apiFetch<unknown>("/api/catalog/categories")
  const value = payload as { items?: CatalogCategory[] } | CatalogCategory[]
  const items = Array.isArray(value)
    ? value
    : Array.isArray(value?.items)
      ? value.items
      : []

  return items.map((item) => ({
    id: item.id,
    name: String(item.name || ""),
    slug: item.slug ?? undefined,
    icon: item.icon ?? null,
    sortOrder: Number(item.sortOrder ?? 0),
    parentId: item.parentId ?? null,
    productCount: item.productCount ?? undefined,
  }))
}

export async function getCategoryTree() {
  const items = await getCategories()
  // Can be extended to build actual tree if frontend needs nested structure
  return items
}

export async function getPublicSettings() {
  return apiFetch<CatalogSettings>("/api/catalog/settings")
}

export async function getAnnouncement() {
  const payload = await apiFetch<unknown>("/api/catalog/announcement")
  if (typeof payload === "string") {
    return payload
  }

  const value = payload as { content?: string | null }
  return value.content ?? null
}
