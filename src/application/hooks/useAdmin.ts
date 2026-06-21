"use client"

import useSWR, { type SWRConfiguration } from "swr"
import {
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
  getAdminArticles,
  getAdminArticle,
  getAdminAboutPage,
  getAdminBanners,
  getAdminFAQs,
  getAdminLeads,
  getAdminOrderDetails,
} from "@/adapters/api/admin.api"
import { getAdminMedia, type MediaListParams } from "@/adapters/api/media.api"
import type { AdminArticle } from "@/domain/admin"

export const useAdminDashboard = () => useSWR("admin-dashboard", getAdminDashboard)
export const useAdminProducts = () => useSWR("admin-products", getAdminProducts)
export const useAdminCategories = () => useSWR("admin-categories", getAdminCategories)
export const useAdminProductForm = (id?: string) => useSWR(["admin-product-form", id ?? "new"], () => getAdminProductForm(id))
export const useAdminUsers = (params: { page?: number; q?: string; pageSize?: number; role?: string }) => useSWR(["admin-users", params], () => getAdminUsers(params))
export const useAdminOrders = (params: { page?: number; pageSize?: number; q?: string; status?: string }) => useSWR(["admin-orders", params], () => getAdminOrders(params))
export const useAdminOrder = (id?: string) => useSWR(id ? ["admin-order", id] : null, () => getAdminOrder(id as string))
export const useAdminRefunds = (
  status: "pending" | "approved" | "all" = "all",
  config?: SWRConfiguration,
) => useSWR(["admin-refunds", status], () => getAdminRefunds(status), config)
export const useAdminReviews = () => useSWR("admin-reviews", getAdminReviews)
export const useAdminMessages = () => useSWR("admin-messages", getAdminMessages)
export const useAdminData = () => useSWR("admin-data", getAdminData)
export const useAdminCollect = () => useSWR("admin-collect", getAdminCollect)
export const useAdminNotificationSettings = () => useSWR("admin-notification-settings", getAdminNotificationSettings)
export const useAdminArticles = () => useSWR<AdminArticle[]>("admin-articles", getAdminArticles)
export const useAdminArticle = (id?: string) => useSWR(id ? ["admin-article", id] : null, () => getAdminArticle(id as string))
export const useAdminAboutPage = () => useSWR("admin-about-page", getAdminAboutPage)
export const useAdminBanners = () => useSWR("admin-banners", getAdminBanners)
export const useAdminFAQs = () => useSWR("admin-faqs", getAdminFAQs)
export const useAdminLeads = () => useSWR("admin-leads", getAdminLeads)
export const useAdminOrderDetails = (id: string) => useSWR(id ? ["admin-order-details", id] : null, () => getAdminOrderDetails(id))
export const useAdminMedia = (params: MediaListParams) => useSWR(["admin-media", params], () => getAdminMedia(params))
