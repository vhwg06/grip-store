"use client"

import { AdminRefundsContent } from "@/components/admin/refunds-content"
import { useAdminRefunds } from "@/application/hooks/useAdmin"

export default function AdminRefundsPage() {
  const { data, isLoading } = useAdminRefunds()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return <AdminRefundsContent requests={data} />
}
