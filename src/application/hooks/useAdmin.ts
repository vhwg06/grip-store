"use client"

import useSWR from "swr"
import {
  getAdminCards,
  getAdminCategories,
  getAdminCollect,
  getAdminDashboard,
  getAdminData,
  getAdminMessages,
  getAdminNotificationSettings,
  getAdminOrder,
  getAdminOrders,
  getAdminProductForm,
  getAdminProducts,
  getAdminRefunds,
  getAdminReviews,
  getAdminUsers,
} from "@/adapters/api/admin.api"

export const useAdminDashboard = () => useSWR("admin-dashboard", getAdminDashboard)
export const useAdminProducts = () => useSWR("admin-products", getAdminProducts)
export const useAdminCategories = () => useSWR("admin-categories", getAdminCategories)
export const useAdminProductForm = (id?: string) => useSWR(["admin-product-form", id ?? "new"], () => getAdminProductForm(id))
export const useAdminCards = (productId?: string) => useSWR(productId ? ["admin-cards", productId] : null, () => getAdminCards(productId as string))
export const useAdminUsers = (params: { page?: number; q?: string; pageSize?: number }) => useSWR(["admin-users", params], () => getAdminUsers(params))
export const useAdminOrders = (params: { page?: number; pageSize?: number; q?: string; status?: string }) => useSWR(["admin-orders", params], () => getAdminOrders(params))
export const useAdminOrder = (id?: string) => useSWR(id ? ["admin-order", id] : null, () => getAdminOrder(id as string))
export const useAdminRefunds = () => useSWR("admin-refunds", getAdminRefunds)
export const useAdminReviews = () => useSWR("admin-reviews", getAdminReviews)
export const useAdminMessages = () => useSWR("admin-messages", getAdminMessages)
export const useAdminData = () => useSWR("admin-data", getAdminData)
export const useAdminCollect = () => useSWR("admin-collect", getAdminCollect)
export const useAdminNotificationSettings = () => useSWR("admin-notification-settings", getAdminNotificationSettings)
