"use client"

import useSWR from "swr"
import {
  clearMyNotifications,
  clearUserMessages,
  deleteUserMessage,
  getMyNotifications,
  getUnreadCount,
  getUnreadUserMessageCount,
  markAllNotificationsRead,
  markNotificationRead,
  markUserMessageRead,
  sendUserMessage,
} from "@/adapters/api/notifications.api"

export function useNotifications() {
  const swr = useSWR("notifications", getMyNotifications)

  return {
    notifications: swr.data?.items ?? [],
    unreadCount: swr.data?.items?.filter((item) => !item.isRead).length ?? 0,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearMyNotifications,
    sendUserMessage,
  }
}

export function useNotificationUnreadCount(initialCount = 0) {
  const swr = useSWR("notifications-unread-count", getUnreadCount, {
    fallbackData: { success: true, count: initialCount },
  })

  return {
    count: swr.data?.count ?? initialCount,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
  }
}

export function useAdminUserMessageUnreadCount() {
  const swr = useSWR("admin-user-message-unread-count", getUnreadUserMessageCount, {
    fallbackData: { success: true, count: 0 },
  })

  return {
    count: swr.data?.count ?? 0,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
  }
}

export const adminUserMessagesApi = {
  clearUserMessages,
  deleteUserMessage,
  markUserMessageRead,
  getUnreadUserMessageCount,
}
