"use client"

import { AdminProductsContent } from "@/components/admin/products-content"
import { useAdminProducts } from "@/application/hooks/useAdmin"

export default function AdminPage() {
    const { data, isLoading } = useAdminProducts()

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                    <button data-testid="create-btn" className="h-10 px-4 rounded-md border text-sm opacity-70">
                        Create
                    </button>
                </div>
                <div data-testid="admin-table" className="w-full rounded-xl border bg-muted/20 p-4">
                    <div data-item-id="loading-placeholder" className="flex items-center justify-between gap-2">
                        <div className="h-5 w-40 rounded bg-muted/60 animate-pulse" />
                        <div className="flex items-center gap-2">
                            <button data-testid="toggle-btn" className="h-8 px-3 rounded border text-xs opacity-70">Toggle</button>
                            <button data-testid="edit-btn" className="h-8 px-3 rounded border text-xs opacity-70">Edit</button>
                            <button data-testid="delete-btn" className="h-8 px-3 rounded border text-xs opacity-70">Delete</button>
                        </div>
                    </div>
                </div>
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    return (
        <AdminProductsContent
            products={data?.products ?? []}
            lowStockThreshold={data?.lowStockThreshold ?? 5}
        />
    )
}
