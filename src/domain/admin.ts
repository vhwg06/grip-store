export type AdminActionResult = {
  success: boolean
  error?: string
  count?: number
  [key: string]: unknown
}

export type AdminTargetType = "all" | "username" | "userId"

export type AnnouncementConfig = {
  content: string
  startAt?: string | null
  endAt?: string | null
}

export interface AdminProduct {
  id: string
  name: string
  description: string | null
  price: string
  compareAtPrice: string | null
  image: string | null
  images: string[]
  categoryId: string | number | null
  brandId: number | null
  sku: string | null
  isHot: boolean
  isNew: boolean
  isBestSeller: boolean
  isShared: boolean
  purchaseLimit: number | null
  purchaseWarning: string | null
  visibilityLevel: number
  stock: number
  sold: number
  usageGuide: string | null
  bundledGifts: string | null
  isActive?: boolean
  sortOrder?: number
}

export interface AdminProductForm {
  name: string
  description: string | null
  price: string
  compareAtPrice: string | null
  categoryId: string | number | null
  brandId: number | null
  sku: string | null
  isHot: boolean
  isNew: boolean
  isBestSeller: boolean
  isShared: boolean
  purchaseLimit: number | null
  purchaseWarning: string | null
  visibilityLevel: number
  stock: number
  usageGuide: string | null
  bundledGifts: string | null
}

export interface AdminCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  sortOrder: number
  parentId: number | null
  isActive?: boolean
}

export interface AdminCategoryForm {
  name: string
  slug?: string
  icon: string | null
  sortOrder: number
  parentId: number | null
}

export interface AdminArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  author: string | null
  tags: string[]
  publishedAt: string | null
  isActive: boolean
}

export interface AdminArticleForm {
  title: string
  slug?: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  author: string | null
  tags: string
  publishedAt: string | null
  isActive: boolean
}

export interface AdminBanner {
  id: number
  title: string | null
  subtitle: string | null
  image: string
  mobileImage: string | null
  ctaText: string | null
  ctaLink: string | null
  targetPage: string | null
  sortOrder: number
  isActive: boolean
}

export interface AdminBannerForm {
  title: string | null
  subtitle: string | null
  image: string
  mobileImage: string | null
  ctaText: string | null
  ctaLink: string | null
  targetPage: string | null
  sortOrder: number
  isActive: boolean
}

export interface AdminContentPage {
  title: string
  slug: string
  body: string
  gallery: string[]
  templateKey: string
  status: string
}

export interface AdminFAQ {
  id: number
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

export interface AdminFAQForm {
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

export interface AdminDashboardPayload {
  stats: any
  settingsMap: Record<string, string>
  visitorCount: number
  registryEnabled?: boolean
  bannerPresenceEnabled?: boolean
  aboutPresenceEnabled?: boolean
  bannerPresencePresent?: boolean
  aboutPresencePresent?: boolean
}

export interface AdminLead {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'RESOLVED'
  notes: string | null
  createdAt: string
}

export interface AdminOrderDetails {
  id: string
  orderNumber: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  paymentMethod: string
  shippingAddress: string
  customerName: string
  customerPhone: string
  customerEmail: string
  items: {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    sku: string | null
  }[]
  timeline: {
    status: string
    timestamp: string
    note: string | null
  }[]
  createdAt: string
}

export interface AdminProductsPayload {
  products: AdminProduct[]
  lowStockThreshold: number
}

export interface AdminCard {
  id: number
  productId: string
  cardKey: string
  isUsed: boolean
  reservedOrderId: string | null
  reservedAt: string | null
  expiresAt: string | null
  usedAt: string | null
  createdAt: string | null
}

export interface AdminMessagesPayload {
  history: any[]
  inbox: any[]
}

export interface AdminNotificationsSettings {
  telegramBotToken: string
  telegramChatId: string
  telegramLanguage: string
  telegramEnabled: boolean
  barkEnabled: boolean
  barkServerUrl: string
  barkDeviceKey: string
  resendApiKey: string
  resendFromEmail: string
  resendFromName: string
  resendEnabled: boolean
  emailLanguage: string
}

export interface AdminCollectPayload {
  payLink: string
  payee: string | null
  sources?: any[]
}
