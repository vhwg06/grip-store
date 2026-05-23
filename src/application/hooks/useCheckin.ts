"use client"

import useSWR from "swr"
import { checkIn, getCheckinStatus, getUserPoints } from "@/adapters/api/profile.api"

export function useCheckin() {
  const status = useSWR("profile-checkin-status", getCheckinStatus)
  const points = useSWR("profile-points", getUserPoints)

  return {
    checkedIn: Boolean(status.data?.checkedIn),
    disabled: Boolean(status.data?.disabled),
    points: points.data ?? 0,
    isLoading: status.isLoading || points.isLoading,
    error: status.error || points.error || null,
    checkIn,
    refresh: async () => {
      await Promise.all([status.mutate(), points.mutate()])
    },
  }
}
