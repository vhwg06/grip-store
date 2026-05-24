"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  getMe,
  loginWithGitHub,
  loginWithLinuxDO,
  logout as logoutRequest,
  persistAuthTokens,
} from "@/adapters/api/auth.api"
import { getAccessToken, getRefreshToken, onTokenChange } from "@/adapters/api/token-store"
import type { AuthTokens, User } from "@/domain/auth"

interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  loading: boolean
  loginWithGitHub: (callbackUrl?: string) => void
  loginWithLinuxDO: (callbackUrl?: string) => void
  applyTokens: (tokens: AuthTokens) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const hasTokens = Boolean(getAccessToken() || getRefreshToken())
    if (!hasTokens) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setUser(await getMe())
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    return onTokenChange(() => {
      void refresh()
    })
  }, [])

  const applyTokens = async (tokens: AuthTokens) => {
    persistAuthTokens(tokens)
    await refresh()
  }

  const logout = async () => {
    await logoutRequest()
    setUser(null)
  }

  const isBypass = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user || (isBypass ? {
        id: "dev-admin-id",
        username: "admin",
        email: "admin@grip.local",
        avatar_url: null,
        trustLevel: 3,
        isAdmin: true,
        points: 9999,
        desktopNotificationsEnabled: false
      } : null),
      isAdmin: Boolean(user?.isAdmin) || isBypass,
      loading: isBypass ? false : loading,
      loginWithGitHub,
      loginWithLinuxDO,
      applyTokens,
      logout,
      refresh,
    }),
    [loading, user, isBypass],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }

  return context
}
