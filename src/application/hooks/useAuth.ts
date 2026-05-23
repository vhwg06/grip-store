"use client"

import { useAuthContext } from "@/application/context/AuthContext"

export function useAuth() {
  return useAuthContext()
}
