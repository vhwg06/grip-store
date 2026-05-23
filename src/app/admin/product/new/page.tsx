"use client"

import ProductForm from "@/components/admin/product-form"
import { useAdminProductForm } from "@/application/hooks/useAdmin"

export default function NewProductPage() {
    const { data, isLoading } = useAdminProductForm()

    if (isLoading || !data) {
        return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />
    }

    return <ProductForm categories={data.categories ?? []} />
}
