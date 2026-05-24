"use client"

import { register } from "@/adapters/api/auth.api"
import { useAuth } from "@/application/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const { refresh } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.")
      return
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    setLoading(true)
    try {
      await register(email.trim(), password, name.trim())
      await refresh()
      setSuccess("Đăng ký thành công.")
      setTimeout(() => {
        router.push(callbackUrl)
      }, 300)
    } catch (err: any) {
      setError(err?.message || "Không thể đăng ký tài khoản.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-16 max-w-md">
      <Card className="tech-card overflow-hidden border border-border/40 shadow-xl bg-background/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Đăng ký tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div data-testid="signup-error-message" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-700">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="signup-name">Họ và tên</Label>
              <Input
                id="signup-name"
                data-testid="signup-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                data-testid="signup-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Mật khẩu</Label>
              <Input
                id="signup-password"
                data-testid="signup-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="signup-confirm-password"
                data-testid="signup-confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              data-testid="signup-submit-btn"
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
