"use client"

import { AdminRefundsContent } from "@/components/admin/refunds-content"
import { useAdminRefunds } from "@/application/hooks/useAdmin"
import { useSearchParams } from "next/navigation"

export default function AdminRefundsPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""
  const { data, isLoading, mutate } = useAdminRefunds("all", {
    revalidateOnFocus: true,
    dedupingInterval: 0,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <AdminRefundsContent
      requests={data}
      initialQuery={initialQuery}
      refreshRequests={() => mutate()}
    />
  )
}
