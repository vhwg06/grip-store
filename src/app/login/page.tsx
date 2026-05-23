"use client"

import { useAuth } from "@/application/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, LogIn, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { applyTokens, loginWithGitHub, loginWithLinuxDO, user } = useAuth()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const accessToken = searchParams.get("access_token")
  const refreshToken = searchParams.get("refresh_token")
  const expiresIn = Number(searchParams.get("expires_in") || "0")
  const devAdminBypassEnabled = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === "true"
  const [hydratingSession, setHydratingSession] = useState(Boolean(accessToken && refreshToken && expiresIn))

  useEffect(() => {
    if (!accessToken || !refreshToken || !expiresIn) {
      setHydratingSession(false)
      return
    }

    let cancelled = false
    const hydrate = async () => {
      try {
        await applyTokens({
          accessToken,
          refreshToken,
          expiresIn,
        })

        if (!cancelled) {
          router.replace(callbackUrl)
        }
      } finally {
        if (!cancelled) {
          setHydratingSession(false)
        }
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [accessToken, applyTokens, callbackUrl, expiresIn, refreshToken, router])

  useEffect(() => {
    if (user && !hydratingSession) {
      router.replace(callbackUrl)
    }
  }, [callbackUrl, hydratingSession, router, user])

  return (
    <main className="container py-16 max-w-md">
      <Card className="tech-card overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">登录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {devAdminBypassEnabled && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              disabled
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Dev Admin 已禁用
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            disabled={hydratingSession}
            onClick={() => loginWithGitHub(callbackUrl)}
          >
            <Github className="mr-2 h-4 w-4" />
            使用 GitHub 登录
          </Button>
          <Button
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            disabled={hydratingSession}
            onClick={() => loginWithLinuxDO(callbackUrl)}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {hydratingSession ? "正在登录..." : "使用 Linux DO 登录"}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
