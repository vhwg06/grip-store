"use client"

import ProductForm from "@/components/admin/product-form"
import { useAdminProductForm } from "@/application/hooks/useAdmin"

export default function NewProductPage() {
    const { data, isLoading } = useAdminProductForm()

    if (isLoading) {
        return (
            <div className="w-[1056px] animate-pulse space-y-4 mt-[83px]">
                <div className="h-10 w-64 bg-muted/60 rounded-md" />
                <div className="h-4 w-96 bg-muted/40 rounded-md" />
                <div className="flex gap-6 mt-8">
                    <div className="flex-1 h-[600px] bg-muted/30 rounded-lg" />
                    <div className="w-[384px] h-[400px] bg-muted/20 rounded-lg" />
                </div>
            </div>
        )
    }

    return (
        <ProductForm
            categories={data?.categories ?? []}
            isCreate
        />
    )
}
