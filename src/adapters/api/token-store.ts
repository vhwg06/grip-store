"use client"

import Cookies from "js-cookie"
import type { AuthTokens } from "@/domain/auth"

const ACCESS_TOKEN_KEY = "grip_store_access_token"
const REFRESH_TOKEN_KEY = "grip_store_refresh_token"
const EXPIRES_AT_KEY = "grip_store_access_token_expires_at"
const TOKEN_EVENT = "grip-store:auth-changed"

let accessTokenMemory: string | null = null
let refreshTokenMemory: string | null = null
let expiresAtMemory: number | null = null

function emitTokenChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TOKEN_EVENT))
  }
}

function readNumberCookie(key: string) {
  const value = Cookies.get(key)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function getAccessToken() {
  return accessTokenMemory ?? Cookies.get(ACCESS_TOKEN_KEY) ?? null
}

export function getRefreshToken() {
  return refreshTokenMemory ?? Cookies.get(REFRESH_TOKEN_KEY) ?? null
}

export function getAccessTokenExpiresAt() {
  return expiresAtMemory ?? readNumberCookie(EXPIRES_AT_KEY)
}

export function setTokens(tokens: AuthTokens) {
  const expiresAt = Date.now() + tokens.expiresIn * 1000

  accessTokenMemory = tokens.accessToken
  refreshTokenMemory = tokens.refreshToken
  expiresAtMemory = expiresAt

  Cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: 30,
  })
  Cookies.set(EXPIRES_AT_KEY, String(expiresAt), {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  emitTokenChange()
}

export function clearTokens() {
  accessTokenMemory = null
  refreshTokenMemory = null
  expiresAtMemory = null

  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" })
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" })
  Cookies.remove(EXPIRES_AT_KEY, { path: "/" })

  emitTokenChange()
}

export function onTokenChange(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  window.addEventListener(TOKEN_EVENT, listener)
  return () => window.removeEventListener(TOKEN_EVENT, listener)
}
