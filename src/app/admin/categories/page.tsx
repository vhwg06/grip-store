"use client"

import { AdminCategoriesContent } from "@/components/admin/categories-content"
import { useAdminCategories } from "@/application/hooks/useAdmin"

export default function AdminCategoriesPage() {
  const { data, isLoading } = useAdminCategories()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div data-testid="admin-table" className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return <AdminCategoriesContent categories={data} />
}
