"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PayingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return (
    <div className="container py-16 text-sm text-muted-foreground">
      Redirecting...
    </div>
  )
}
