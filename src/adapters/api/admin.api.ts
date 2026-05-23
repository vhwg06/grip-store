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
  const payload = await apiFetch<Partial<AdminProductsPayload>>("/api/admin/products")
  return {
    products: Array.isArray(payload.products) ? payload.products : [],
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
  return apiFetch<any>(`/api/admin/users${qs(params)}`)
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
  const payload = await apiFetch<{ reviews?: any[] } | any[]>("/api/admin/reviews")
  return Array.isArray(payload) ? payload : payload.reviews ?? []
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
  return Array.isArray(payload) ? payload : payload.articles ?? []
}

export async function getAdminArticle(id: string) {
  return apiFetch<AdminArticle>(`/api/admin/articles/${encodeURIComponent(id)}`)
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
  const payload = await apiFetch<{ banners?: AdminBanner[] } | AdminBanner[]>("/api/admin/banners")
  return Array.isArray(payload) ? payload : payload.banners ?? []
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
