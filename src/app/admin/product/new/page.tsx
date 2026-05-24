"use client"

import ProductForm from "@/components/admin/product-form"
import { useAdminProductForm } from "@/application/hooks/useAdmin"

export default function NewProductPage() {
    const { data } = useAdminProductForm()
    return <ProductForm categories={data?.categories ?? []} />
}
