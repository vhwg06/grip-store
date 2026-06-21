import type { User } from "@/domain/auth"

export interface ProfileNotification {
  id: number
  type: string
  titleKey: string
  contentKey: string
  data: string | null
  isRead: boolean | null
  createdAt: number | null
}

export interface ProfileOrderStats {
  total: number
  pending: number
  delivered: number
}

export interface ProfileUser {
  id: string
  name: string
  username: string | null
  avatar: string | null
  email: string | null
  displayName?: string | null
  role?: string | null
  isAdmin?: boolean
  lastLoginAt?: string | null
  trustLevel?: number
}

export interface ProfileView {
  user: ProfileUser
  points: number
  checkinEnabled: boolean
  orderStats: ProfileOrderStats
  notifications: ProfileNotification[]
  desktopNotificationsEnabled: boolean
}

export interface ProfileSecurityView {
  passwordLastChangedAt: string | null
  twoFactorEnabled: boolean
  backupEmail: string | null
}

export interface ProfileSessionView {
  device: string
  location: string
  lastSeenAt: string | null
  current: boolean
}

export interface ProfileActionResult {
  success: boolean
  error?: string
}

export interface CheckinStatus {
  checkedIn: boolean
  disabled?: boolean
  consecutiveDays?: number
  lastCheckinAt?: number | null
}

export interface CheckinResult extends ProfileActionResult {
  points?: number
  checkedIn?: boolean
  consecutiveDays?: number
}

export function profileFromUser(user: User): ProfileUser {
  return {
    id: user.id,
    name: user.username || user.email || "User",
    username: user.username,
    avatar: user.avatar_url,
    email: user.email,
    trustLevel: user.trustLevel,
  }
}
