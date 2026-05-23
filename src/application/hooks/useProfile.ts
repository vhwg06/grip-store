"use client"

import useSWR from "swr"
import {
  getProfile,
  updateDesktopNotifications,
  updateProfileEmail,
} from "@/adapters/api/profile.api"

export function useProfile() {
  const swr = useSWR("profile", getProfile)

  return {
    profile: swr.data ?? null,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
    updateProfileEmail,
    updateDesktopNotifications,
  }
}
