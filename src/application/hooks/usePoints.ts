"use client"

import useSWR from "swr"
import { getUserPoints } from "@/adapters/api/profile.api"

export function usePoints() {
  const swr = useSWR("profile-points", getUserPoints)

  return {
    points: swr.data ?? 0,
    isLoading: swr.isLoading,
    error: swr.error ?? null,
    refresh: swr.mutate,
  }
}
