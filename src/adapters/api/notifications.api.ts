"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  NotificationActionResult,
  NotificationCountResponse,
  NotificationItem,
  NotificationsResponse,
  SendUserMessageInput,
} from "@/domain/notifications"

function normalizeActionResult(payload: unknown): NotificationActionResult {
  const value = (payload ?? {}) as Record<string, any>
  return {
    success: value.success !== false && value.ok !== false,
    error: value.error ? String(value.error) : undefined,
  }
}

function normalizeNotification(item: Partial<NotificationItem>): NotificationItem {
  return {
    id: Number(item.id ?? 0),
    type: String(item.type || ""),
    titleKey: String(item.titleKey || ""),
    contentKey: String(item.contentKey || ""),
    data: item.data ?? null,
    isRead: item.isRead ?? null,
    createdAt: item.createdAt == null ? null : Number(item.createdAt),
  }
}

export async function getMyNotifications(): Promise<NotificationsResponse> {
  const payload = await apiFetch<Partial<NotificationsResponse> | NotificationItem[]>("/api/notifications")
  if (Array.isArray(payload)) {
    return {
      success: true,
      items: payload.map((item) => normalizeNotification(item)),
    }
  }

  return {
    success: payload.success !== false,
    items: Array.isArray(payload.items) ? payload.items.map((item) => normalizeNotification(item)) : [],
    error: payload.error,
  }
}

export async function getUnreadCount(): Promise<NotificationCountResponse> {
  const payload = await apiFetch<Partial<NotificationCountResponse>>("/api/notifications/unread-count")
  return {
    success: payload.success !== false,
    count: Number(payload.count ?? 0),
    error: payload.error,
  }
}

export async function markNotificationRead(id: number): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>(`/api/notifications/${encodeURIComponent(String(id))}/read`, {
    method: "POST",
  })
  return normalizeActionResult(payload)
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>("/api/notifications/read-all", {
    method: "POST",
  })
  return normalizeActionResult(payload)
}

export async function clearMyNotifications(): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>("/api/notifications", {
    method: "DELETE",
  })
  return normalizeActionResult(payload)
}

export async function sendUserMessage(title: string, body: string): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>("/api/messages/user", {
    method: "POST",
    body: JSON.stringify({ title, body } satisfies SendUserMessageInput),
  })
  return normalizeActionResult(payload)
}

export async function getUnreadUserMessageCount(): Promise<NotificationCountResponse> {
  const payload = await apiFetch<Partial<NotificationCountResponse>>("/api/admin/user-messages/unread-count")
  return {
    success: payload.success !== false,
    count: Number(payload.count ?? 0),
    error: payload.error,
  }
}

export async function markUserMessageRead(id: number): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>(`/api/admin/user-messages/${encodeURIComponent(String(id))}/read`, {
    method: "POST",
  })
  return normalizeActionResult(payload)
}

export async function deleteUserMessage(id: number): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>(`/api/admin/user-messages/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  })
  return normalizeActionResult(payload)
}

export async function clearUserMessages(): Promise<NotificationActionResult> {
  const payload = await apiFetch<unknown>("/api/admin/user-messages/clear", {
    method: "POST",
  })
  return normalizeActionResult(payload)
}
