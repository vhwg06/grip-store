"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  AdminActionResult,
  AdminDashboardPayload,
  AdminCollectPayload,
  AdminMessagesPayload,
  AdminNotificationsSettings,
  AdminProductsPayload,
  AdminTargetType,
  AnnouncementConfig,
  AdminProduct,
  AdminProductForm,
  AdminCategory,
  AdminArticle,
  AdminBanner,
  AdminFAQ,
  AdminLead,
  AdminOrderDetails
} from "@/domain/admin"

function qs(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ""
}

function normalizeActionResult(payload: unknown): AdminActionResult {
  const value = (payload ?? {}) as Record<string, any>
  return {
    ...value,
    success: value.success !== false && value.ok !== false,
    error: value.error ? String(value.error) : undefined,
  }
}

function firstString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value !== "string") continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ""
}

function normalizeAdminArticle(raw: any): AdminArticle {
  return {
    id: String(raw?.id ?? ""),
    title: String(raw?.title ?? ""),
    slug: String(raw?.slug ?? ""),
    excerpt: raw?.excerpt ?? null,
    content: String(raw?.content ?? raw?.body ?? ""),
    featuredImage: firstString(raw?.featuredImage, raw?.featured_image, raw?.imageUrl, raw?.image_url, raw?.image) || null,
    author: raw?.author ?? raw?.author_id ?? null,
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    publishedAt: raw?.publishedAt ?? raw?.published_at ?? null,
    isActive: Boolean(raw?.isActive ?? raw?.is_active),
  }
}

function normalizeAdminBanner(raw: any): AdminBanner {
  return {
    id: Number(raw?.id ?? 0),
    title: raw?.title ?? null,
    subtitle: raw?.subtitle ?? null,
    image: firstString(raw?.image, raw?.imageUrl, raw?.image_url, raw?.url),
    mobileImage: firstString(raw?.mobileImage, raw?.mobileImageUrl, raw?.mobile_image, raw?.mobile_image_url) || null,
    ctaText: raw?.ctaText ?? raw?.cta_text ?? null,
    ctaLink: raw?.ctaLink ?? raw?.cta_url ?? null,
    sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 0),
    isActive: Boolean(raw?.isActive ?? raw?.is_active),
  }
}

function postJson(path: string, body?: unknown) {
  return apiFetch<unknown>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(normalizeActionResult)
}

function patchJson(path: string, body?: unknown) {
  return apiFetch<unknown>(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(normalizeActionResult)
}

function deleteJson(path: string, body?: unknown) {
  return apiFetch<unknown>(path, {
    method: "DELETE",
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(normalizeActionResult)
}

export async function checkAdmin() {
  return apiFetch<{ success: boolean }>("/api/admin/me")
}

export async function getAdminDashboard(): Promise<AdminDashboardPayload> {
  const payload = await apiFetch<Partial<AdminDashboardPayload>>("/api/admin/dashboard")
  return {
    stats: payload.stats ?? {},
    settingsMap: payload.settingsMap ?? {},
    visitorCount: Number(payload.visitorCount ?? 0),
    registryEnabled: Boolean(payload.registryEnabled),
  }
}

export async function getAdminProducts(): Promise<AdminProductsPayload> {
  const payload = await apiFetch<any>("/api/admin/products")
  const rawItems = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.products)
      ? payload.products
      : (Array.isArray(payload?.data)
        ? payload.data
        : (Array.isArray(payload?.items) ? payload.items : [])))

  const products: AdminProduct[] = rawItems.map((item: any) => ({
    id: String(item?.id ?? ""),
    name: String(item?.name ?? item?.title ?? ""),
    description: item?.description ?? null,
    price: String(item?.price ?? "0"),
    compareAtPrice: item?.compareAtPrice != null
      ? String(item.compareAtPrice)
      : (item?.compare_price != null ? String(item.compare_price) : null),
    image: item?.image ?? item?.image_url ?? null,
    images: Array.isArray(item?.images) ? item.images : [],
    categoryId: item?.categoryId != null
      ? Number(item.categoryId)
      : (item?.category_id != null ? Number(item.category_id) : null),
    brandId: item?.brandId != null ? Number(item.brandId) : null,
    sku: item?.sku ?? null,
    isHot: Boolean(item?.isHot ?? item?.is_hot),
    isNew: Boolean(item?.isNew),
    isBestSeller: Boolean(item?.isBestSeller),
    isShared: Boolean(item?.isShared ?? item?.is_shared),
    purchaseLimit: item?.purchaseLimit != null
      ? Number(item.purchaseLimit)
      : (item?.purchase_limit != null ? Number(item.purchase_limit) : null),
    purchaseWarning: item?.purchaseWarning ?? item?.purchase_warning ?? null,
    visibilityLevel: Number(item?.visibilityLevel ?? item?.visibility_level ?? -1),
    stock: Number(item?.stock ?? item?.stock_count ?? 0),
    sold: Number(item?.sold ?? item?.sold_count ?? 0),
    usageGuide: item?.usageGuide ?? null,
    bundledGifts: item?.bundledGifts ?? null,
    isActive: Boolean(item?.isActive ?? item?.is_active),
    sortOrder: Number(item?.sortOrder ?? item?.sort_order ?? 0),
  }))

  return {
    products,
    lowStockThreshold: Number(payload.lowStockThreshold ?? 5),
  }
}

export async function getAdminProduct(id: string) {
  return apiFetch<AdminProduct>(`/api/admin/products/${encodeURIComponent(id)}`)
}

export async function getAdminProductForm(id?: string) {
  const path = id
    ? `/api/admin/products/${encodeURIComponent(id)}/form`
    : "/api/admin/products/new"
  return apiFetch<{ product?: AdminProductForm; categories: AdminCategory[] }>(path)
}

export async function getAdminCategories() {
  const payload = await apiFetch<{ categories?: AdminCategory[] } | AdminCategory[]>("/api/admin/categories")
  return Array.isArray(payload) ? payload : payload.categories ?? []
}

export async function getAdminCards(productId: string) {
  return apiFetch<{ productId: string; productName: string; unusedCards: any[]; apiConfig: any }>(
    `/api/admin/products/${encodeURIComponent(productId)}/cards`,
  )
}

export async function getAdminUsers(params: { page?: number; q?: string; pageSize?: number }) {
  const payload = await apiFetch<unknown>(`/api/admin/users${qs(params)}`)
  const value = (payload ?? {}) as Record<string, any>
  const rawItems = Array.isArray(value)
    ? value
    : (Array.isArray(value.items) ? value.items : (Array.isArray(value.users) ? value.users : []))

  const items = rawItems.map((item) => ({
    userId: String(item.userId ?? item.user_id ?? ""),
    username: (item.username ?? item.user_name ?? null) as string | null,
    points: Number(item.points ?? 0),
    lastLoginAt: (item.lastLoginAt ?? item.last_login_at ?? null) as string | null,
    createdAt: (item.createdAt ?? item.created_at ?? null) as string | null,
    orderCount: Number(item.orderCount ?? item.order_count ?? 0),
    isBlocked: Boolean(item.isBlocked ?? item.is_blocked),
  }))

  return {
    items,
    total: Number(value.total ?? items.length),
    page: Number(value.page ?? params.page ?? 1),
    pageSize: Number(value.pageSize ?? value.page_size ?? params.pageSize ?? 20),
  }
}

export async function getAdminOrders(params: { page?: number; pageSize?: number; q?: string; status?: string }) {
  return apiFetch<{ orders: any[]; total: number; page: number; pageSize: number; query: string; status: string }>(
    `/api/admin/orders${qs(params)}`,
  )
}

export async function getAdminOrder(id: string) {
  return apiFetch<any>(`/api/admin/orders/${encodeURIComponent(id)}`)
}

export async function getAdminRefunds() {
  const payload = await apiFetch<{ requests?: any[] } | any[]>("/api/admin/refunds")
  return Array.isArray(payload) ? payload : payload.requests ?? []
}

export async function getAdminReviews() {
  const payload = await apiFetch<any>("/api/admin/reviews")
  if (Array.isArray(payload)) {
    return {
      reviews: payload,
      stats: { pending: 0, featured: 0, hidden: 0 }
    }
  }
  return {
    reviews: payload?.reviews ?? [],
    stats: payload?.stats ?? { pending: 0, featured: 0, hidden: 0 }
  }
}

export async function approveReview(id: number) {
  return apiFetch<unknown>(`/api/admin/reviews/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({}),
  }).then(normalizeActionResult)
}

export async function hideReview(id: number) {
  return apiFetch<unknown>(`/api/admin/reviews/${id}/hide`, {
    method: "PUT",
    body: JSON.stringify({}),
  }).then(normalizeActionResult)
}

export async function featureReview(id: number, isFeatured: boolean) {
  return apiFetch<unknown>(`/api/admin/reviews/${id}/feature`, {
    method: "PUT",
    body: JSON.stringify({ isFeatured }),
  }).then(normalizeActionResult)
}

export async function bulkPublishReviews(ids: number[]) {
  return apiFetch<unknown>("/api/admin/reviews/publish-selected", {
    method: "POST",
    body: JSON.stringify({ ids }),
  }).then(normalizeActionResult)
}

export async function getAdminMessages(): Promise<AdminMessagesPayload> {
  const payload = await apiFetch<Partial<AdminMessagesPayload>>("/api/admin/messages")
  return {
    history: Array.isArray(payload.history) ? payload.history : [],
    inbox: Array.isArray(payload.inbox) ? payload.inbox : [],
  }
}

export async function getAdminData() {
  return apiFetch<{ shopName: string | null }>("/api/admin/data")
}

export async function getAdminCollect() {
  return apiFetch<AdminCollectPayload>("/api/admin/collect")
}

export async function getAdminNotificationSettings() {
  return apiFetch<{ settings: AdminNotificationsSettings }>("/api/admin/notifications")
}

export async function saveProduct(formData: FormData) {
  return apiFetch<unknown>("/api/admin/products", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function getProductForAdminAction(id: string) {
  return getAdminProduct(id)
}

export async function deleteProduct(id: string) {
  return deleteJson(`/api/admin/products/${encodeURIComponent(id)}`)
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  return patchJson(`/api/admin/products/${encodeURIComponent(id)}/status`, { isActive })
}

export async function reorderProduct(id: string, newOrder: number) {
  return patchJson(`/api/admin/products/${encodeURIComponent(id)}/order`, { sortOrder: newOrder })
}

export async function addCards(formData: FormData) {
  return apiFetch<unknown>("/api/admin/cards", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function deleteCard(cardId: number) {
  return deleteJson(`/api/admin/cards/${encodeURIComponent(String(cardId))}`)
}

export async function deleteCards(cardIds: number[]) {
  return deleteJson("/api/admin/cards", { cardIds })
}

export async function saveCardsApiConfig(productId: string, apiUrl: string, apiToken: string, enabled: boolean) {
  return patchJson(`/api/admin/products/${encodeURIComponent(productId)}/cards/api`, {
    apiUrl,
    apiToken,
    enabled,
  })
}

export async function setCardsApiEnabled(productId: string, enabled: boolean, apiUrl?: string, apiToken?: string) {
  return patchJson(`/api/admin/products/${encodeURIComponent(productId)}/cards/api/enabled`, { enabled, apiUrl, apiToken })
}

export async function pullCardFromApi(productId: string) {
  return postJson(`/api/admin/products/${encodeURIComponent(productId)}/cards/pull`)
}

export async function markOrderPaid(orderId: string) {
  return postJson(`/api/admin/orders/${encodeURIComponent(orderId)}/mark-paid`)
}

export async function markOrderDelivered(orderId: string) {
  return postJson(`/api/admin/orders/${encodeURIComponent(orderId)}/mark-delivered`)
}

export async function cancelOrder(orderId: string) {
  return postJson(`/api/admin/orders/${encodeURIComponent(orderId)}/cancel`)
}

export async function updateOrderEmail(orderId: string, email: string | null) {
  return patchJson(`/api/admin/orders/${encodeURIComponent(orderId)}/email`, { email })
}

export async function deleteOrder(orderId: string) {
  return deleteJson(`/api/admin/orders/${encodeURIComponent(orderId)}`)
}

export async function deleteOrders(orderIds: string[]) {
  return deleteJson("/api/admin/orders", { orderIds })
}

export async function verifyOrderRefundStatus(orderId: string) {
  return apiFetch<AdminActionResult>(`/api/admin/orders/${encodeURIComponent(orderId)}/refund-status`)
}

export async function submitRefundRequest(orderId: string, reason: string) {
  return postJson(`/api/orders/${encodeURIComponent(orderId)}/refund-request`, { reason })
}

export async function markOrderRefunded(orderId: string) {
  return postJson(`/api/admin/orders/${encodeURIComponent(orderId)}/mark-refunded`)
}

export async function proxyRefund(orderId: string) {
  return postJson(`/api/admin/orders/${encodeURIComponent(orderId)}/proxy-refund`)
}

export async function adminApproveRefund(requestId: number, adminNote?: string) {
  return postJson(`/api/admin/refunds/${encodeURIComponent(String(requestId))}/approve`, { adminNote })
}

export async function adminRejectRefund(requestId: number, adminNote?: string) {
  return postJson(`/api/admin/refunds/${encodeURIComponent(String(requestId))}/reject`, { adminNote })
}

export async function getPendingRefundRequestCount() {
  return apiFetch<{ success: boolean; count: number }>("/api/admin/refunds/pending-count")
}

export async function saveUserPoints(userId: string, points: number) {
  return patchJson(`/api/admin/users/${encodeURIComponent(userId)}/points`, { points })
}

export async function toggleBlock(userId: string, isBlocked: boolean) {
  return patchJson(`/api/admin/users/${encodeURIComponent(userId)}/block`, { isBlocked })
}

export async function sendAdminMessage(params: {
  targetType: AdminTargetType
  targetValue?: string
  title: string
  body: string
}) {
  return postJson("/api/admin/messages", params)
}

export async function deleteAdminMessage(id: number) {
  return deleteJson(`/api/admin/messages/${encodeURIComponent(String(id))}`)
}

export async function clearAdminMessages() {
  return postJson("/api/admin/messages/clear")
}

export async function repairDataAction() {
  return postJson("/api/admin/data/repair")
}

export async function importData(formData: FormData) {
  return apiFetch<unknown>("/api/admin/data/import", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function dismissRegistryPrompt() {
  return postJson("/api/admin/registry/dismiss")
}

export async function joinRegistry(origin: string) {
  return postJson("/api/admin/registry/join", { origin })
}

export async function leaveRegistry() {
  return postJson("/api/admin/registry/leave")
}

export async function getRegistryStatus() {
  return apiFetch<AdminActionResult>("/api/admin/registry/status")
}

export async function getAnnouncementConfig(): Promise<AnnouncementConfig | null> {
  const payload = await apiFetch<{ announcement?: AnnouncementConfig | null } | AnnouncementConfig | null>(
    "/api/admin/announcement",
  )
  if (!payload) return null
  return "announcement" in payload ? payload.announcement ?? null : payload as AnnouncementConfig
}

export async function saveAnnouncement(config: AnnouncementConfig) {
  return postJson("/api/admin/announcement", config)
}

export async function saveSetting(key: string, value: unknown) {
  return patchJson(`/api/admin/settings/${encodeURIComponent(key)}`, { value })
}

export const saveShopName = (name: string) => saveSetting("shop_name", name)
export const saveShopDescription = (description: string) => saveSetting("shop_description", description)
export const saveShopLogo = (logoUrl: string) => saveSetting("shop_logo", logoUrl)
export const saveShopFooter = (footer: string) => saveSetting("shop_footer", footer)
export const saveThemeColor = (color: string) => saveSetting("theme_color", color)
export const saveLowStockThreshold = (value: string) => saveSetting("low_stock_threshold", value)
export const saveCheckinReward = (value: string) => saveSetting("checkin_reward", value)
export const saveCheckinEnabled = (enabled: boolean) => saveSetting("checkin_enabled", enabled)
export const saveWishlistEnabled = (enabled: boolean) => saveSetting("wishlist_enabled", enabled)
export const saveNoIndex = (enabled: boolean) => saveSetting("noindex_enabled", enabled)
export const saveRefundReclaimCards = (enabled: boolean) => saveSetting("refund_reclaim_cards", enabled)
export const saveRegistryHideNav = (enabled: boolean) => saveSetting("registry_hide_nav", enabled)

export async function saveNotificationSettings(formData: FormData) {
  const payload = await apiFetch<Partial<AdminNotificationsSettings> & AdminActionResult>("/api/admin/notifications", {
    method: "POST",
    body: formData,
  })
  return {
    ...payload,
    ...normalizeActionResult(payload),
  }
}

export const testNotification = () => postJson("/api/admin/notifications/test/telegram")
export const testBarkNotification = () => postJson("/api/admin/notifications/test/bark")
export const testEmailNotification = (to: string) => postJson("/api/admin/notifications/test/email", { to })

export async function saveCategory(formData: FormData) {
  return apiFetch<unknown>("/api/admin/categories", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function deleteCategory(id: number) {
  return deleteJson(`/api/admin/categories/${encodeURIComponent(String(id))}`)
}

export async function deleteReview(reviewId: number) {
  return deleteJson(`/api/admin/reviews/${encodeURIComponent(String(reviewId))}`)
}

export async function getAdminArticles() {
  const payload = await apiFetch<{ articles?: AdminArticle[] } | AdminArticle[]>("/api/admin/articles")
  const items = Array.isArray(payload) ? payload : payload.articles ?? []
  return items.map(normalizeAdminArticle)
}

export async function getAdminArticle(id: string) {
  const payload = await apiFetch<any>(`/api/admin/articles/${encodeURIComponent(id)}`)
  return normalizeAdminArticle(payload)
}

export async function saveArticle(formData: FormData) {
  return apiFetch<unknown>("/api/admin/articles", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function deleteArticle(id: string) {
  return deleteJson(`/api/admin/articles/${encodeURIComponent(id)}`)
}

export async function getAdminBanners() {
  const payload = await apiFetch<any>("/api/admin/banners")
  if (!payload) return []
  const items: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.banners)
      ? payload.banners
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.banners)
          ? payload.data.banners
          : []
  return items.map(normalizeAdminBanner)
}

export async function saveBanner(formData: FormData) {
  return apiFetch<unknown>("/api/admin/banners", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function deleteBanner(id: number) {
  return deleteJson(`/api/admin/banners/${encodeURIComponent(String(id))}`)
}

export async function getAdminFAQs() {
  const payload = await apiFetch<{ faqs?: AdminFAQ[] } | AdminFAQ[]>("/api/admin/faqs")
  return Array.isArray(payload) ? payload : payload.faqs ?? []
}

export async function saveFAQ(formData: FormData) {
  return apiFetch<unknown>("/api/admin/faqs", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function deleteFAQ(id: number) {
  return deleteJson(`/api/admin/faqs/${encodeURIComponent(String(id))}`)
}

export async function getAdminLeads() {
  const payload = await apiFetch<{ leads?: AdminLead[] } | AdminLead[]>("/api/admin/leads")
  return Array.isArray(payload) ? payload : payload.leads ?? []
}

export async function updateAdminLead(id: string, updates: Partial<AdminLead>) {
  return patchJson(`/api/admin/leads/${encodeURIComponent(id)}`, updates)
}

export async function getAdminOrderDetails(id: string) {
  return apiFetch<AdminOrderDetails>(`/api/admin/orders/${encodeURIComponent(id)}/details`)
}

export async function updateAdminOrderStatus(id: string, status: string, note?: string) {
  return patchJson(`/api/admin/orders/${encodeURIComponent(id)}/status`, { status, note })
}
