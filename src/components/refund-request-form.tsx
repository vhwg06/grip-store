"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function RefundRequestForm({ onSubmit }: { onSubmit: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  return (
    <div className="space-y-3">
      <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Refund reason" />
      <Button disabled={submitting || !reason.trim()} onClick={async () => {
        setSubmitting(true)
        try {
          await onSubmit(reason.trim())
          setReason("")
        } finally {
          setSubmitting(false)
        }
      }}>
        Request refund
      </Button>
    </div>
  )
}
