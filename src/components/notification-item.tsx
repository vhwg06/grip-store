"use client"

import { Badge } from "@/components/ui/badge"

export function NotificationItem({ title, content, isRead, createdAt }: { title: string; content: string; isRead?: boolean | null; createdAt?: number | null }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <span className="font-medium">{title}</span>
        {!isRead && <Badge variant="outline">Unread</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
      {createdAt && <p className="mt-2 text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</p>}
    </div>
  )
}
