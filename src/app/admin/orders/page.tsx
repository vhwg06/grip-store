"use client"

import { useSearchParams } from "next/navigation"
import { AdminOrdersContent } from "@/components/admin/orders-content"
import { useAdminOrders } from "@/application/hooks/useAdmin"

function intParam(value: string | null, fallback: number) {
    const num = value ? Number.parseInt(value, 10) : NaN
    return Number.isFinite(num) && num > 0 ? num : fallback
}

export default function AdminOrdersPage() {
    const searchParams = useSearchParams()
    const q = (searchParams.get("q") || "").trim()
    const status = (searchParams.get("status") || "all").trim()
    const page = intParam(searchParams.get("page"), 1)
    const pageSize = Math.min(intParam(searchParams.get("pageSize"), 50), 200)
    const { data, isLoading } = useAdminOrders({ page, pageSize, q, status })

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
        <AdminOrdersContent
            orders={data.orders}
            total={data.total}
            page={data.page}
            pageSize={data.pageSize}
            query={data.query}
            status={data.status}
        />
    )
}
