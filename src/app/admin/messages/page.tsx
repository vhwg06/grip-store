"use client"

import { AdminMessagesContent } from "@/components/admin/messages-content"
import { useAdminMessages } from "@/application/hooks/useAdmin"

export default function AdminMessagesPage() {
  const { data, isLoading } = useAdminMessages()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return <AdminMessagesContent history={data.history} inbox={data.inbox} />
}
