export interface NotificationItem {
  id: number
  type: string
  titleKey: string
  contentKey: string
  data: string | null
  isRead: boolean | null
  createdAt: number | null
}

export interface NotificationsResponse {
  success: boolean
  items: NotificationItem[]
  error?: string
}

export interface NotificationCountResponse {
  success: boolean
  count: number
  error?: string
}

export interface NotificationActionResult {
  success: boolean
  error?: string
}

export interface SendUserMessageInput {
  title: string
  body: string
}

export interface UserMessageRow {
  id: number
  userId: string
  username: string | null
  title: string
  body: string
  isRead: boolean | null
  createdAt: number | string | null
}
