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
  AdminContentPage,
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
  const raw = (payload ?? {}) as Record<string, any>
  const value = raw.data ? raw.data : raw
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

function normalizeLinkedAdminArticle(raw: any): AdminArticle | null {
  if (!raw) return null
  return normalizeAdminArticle(raw)
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
    targetPage: raw?.targetPage ?? raw?.page ?? raw?.target_page ?? null,
    sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 0),
    isActive: Boolean(raw?.isActive ?? raw?.is_active),
  }
}

function normalizeAdminContentPage(raw: any): AdminContentPage {
  return {
    title: String(raw?.title ?? ""),
    slug: String(raw?.slug ?? "about"),
    body: String(raw?.body ?? ""),
    gallery: Array.isArray(raw?.gallery) ? raw.gallery.filter((item: unknown) => typeof item === "string") : [],
    templateKey: String(raw?.templateKey ?? raw?.template_key ?? "about-us"),
    status: String(raw?.status ?? "published"),
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

function putJson(path: string, body?: unknown) {
  return apiFetch<unknown>(path, {
    method: "PUT",
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
  const [response, rawSettingsList] = await Promise.all([
    apiFetch<{ data: any }>("/api/admin/store-settings"),
    apiFetch<any>("/api/admin/settings").catch(() => [])
  ])
  const data = response.data || response
  const settingsList = Array.isArray(rawSettingsList?.data) ? rawSettingsList.data : (Array.isArray(rawSettingsList) ? rawSettingsList : [])
  const aboutArticleIdSetting = settingsList.find((s: any) => s.key === "about_article_id")
  const aboutArticleId = aboutArticleIdSetting ? aboutArticleIdSetting.value : ""

  const config = data.config || {}
  const brand = config.brand || {}
  const contact = config.contact || {}
  const homepage = config.homepage || {}
  const footer = config.footer || {}
  const visibility = config.visibility || {}
  const registry = config.registry || {}
  const floatingSupport = config.floatingSupport || []
  const bannerPresence = config.bannerPresence || {}
  const aboutPresence = config.aboutPresence || {}

  // Map camelCase backend config to snake_case keys used by frontend pages
  const settingsMap: Record<string, string> = {
    "shop_name": brand.shopName || "",
    "shop_description": brand.shopDescription || "",
    "shop_logo": brand.shopLogo || "",
    "theme_color": brand.themeColor || "purple",

    "contact_address": contact.stickyBarAddress || "",
    "contact_hotline": contact.stickyBarHotline || "",
    "contact_email": contact.contactEmail || "",

    "homepage_blocks": Array.isArray(homepage.blocks)
      ? homepage.blocks.map((b: any) => b.key === "latest_news" ? "latest-news" : (b.key === "featured_products" ? "products" : b.key)).join(",")
      : "hero,categories,latest-news",
    "homepage_news_count": String(homepage.newsCount ?? 6),

    "shop_footer": JSON.stringify(footer.columns || []),
    "social_links": JSON.stringify({
      ...footer.socialLinks,
      copyright: footer.copyright || "",
      zalo: (floatingSupport.find((a: any) => a.key === "zalo" && a.enabled)?.target) || "",
      messenger: (floatingSupport.find((a: any) => a.key === "messenger" && a.enabled)?.target) || "",
      hotlineCall: (floatingSupport.find((a: any) => a.key === "hotline" && a.enabled)?.target) || "",
      scrollToTop: String(Boolean(floatingSupport.find((a: any) => a.key === "scroll_to_top")?.enabled))
    }),

    "noindex_enabled": String(Boolean(visibility.noIndexEnabled)),

    "wishlist_enabled": String(Boolean(visibility.wishlistEnabled)),

    "registry_opt_in": String(Boolean(registry.joined)),
    "registry_hide_nav": String(Boolean(registry.hideNav)),
    "banner_presence_enabled": String(Boolean(bannerPresence.enabled)),
    "about_presence_enabled": String(Boolean(aboutPresence.enabled)),
    "about_article_id": aboutArticleId,
  }

  return {
    stats: data.stats || {
      today: { count: 0, revenue: 0 },
      week: { count: 0, revenue: 0 },
      month: { count: 0, revenue: 0 },
      total: { count: 0, revenue: 0 }
    },
    settingsMap,
    visitorCount: Number(data.visitorCount ?? 0),
    registryEnabled: Boolean(registry.enabled),
    bannerPresenceEnabled: Boolean(bannerPresence.enabled),
    aboutPresenceEnabled: Boolean(aboutPresence.enabled),
    bannerPresencePresent: Boolean(bannerPresence.present),
    aboutPresencePresent: Boolean(aboutPresence.present),
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
      ? (isNaN(Number(item.categoryId)) ? item.categoryId : Number(item.categoryId))
      : (item?.category_id != null ? (isNaN(Number(item.category_id)) ? item.category_id : Number(item.category_id)) : null),
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
  const raw = await apiFetch<{ product?: any; categories: any[] }>(path)
  const p = raw?.product
  const normalizedProduct = p
    ? {
        id: String(p.id ?? ""),
        name: String(p.title ?? p.name ?? ""),
        description: p.description ?? null,
        price: String(p.price ?? "0"),
        compareAtPrice: p.compare_price != null
          ? String(p.compare_price)
          : (p.compareAtPrice != null ? String(p.compareAtPrice) : null),
        image: p.image_url ?? p.image ?? null,
        images: Array.isArray(p.images) ? p.images : [],
        categoryId: p.category_id ?? p.categoryId ?? null,
        category: p.category ?? null,
        brandId: p.brand_id != null
          ? Number(p.brand_id)
          : (p.brandId != null ? Number(p.brandId) : null),
        sku: p.sku ?? null,
        isHot: Boolean(p.is_hot ?? p.isHot),
        isShared: Boolean(p.is_shared ?? p.isShared),
        isActive: Boolean(p.is_active ?? p.isActive),
        purchaseLimit: p.purchase_limit != null
          ? Number(p.purchase_limit)
          : (p.purchaseLimit != null ? Number(p.purchaseLimit) : null),
        purchaseWarning: p.purchase_warning ?? p.purchaseWarning ?? null,
        visibilityLevel: Number(p.visibility_level ?? p.visibilityLevel ?? -1),
        stock: Number(p.stock_count ?? p.stock ?? 0),
        sold: Number(p.sold_count ?? p.sold ?? 0),
        usageGuide: p.usageGuide ?? p.usage_guide ?? null,
        bundledGifts: p.bundledGifts ?? p.bundled_gifts ?? null,
        introArticleId: p.intro_article_id ?? p.introArticleId ?? null,
        introArticle: normalizeLinkedAdminArticle(p.intro_article ?? p.introArticle),
        sortOrder: Number(p.sort_order ?? p.sortOrder ?? 0),
        specs: Array.isArray(p.specs) ? p.specs : [],
      }
    : undefined
  const normalizedCategories = (raw?.categories ?? []).map((c: any) => ({
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? "",
    icon: c.icon ?? null,
    sortOrder: Number(c.sort_order ?? c.sortOrder ?? 0),
    parentId: c.parent_id ?? c.parentId ?? null,
    isActive: Boolean(c.is_active ?? c.isActive ?? true),
  }))
  return { product: normalizedProduct, categories: normalizedCategories }
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const payload = await apiFetch<any>("/api/admin/categories")
  const raw = payload?.data || payload
  const list = Array.isArray(raw) ? raw : raw.categories ?? []
  return list.map((c: any) => ({
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? "",
    icon: c.icon ?? null,
    sortOrder: Number(c.sort_order ?? c.sortOrder ?? 0),
    parentId: c.parent_id ?? c.parentId ?? null,
    isActive: Boolean(c.is_active ?? c.isActive ?? true),
  }))
}

export async function getAdminUsers(params: { page?: number; q?: string; pageSize?: number; role?: string }) {
  const payload = await apiFetch<unknown>(`/api/admin/users${qs(params)}`)
  const raw = (payload ?? {}) as Record<string, any>
  const value = raw.data || raw
  const rawItems = Array.isArray(value)
    ? value
    : (Array.isArray(value.items) ? value.items : (Array.isArray(value.users) ? value.users : []))

  const items = rawItems.map((item: any) => ({
    userId: String(item.userId ?? item.user_id ?? item.id ?? ""),
    username: (item.username ?? item.user_name ?? null) as string | null,
    lastLoginAt: (item.lastLoginAt ?? item.last_login_at ?? null) as string | null,
    createdAt: (item.createdAt ?? item.created_at ?? null) as string | null,
    orderCount: Number(item.orderCount ?? item.order_count ?? 0),
    isBlocked: Boolean(item.isBlocked ?? item.is_blocked),
    customerId: (item.customerId ?? item.customer_id ?? null) as string | null,
    email: (item.email ?? null) as string | null,
    refundCount: Number(item.refundCount ?? item.refund_count ?? 0),
    reviewCount: Number(item.reviewCount ?? item.review_count ?? 0),
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

export async function getAdminRefunds(status: "pending" | "approved" | "all" = "all") {
  const payload = await apiFetch<any>(`/api/admin/refunds${qs({ status })}`)
  const raw = payload?.data || payload
  return Array.isArray(raw) ? raw : raw.requests ?? []
}

export async function getAdminRefundDetail(id: number | string) {
  const payload = await apiFetch<any>(`/api/admin/refunds/${encodeURIComponent(String(id))}`)
  return payload?.data || payload
}

export async function getAdminReviews() {
  const payload = await apiFetch<any>("/api/admin/reviews")
  const raw = payload?.data || payload
  if (Array.isArray(raw)) {
    return {
      reviews: raw,
      stats: { pending: 0, featured: 0, hidden: 0 }
    }
  }
  return {
    reviews: raw?.reviews ?? [],
    stats: raw?.stats ?? { pending: 0, featured: 0, hidden: 0 }
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
  const payload = await apiFetch<any>("/api/admin/messages")
  const raw = payload?.data || payload
  const history = Array.isArray(raw) ? raw : (Array.isArray(raw?.history) ? raw.history : [])
  return {
    history: history.map((item: any) => ({
      id: String(item.id || ""),
      title: String(item.title || item.subject || ""),
      audience: item.targetType === "all" ? "All registered users" : `User: ${item.targetValue}`,
      status: item.status === "sent" ? "Sent" : (item.status === "scheduled" ? "Scheduled" : "Draft"),
      dateTime: item.sentAt ? new Date(item.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : "Not scheduled",
      sentCount: item.targetType === "all" ? "1,500+" : "1",
    })),
    inbox: [],
  }
}


export async function getAdminData() {
  return apiFetch<{ shopName: string | null }>("/api/admin/data")
}

export async function getAdminCollect(): Promise<AdminCollectPayload> {
  const payload = await apiFetch<any>("/api/admin/collect")
  const data = payload?.data || payload
  return {
    payLink: data?.payLink || "",
    payee: data?.payee || "",
    sources: Array.isArray(data?.sources) ? data.sources : [],
    ready: Boolean(data?.ready ?? data?.is_ready),
    warnings: Array.isArray(data?.warnings) ? data.warnings.map((value: unknown) => String(value)) : [],
  }
}

export async function saveAdminCollect(payLink: string, payee: string): Promise<AdminActionResult> {
  const payload = await apiFetch<unknown>("/api/admin/collect", {
    method: "PUT",
    body: JSON.stringify({ payLink, payee }),
  })
  return normalizeActionResult(payload)
}

export async function getAdminNotificationSettings() {
  const res = await apiFetch<any>("/api/admin/notifications")
  const data = res?.data || res
  const source = data?.settings || data || {}
  return {
    settings: {
      telegramBotToken: source.telegramBotToken || "",
      telegramChatId: source.telegramChatId || "",
      telegramLanguage: source.telegramLanguage || "vi",
      telegramEnabled: !!source.telegramEnabled,
      barkEnabled: !!source.barkEnabled,
      barkServerUrl: source.barkServerUrl || "https://api.day.app",
      barkDeviceKey: source.barkDeviceKey || "",
      resendApiKey: source.resendApiKey || "",
      resendFromEmail: source.resendFromEmail || "",
      resendFromName: source.resendFromName || "",
      resendEnabled: !!source.resendEnabled,
      emailLanguage: source.emailLanguage || "vi",
    },
  }
}


export async function saveProduct(formData: FormData) {
  const id = formData.get("id") as string | null
  if (id && id.trim()) {
    return apiFetch<unknown>(`/api/admin/products/${encodeURIComponent(id.trim())}`, {
      method: "PATCH",
      body: formData,
    }).then(normalizeActionResult)
  }
  return apiFetch<unknown>("/api/admin/products", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function getProductForAdminAction(id: string) {
  const payload = await getAdminProductForm(id)
  return payload.product ?? null
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

export async function updateProductIntroArticle(id: string, introArticleId: string | null) {
  return patchJson(`/api/admin/products/${encodeURIComponent(id)}`, {
    introArticleId,
  })
}


export async function markOrderPaid(orderId: string) {
  return patchJson(`/api/admin/orders/${encodeURIComponent(orderId)}`, { status: "paid" })
}

export async function markOrderDelivered(orderId: string) {
  return patchJson(`/api/admin/orders/${encodeURIComponent(orderId)}`, { status: "delivered" })
}

export async function cancelOrder(orderId: string) {
  return patchJson(`/api/admin/orders/${encodeURIComponent(orderId)}`, { status: "cancelled" })
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
  return postJson(`/api/admin/refunds/${encodeURIComponent(String(requestId))}/approve`, { note: adminNote, adminNote })
}

export async function adminRejectRefund(requestId: number, adminNote?: string) {
  return postJson(`/api/admin/refunds/${encodeURIComponent(String(requestId))}/reject`, { note: adminNote, adminNote })
}

export async function getPendingRefundRequestCount() {
  return apiFetch<{ success: boolean; count: number }>("/api/admin/refunds/pending-count")
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
  if (params.targetType === "all") {
    return postJson("/api/admin/messages/broadcast", {
      title: params.title,
      body: params.body,
    })
  } else {
    return postJson("/api/admin/messages/targeted", {
      userId: params.targetValue || "",
      title: params.title,
      body: params.body,
    })
  }
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
  return putJson(`/api/admin/settings/${encodeURIComponent(key)}`, { value })
}

export async function saveBrandSettings(brand: { shopName: string; shopDescription: string; shopLogo: string; themeColor: string }) {
  return apiFetch<unknown>("/api/admin/store-settings/brand", {
    method: "PUT",
    body: JSON.stringify(brand),
  }).then(normalizeActionResult)
}

export async function saveContactSettings(contact: { stickyBarAddress: string; stickyBarHotline: string; contactEmail: string }) {
  return apiFetch<unknown>("/api/admin/store-settings/contact", {
    method: "PUT",
    body: JSON.stringify(contact),
  }).then(normalizeActionResult)
}

export async function saveHomepageSettings(homepage: { blocks: Array<{ key: string; enabled: boolean; order: number }>; newsCount: number }) {
  return apiFetch<unknown>("/api/admin/store-settings/homepage", {
    method: "PUT",
    body: JSON.stringify(homepage),
  }).then(normalizeActionResult)
}

export async function saveFooterSettings(footer: { columns: any[]; copyright: string; socialLinks: Record<string, string> }) {
  return apiFetch<unknown>("/api/admin/store-settings/footer", {
    method: "PUT",
    body: JSON.stringify(footer),
  }).then(normalizeActionResult)
}

export async function saveFloatingSupportSettings(actions: Array<{ key: string; enabled: boolean; target: string | null }>) {
  return apiFetch<unknown>("/api/admin/store-settings/floating-support", {
    method: "PUT",
    body: JSON.stringify({ actions }),
  }).then(normalizeActionResult)
}

export async function savePresenceSettings(presence: {
  bannerPresence: { enabled: boolean; present: boolean }
  aboutPresence: { enabled: boolean; present: boolean }
}) {
  return apiFetch<unknown>("/api/admin/store-settings/presence", {
    method: "PUT",
    body: JSON.stringify(presence),
  }).then(normalizeActionResult)
}

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

export const testNotification = () => postJson("/api/admin/notifications/test", { channel: "telegram" })
export const testBarkNotification = () => postJson("/api/admin/notifications/test", { channel: "bark" })
export const testEmailNotification = (to: string) => postJson("/api/admin/notifications/test", { channel: "email", to })

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

export async function getAdminArticles(): Promise<AdminArticle[]> {
  const payload = await apiFetch<any>("/api/content/articles")
  const raw = payload?.data || payload
  const items = Array.isArray(raw) ? raw : raw.articles ?? []
  return items.map(normalizeAdminArticle)
}

export async function getAdminArticle(id: string) {
  const listPayload = await apiFetch<any>("/api/content/articles")
  const listRaw = listPayload?.data || listPayload
  const items: any[] = Array.isArray(listRaw)
    ? listRaw
    : Array.isArray(listRaw?.articles)
      ? listRaw.articles
      : Array.isArray(listRaw?.items)
        ? listRaw.items
        : []

  const matched = items.find((item) => String(item?.id ?? "") === String(id))
  if (matched) {
    if (matched?.content || matched?.body) {
      return normalizeAdminArticle(matched)
    }

    if (matched?.slug) {
      const bySlugPayload = await apiFetch<any>(`/api/public/content/articles/${encodeURIComponent(String(matched.slug))}`)
      const bySlugRaw = bySlugPayload?.data || bySlugPayload
      return normalizeAdminArticle(bySlugRaw)
    }
  }

  const payload = await apiFetch<any>(`/api/public/content/articles/${encodeURIComponent(id)}`)
  const raw = payload?.data || payload
  return normalizeAdminArticle(raw)
}

export async function saveArticle(formData: FormData) {
  const id = formData.get("id") as string | null
  if (id && id.trim()) {
    return apiFetch<unknown>(`/api/content/articles/${encodeURIComponent(id.trim())}`, {
      method: "PATCH",
      body: formData,
    }).then(normalizeActionResult)
  }
  return apiFetch<unknown>("/api/content/articles", {
    method: "POST",
    body: formData,
  }).then(normalizeActionResult)
}

export async function deleteArticle(id: string) {
  return deleteJson(`/api/content/articles/${encodeURIComponent(id)}`)
}

export async function getAdminBanners() {
  const payload = await apiFetch<any>("/api/admin/banners")
  if (!payload) return []
  const raw = payload.data || payload
  const items: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.banners)
      ? raw.banners
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.banners)
          ? raw.data.banners
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
  const payload = await apiFetch<any>("/api/admin/faqs")
  const raw = payload?.data || payload
  return Array.isArray(raw) ? raw : raw.faqs ?? []
}

export async function saveAdminAboutPage(page: AdminContentPage) {
  const payload = {
    title: page.title,
    slug: page.slug || "about",
    body: page.body,
    gallery: page.gallery,
    template_key: page.templateKey || "about-us",
    status: page.status || "published",
  }

  try {
    return await apiFetch<unknown>("/api/content/pages/about", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then(normalizeActionResult)
  } catch (error: any) {
    const message = String(error?.message || "")
    if (!message.toLowerCase().includes("404")) throw error

    return apiFetch<unknown>("/api/content/pages", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizeActionResult)
  }
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

export async function getAdminLeads(): Promise<AdminLead[]> {
  const payload = await apiFetch<any>("/api/admin/leads")
  const raw = payload?.data || payload
  return Array.isArray(raw) ? raw : raw.leads ?? []
}

export async function updateAdminLead(id: string, updates: Partial<AdminLead>) {
  return patchJson(`/api/admin/leads/${encodeURIComponent(id)}`, updates)
}

export async function getAdminOrderDetails(id: string) {
  return apiFetch<AdminOrderDetails>(`/api/admin/orders/${encodeURIComponent(id)}/details`)
}

export async function updateAdminOrderStatus(id: string, status: string, note?: string) {
  return patchJson(`/api/admin/orders/${encodeURIComponent(id)}`, { status: status.toLowerCase(), note })
}
