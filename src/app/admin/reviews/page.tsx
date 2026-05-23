"use client"

import { AdminReviewsContent } from "@/components/admin/reviews-content"
import { useAdminReviews } from "@/application/hooks/useAdmin"

export default function AdminReviewsPage() {
  const { data, isLoading } = useAdminReviews()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return <AdminReviewsContent reviews={data} />
}
