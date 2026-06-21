"use client"

import { AdminPaymentCodeContent } from "@/components/admin/payment-code-content"
import { useAdminCollect } from "@/application/hooks/useAdmin"

export default function AdminCollectPage() {
    const { data, isLoading } = useAdminCollect()

    if (isLoading || !data) {
        return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />
    }

    return (
        <AdminPaymentCodeContent
            payLink={data.payLink}
            payee={data.payee}
            sources={data.sources}
            ready={data.ready}
            warnings={data.warnings}
        />
    )
}
