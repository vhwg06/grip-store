"use client"

import ProductForm from "@/components/admin/product-form"
import { useAdminProductForm } from "@/application/hooks/useAdmin"
import { useResolvedRouteParam } from "@/lib/route-param"
import Link from "next/link"

export default function EditProductPageClient({ id }: { id: string }) {
    const resolvedId = useResolvedRouteParam(id, "/admin/product/edit")
    const { data, isLoading } = useAdminProductForm(resolvedId)

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

    if (!data?.product) {
        return (
            <div className="w-[1056px] mt-[83px]">
                <div className="bg-[#fff1f0] border border-[#ffccc7] rounded-lg p-6 text-center space-y-3">
                    <p className="text-sm font-bold text-[#a33b2b]">Product not found</p>
                    <p className="text-xs text-[#71685a]">
                        The product with ID <code className="font-mono bg-[#f8f5ef] px-1 py-0.5 rounded">{resolvedId}</code> could not be loaded.
                    </p>
                    <Link
                        href="/admin/products"
                        className="inline-block mt-2 h-8 px-4 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold leading-8"
                    >
                        ← Back to products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <ProductForm
            product={data.product}
            categories={data.categories ?? []}
            isCreate={false}
        />
    )
}
