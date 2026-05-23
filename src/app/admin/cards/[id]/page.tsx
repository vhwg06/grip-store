"use client"

import { useParams } from "next/navigation"
import { CardsContent } from "@/components/admin/cards-content"
import { useAdminCards } from "@/application/hooks/useAdmin"

export default function CardsPage() {
    const params = useParams<{ id: string }>()
    const id = typeof params?.id === "string" ? params.id : ""
    const { data, isLoading } = useAdminCards(id)

    if (isLoading) {
        return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />
    }

    if (!data) {
        return <div className="text-sm text-muted-foreground">Product not found.</div>
    }

    return (
        <CardsContent
            productId={data.productId ?? id}
            productName={data.productName}
            unusedCards={data.unusedCards ?? []}
            apiConfig={data.apiConfig}
        />
    )
}
