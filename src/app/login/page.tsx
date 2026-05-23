"use client"

import { useAuth } from "@/application/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"
import { LogIn, ShieldCheck, User, Lock, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { applyTokens, user } = useAuth()
  const { t } = useI18n()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const accessToken = searchParams.get("access_token")
  const refreshToken = searchParams.get("refresh_token")
  const expiresIn = Number(searchParams.get("expires_in") || "0")
  
  const [hydratingSession, setHydratingSession] = useState(Boolean(accessToken && refreshToken && expiresIn))
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError(t("loginForm.errorEmpty"))
      return
    }
    if (password.length < 6) {
      setError(t("loginForm.errorPasswordLength"))
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // NOTE: Đây là nơi bạn sẽ gọi API xác thực/OAuth trực tiếp với server.
      // Ví dụ:
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username: usernameOrEmail, password })
      // })
      // const data = await res.json()
      // await applyTokens({ accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in })
      
      // Giả lập kết nối thành công để kiểm thử giao diện
      await new Promise((resolve) => setTimeout(resolve, 1200))
      
      setSuccess(t("loginForm.success"))
      
      setTimeout(() => {
        router.push(callbackUrl)
      }, 1000)
    } catch (err: any) {
      setError(err?.message || t("loginForm.errorFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-16 max-w-md">
      <Card className="tech-card overflow-hidden border border-border/40 shadow-xl bg-background/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">{t("loginForm.title")}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {hydratingSession ? t("loginForm.loadingSession") : t("loginForm.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {hydratingSession ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-8 text-muted-foreground">
              <LogIn className="h-10 w-10 animate-pulse text-primary" />
              <p className="text-sm font-medium">{t("loginForm.verifying")}</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 rotate-180" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail" className="text-xs font-semibold">
                  {t("loginForm.usernameOrEmail")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="name@example.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="pl-9 h-10 border-border/60 focus-visible:ring-primary/20"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    {t("loginForm.password")}
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 border-border/60 focus-visible:ring-primary/20"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground/60 hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {t("loginForm.submitting")}
                  </span>
                ) : (
                  t("loginForm.submit")
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
