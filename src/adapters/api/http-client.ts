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

function resolveUrl(path: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`
}

async function tryRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(resolveUrl("/api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    clearTokens()
    return false
  }

  const payload = await response.json()
  if (!payload?.access_token || !payload?.refresh_token || !payload?.expires_in) {
    clearTokens()
    return false
  }

  setTokens({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
  })

  return true
}

function redirectToLogin() {
  if (typeof window === "undefined") return
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

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers,
  })

  if (response.status === 401 && !retried) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return apiFetch<T>(path, init, true)
    }

    redirectToLogin()
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
