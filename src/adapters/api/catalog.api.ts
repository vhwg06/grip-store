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
  const raw = product as any
  return {
    id: String(product.id || ""),
    name: String(product.name || raw.title || ""),
    description: product.description ?? null,
    price: String(product.price !== undefined ? product.price : "0"),
    compareAtPrice: product.compareAtPrice !== undefined 
      ? product.compareAtPrice 
      : (raw.compare_price !== undefined ? String(raw.compare_price) : null),
    image: product.image ?? raw.image_url ?? null,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category ?? null,
    categoryId: typeof product.categoryId === 'number' 
      ? product.categoryId 
      : (typeof raw.category_id === 'number' ? raw.category_id : undefined),
    brand: product.brand ?? undefined,
    brandId: typeof product.brandId === 'number' 
      ? product.brandId 
      : (typeof raw.brand_id === 'number' ? raw.brand_id : undefined),
    sku: product.sku ?? undefined,
    isHot: Boolean(product.isHot),
    isNew: Boolean(product.isNew),
    isBestSeller: Boolean(product.isBestSeller),
    isShared: Boolean(product.isShared),
    purchaseLimit: product.purchaseLimit ?? null,
    purchaseWarning: product.purchaseWarning ?? null,
    visibilityLevel: Number(product.visibilityLevel ?? -1),
    stock: Number(product.stock !== undefined ? product.stock : (raw.stock_count !== undefined ? raw.stock_count : 0)),
    sold: Number(product.sold !== undefined ? product.sold : (raw.sold_count !== undefined ? raw.sold_count : 0)),
    rating: Number(product.rating ?? 0),
    reviewCount: Number(product.reviewCount ?? 0),
    usageGuide: product.usageGuide ?? null,
    bundledGifts: product.bundledGifts ?? null,
    discountPercent: typeof product.discountPercent === 'number' ? product.discountPercent : undefined,
  }
}

function normalizeProductsResponse(payload: unknown, fallback: CatalogSearchParams = {}): CatalogProductsResponse {
  const value = (payload ?? {}) as any
  
  // Unwrap Go backend response envelope {"data": [...], "meta": ...} or use array fallback
  const rawItems = Array.isArray(value) 
    ? value 
    : (Array.isArray(value.data) ? value.data : (Array.isArray(value.items) ? value.items : []))
    
  const items = rawItems.map((item: any) => normalizeProduct(item))

  return {
    items,
    page: Number(value.page ?? value.meta?.page ?? fallback.page ?? 1),
    limit: Number(value.limit ?? value.meta?.limit ?? fallback.limit ?? 20),
    total: Number(value.total ?? value.meta?.total ?? items.length),
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
  const value = (payload ?? {}) as any

  // Unwrap Go backend success envelope {"data": { ...product... }} or use fallback
  const rawProduct = value.data !== undefined ? value.data : (value.product !== undefined ? value.product : value)

  return {
    product: rawProduct ? normalizeProduct(rawProduct) : null,
    requiredLevel: value.requiredLevel ?? null,
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
  const value = payload as any
  const items = Array.isArray(value)
    ? value
    : (Array.isArray(value?.data)
      ? value.data
      : (Array.isArray(value?.items)
        ? value.items
        : []))

  return items.map((item: any) => ({
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
