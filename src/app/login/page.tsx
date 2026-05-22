"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, LogIn, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const devAdminBypassEnabled = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === "true"

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
              onClick={() => signIn("dev-admin", { callbackUrl })}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Dev Admin 登录
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => signIn("github", { callbackUrl })}
          >
            <Github className="mr-2 h-4 w-4" />
            使用 GitHub 登录
          </Button>
          <Button
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => signIn("linuxdo", { callbackUrl })}
          >
            <LogIn className="mr-2 h-4 w-4" />
            使用 Linux DO 登录
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
