"use client"

import useSWR from "swr"
import {
  getProfile,
  getProfileSecurity,
  getProfileSessions,
  updateProfile,
  updateDesktopNotifications,
  updateProfileEmail,
} from "@/adapters/api/profile.api"

export function useProfile() {
  const profileSWR = useSWR("profile", getProfile)
  const securitySWR = useSWR("profile-security", getProfileSecurity)
  const sessionsSWR = useSWR("profile-sessions", getProfileSessions)

  return {
    profile: profileSWR.data ?? null,
    security: securitySWR.data ?? null,
    sessions: sessionsSWR.data ?? [],
    isLoading: profileSWR.isLoading || securitySWR.isLoading || sessionsSWR.isLoading,
    error: profileSWR.error ?? securitySWR.error ?? sessionsSWR.error ?? null,
    refresh: async () => {
      await Promise.all([profileSWR.mutate(), securitySWR.mutate(), sessionsSWR.mutate()])
    },
    updateProfile,
    updateProfileEmail,
    updateDesktopNotifications,
  }
}
