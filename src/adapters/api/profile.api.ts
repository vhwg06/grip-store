"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  CheckinResult,
  CheckinStatus,
  ProfileActionResult,
  ProfileNotification,
  ProfileOrderStats,
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
  const payload = await apiFetch<Partial<ProfileView>>("/api/profile")

  return {
    user: {
      id: String(payload.user?.id || ""),
      name: String(payload.user?.name || payload.user?.username || "User"),
      username: payload.user?.username ?? null,
      avatar: payload.user?.avatar ?? null,
      email: payload.user?.email ?? null,
      trustLevel: Number(payload.user?.trustLevel ?? 0),
    },
    points: Number(payload.points ?? 0),
    checkinEnabled: payload.checkinEnabled !== false,
    orderStats: {
      total: Number(payload.orderStats?.total ?? EMPTY_STATS.total),
      pending: Number(payload.orderStats?.pending ?? EMPTY_STATS.pending),
      delivered: Number(payload.orderStats?.delivered ?? EMPTY_STATS.delivered),
    },
    notifications: Array.isArray(payload.notifications)
      ? payload.notifications.map((item) => normalizeNotification(item))
      : [],
    desktopNotificationsEnabled: Boolean(payload.desktopNotificationsEnabled),
  }
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

export async function getUserPoints() {
  const payload = await apiFetch<{ points?: number }>("/api/profile/points")
  return Number(payload.points ?? 0)
}

export async function checkIn(): Promise<CheckinResult> {
  const payload = (await apiFetch<unknown>("/api/profile/checkin", {
    method: "POST",
  })) as Record<string, any>

  return {
    success: payload.success !== false && payload.ok !== false,
    error: payload.error ? String(payload.error) : undefined,
    points: Number(payload.points ?? 0),
    checkedIn: payload.checkedIn ?? true,
    consecutiveDays: payload.consecutiveDays,
  }
}

export async function getCheckinStatus(): Promise<CheckinStatus> {
  const payload = await apiFetch<Partial<CheckinStatus>>("/api/profile/checkin/status")
  return {
    checkedIn: Boolean(payload.checkedIn),
    disabled: Boolean(payload.disabled),
    consecutiveDays: payload.consecutiveDays,
    lastCheckinAt: payload.lastCheckinAt ?? null,
  }
}
