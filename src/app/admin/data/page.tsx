"use client"

import { AdminDataContent } from "@/components/admin/export-content"
import { useAdminData } from "@/application/hooks/useAdmin"

export default function AdminDataPage() {
  const { data, isLoading } = useAdminData()

  if (isLoading) {
    return <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
  }

  return <AdminDataContent shopName={data?.shopName ?? null} />
}
