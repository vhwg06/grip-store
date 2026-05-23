"use client"

import { useSearchParams } from "next/navigation"
import { UsersContent } from "@/components/admin/users-content"
import { useAdminUsers } from "@/application/hooks/useAdmin"

export default function UsersPage() {
    const searchParams = useSearchParams()
    const page = Number(searchParams.get("page")) || 1
    const q = searchParams.get("q") || ""
    const { data, isLoading } = useAdminUsers({ page, q, pageSize: 20 })

    if (isLoading || !data) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    return <UsersContent data={data} />
}
