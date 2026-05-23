"use client"

import { AdminCategoriesContent } from "@/components/admin/categories-content"
import { useAdminCategories } from "@/application/hooks/useAdmin"

export default function AdminCategoriesPage() {
  const { data, isLoading } = useAdminCategories()

  if (isLoading || !data) {
    return <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
  }

  return <AdminCategoriesContent categories={data} />
}
