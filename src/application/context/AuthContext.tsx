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
  login as loginApi,
} from "@/adapters/api/auth.api"
import { getServerCart } from "@/adapters/api/cart.api"
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
  login: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function hydrateCartFromServer(userId: string) {
  if (typeof window === "undefined") return
  const snapshotKey = "grip-cart"

  try {
    const current = localStorage.getItem(snapshotKey)
    if (current) {
      const parsed = JSON.parse(current) as { items?: unknown[] }
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return
      }
    }
  } catch {
    // Ignore malformed local snapshot and try to hydrate from server.
  }

  try {
    const serverCart = await getServerCart(userId)
    if (!serverCart || !Array.isArray(serverCart.items) || serverCart.items.length === 0) return
    localStorage.setItem(snapshotKey, JSON.stringify(serverCart))
  } catch {
    // Best effort hydration. Keep auth flow resilient if cart API is unavailable.
  }
}

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
      const me = await getMe() as any
      if (me) {
        me.isAdmin = Boolean(me.isAdmin ?? me.is_admin)
        me.trustLevel = Number(me.trustLevel ?? me.trust_level ?? 0)
        me.desktopNotificationsEnabled = Boolean(me.desktopNotificationsEnabled ?? me.desktop_notifications_enabled)
        await hydrateCartFromServer(String(me.id ?? ""))
      }
      setUser(me)
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

  const login = async (email: string, password: string) => {
    await loginApi(email, password)
    await refresh()
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: Boolean(user?.isAdmin),
      loading,
      loginWithGitHub,
      loginWithLinuxDO,
      applyTokens,
      logout,
      refresh,
      login,
    }),
    [loading, user],
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
