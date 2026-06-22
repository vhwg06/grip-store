"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  ProfileActionResult,
  ProfileNotification,
  ProfileOrderStats,
  ProfileSecurityView,
  ProfileSessionView,
  ProfileView,
} from "@/domain/profile"

const EMPTY_STATS: ProfileOrderStats = {
  total: 0,
  pending: 0,
  delivered: 0,
}

function normalizeNotification(item: Partial<ProfileNotification>): ProfileNotification {
  return {
    id: Number(item.id ?? 0),
    type: String(item.type || ""),
    titleKey: String(item.titleKey || ""),
    contentKey: String(item.contentKey || ""),
    data: item.data ?? null,
    isRead: item.isRead ?? false,
    createdAt: item.createdAt ?? null,
  }
}

function normalizeActionResult(payload: unknown): ProfileActionResult {
  const value = (payload ?? {}) as Record<string, any>
  return {
    success: value.success !== false && value.ok !== false,
    error: value.error ? String(value.error) : undefined,
  }
}

export async function getProfile(): Promise<ProfileView> {
  const payload = await apiFetch<Record<string, any>>("/api/profile")
  const data = payload?.data ?? payload
  const rawUser = data?.user ?? data

  return {
    user: {
      id: String(rawUser?.id || ""),
      name: String(rawUser?.display_name || rawUser?.name || rawUser?.username || "User"),
      username: rawUser?.username ?? null,
      avatar: rawUser?.avatar ?? null,
      email: rawUser?.email ?? null,
      displayName: rawUser?.display_name ?? rawUser?.displayName ?? rawUser?.name ?? null,
      role: rawUser?.role ?? null,
      isAdmin: Boolean(rawUser?.is_admin ?? rawUser?.isAdmin),
      lastLoginAt: rawUser?.last_login_at ?? rawUser?.lastLoginAt ?? null,
      trustLevel: Number(rawUser?.trust_level ?? rawUser?.trustLevel ?? 0),
    },
    orderStats: {
      total: Number(data?.orderStats?.total ?? EMPTY_STATS.total),
      pending: Number(data?.orderStats?.pending ?? EMPTY_STATS.pending),
      delivered: Number(data?.orderStats?.delivered ?? EMPTY_STATS.delivered),
    },
    notifications: Array.isArray(data?.notifications)
      ? data.notifications.map((item: Partial<ProfileNotification>) => normalizeNotification(item))
      : [],
    desktopNotificationsEnabled: Boolean(
      data?.desktopNotificationsEnabled ??
      rawUser?.desktop_notifications_enabled ??
      rawUser?.desktopNotificationsEnabled,
    ),
  }
}

export async function getProfileSecurity(): Promise<ProfileSecurityView> {
  const payload = await apiFetch<Record<string, any>>("/api/profile/security")
  const data = payload?.data ?? payload
  return {
    passwordLastChangedAt: data?.password_last_changed_at ?? data?.passwordLastChangedAt ?? null,
    twoFactorEnabled: Boolean(data?.two_factor_enabled ?? data?.twoFactorEnabled),
    backupEmail: data?.backup_email ?? data?.backupEmail ?? null,
  }
}

export async function getProfileSessions(): Promise<ProfileSessionView[]> {
  const payload = await apiFetch<any>("/api/profile/sessions")
  const rows: any[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.sessions)
      ? payload.sessions
      : Array.isArray(payload)
        ? payload
        : []

  return rows.map((row: any) => ({
    device: String(row?.device ?? ""),
    location: String(row?.location ?? ""),
    lastSeenAt: row?.last_seen_at ?? row?.lastSeenAt ?? null,
    current: Boolean(row?.current),
  }))
}

export async function updateProfile(email: string, displayName: string, desktopNotificationsEnabled: boolean): Promise<ProfileActionResult> {
  const payload = await apiFetch<unknown>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({ email, displayName, desktopNotificationsEnabled }),
  })
  return normalizeActionResult(payload)
}

export async function updateProfileEmail(email: string): Promise<ProfileActionResult> {
  return updateProfile(email, "", false)
}

export async function updateDesktopNotifications(enabled: boolean): Promise<ProfileActionResult> {
  return updateProfile("test_admin@example.com", "", enabled)
}
