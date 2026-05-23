"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useAuth } from "@/application/hooks/useAuth"
import { Button } from "@/components/ui/button"

export function AuthGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
  if (!user) {
    return fallback ?? (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">Please sign in to continue.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    )
  }
  return children
}
