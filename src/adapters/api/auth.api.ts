"use client"

import { apiFetch } from "@/adapters/api/http-client"
import { clearTokens, setTokens } from "@/adapters/api/token-store"
import type { AuthResponse, AuthTokens, User } from "@/domain/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? ""

function resolveAuthUrl(path: string, callbackUrl?: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }

  const url = new URL(`${API_URL}${path}`)
  if (callbackUrl) {
    url.searchParams.set("callbackUrl", callbackUrl)
  }
  return url.toString()
}

export function loginWithLinuxDO(callbackUrl?: string) {
  window.location.assign(resolveAuthUrl("/api/auth/oauth/linuxdo", callbackUrl))
}

export function loginWithGitHub(callbackUrl?: string) {
  window.location.assign(resolveAuthUrl("/api/auth/oauth/github", callbackUrl))
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" })
  } finally {
    clearTokens()
  }
}

export async function refreshToken() {
  const response = await apiFetch<AuthResponse>("/api/auth/refresh", { method: "POST" })
  persistAuthResponse(response)
  return response
}

export async function getMe() {
  return apiFetch<User>("/api/auth/me")
}

export function persistAuthTokens(tokens: AuthTokens) {
  setTokens(tokens)
}

export function persistAuthResponse(response: AuthResponse) {
  setTokens({
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
  })
}
