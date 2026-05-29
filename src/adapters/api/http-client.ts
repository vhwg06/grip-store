"use client"

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/adapters/api/token-store"

interface ApiErrorPayload {
  error?: string
  message?: string
}

export interface ApiErrorResult {
  success: false
  error: string
}

export class ApiFetchError extends Error {
  result: ApiErrorResult

  constructor(result: ApiErrorResult) {
    super(result.error)
    this.name = "ApiFetchError"
    this.result = result
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? ""

export function resolveApiUrl(path: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  // Map /api/... to /v1/... to match the Go backend routing
  const targetPath = normalizedPath.startsWith("/api/")
    ? normalizedPath.replace("/api/", "/v1/")
    : normalizedPath

  return `${API_URL}${targetPath}`
}

async function tryRefreshToken() {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    const response = await fetch(resolveApiUrl("/api/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const payload = await response.json()
    const data = payload?.data || payload
    
    const accessToken = data?.accessToken || data?.access_token || data?.token
    const newRefreshToken = data?.refreshToken || data?.refresh_token
    const expiresIn = Number(data?.expiresIn || data?.expires_in || 86400) // Default to 24h fallback

    if (!accessToken || !newRefreshToken) {
      clearTokens()
      return false
    }

    setTokens({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    })

    return true
  } catch (error) {
    console.error("Token refresh failed:", error)
    clearTokens()
    return false
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return
  // Prevent infinite loop redirects if we are already on the login page
  if (window.location.pathname === "/login") return

  const callbackUrl = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
}

async function parseError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload
    return {
      success: false,
      error: payload.error || payload.message || `Request failed with status ${response.status}`,
    } satisfies ApiErrorResult
  } catch {
    return {
      success: false,
      error: `Request failed with status ${response.status}`,
    } satisfies ApiErrorResult
  }
}

export function normalizeApiError(error: unknown): ApiErrorResult {
  if (error instanceof ApiFetchError) return error.result
  if (error instanceof Error) {
    return { success: false, error: error.message }
  }
  return { success: false, error: "Request failed" }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const accessToken = getAccessToken()
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  const url = resolveApiUrl(path)
  console.log("Client-side fetching URL:", url)
  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (response.status === 401 && !retried) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return apiFetch<T>(path, init, true)
    }

    // Only force redirect to login if the user was previously authenticated
    const hasSession = Boolean(getRefreshToken())
    if (hasSession) {
      redirectToLogin()
    }
    throw new Error("Unauthorized")
  }

  if (!response.ok) {
    throw new ApiFetchError(await parseError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
