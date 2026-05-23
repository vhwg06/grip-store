"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"
import type { ReactNode } from "react"
import { ShieldCheck, User, Lock, Eye, EyeOff } from "lucide-react"

export function LoginModal({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter()
  const { t } = useI18n()
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError(t("loginForm.errorEmpty"))
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Direct Server OAuth implementation placeholder
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setSuccess(t("loginForm.success"))
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setError(err?.message || t("loginForm.errorFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? <Button>Sign in</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">{t("loginForm.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 pt-4">
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
            <Label htmlFor="modal-usernameOrEmail" className="text-xs font-semibold">
              {t("loginForm.usernameOrEmail")}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="modal-usernameOrEmail"
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
            <Label htmlFor="modal-password" className="text-xs font-semibold">
              {t("loginForm.password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="modal-password"
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
      </DialogContent>
    </Dialog>
  )
}
