"use client"

import { AdminProductsContent } from "@/components/admin/products-content"
import { useAdminProducts } from "@/application/hooks/useAdmin"

export default function AdminPage() {
    const { data, isLoading } = useAdminProducts()

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
        <AdminProductsContent
            products={data.products}
            lowStockThreshold={data.lowStockThreshold}
        />
    )
}
