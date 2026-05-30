"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { buildExportRoutePath } from "@/lib/export-route"

function normalizeOrderId(input: string | null) {
  if (!input) return ""
  const trimmed = input.trim()
  return trimmed.includes("?") ? trimmed.split("?")[0] || "" : trimmed
}

export default function PaymentCallbackIndexPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId =
    normalizeOrderId(searchParams.get("out_trade_no")) ||
    normalizeOrderId(searchParams.get("order_no")) ||
    normalizeOrderId(searchParams.get("orderId"))

  useEffect(() => {
    router.replace(orderId ? buildExportRoutePath("/order", orderId) : "/orders")
  }, [orderId, router])

  return (
    <div className="container py-16 text-sm text-muted-foreground">
      Redirecting...
    </div>
  )
}
