"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function PaymentCallbackPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const orderId = typeof params?.id === "string" ? params.id.trim() : ""

  useEffect(() => {
    router.replace(orderId ? `/order/${orderId}` : "/orders")
  }, [orderId, router])

  return (
    <div className="container py-16 text-sm text-muted-foreground">
      Redirecting...
    </div>
  )
}
