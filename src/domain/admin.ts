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

export interface AdminDashboardPayload {
  stats: any
  settingsMap: Record<string, string>
  visitorCount: number
  registryEnabled?: boolean
}

export interface AdminProductsPayload {
  products: any[]
  lowStockThreshold: number
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
}
