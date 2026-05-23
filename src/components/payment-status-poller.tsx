"use client"

import { useEffect, useState } from "react"

export function PaymentStatusPoller({ poll, intervalMs = 3000, onPaid }: { poll: () => Promise<string>; intervalMs?: number; onPaid?: () => void }) {
  const [status, setStatus] = useState("pending")

  useEffect(() => {
    let active = true
    const timer = window.setInterval(async () => {
      const next = await poll().catch(() => status)
      if (!active) return
      setStatus(next)
      if (next === "paid" || next === "delivered") onPaid?.()
    }, intervalMs)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [intervalMs, onPaid, poll, status])

  return <div className="text-sm text-muted-foreground">Payment status: {status}</div>
}
