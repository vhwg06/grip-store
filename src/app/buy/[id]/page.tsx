"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/application/hooks/useAuth"
import { useProduct } from "@/application/hooks/useProduct"
import { BuyContent } from "@/components/buy-content"
import { BuyRestricted } from "@/components/buy-restricted"
import { Card, CardContent } from "@/components/ui/card"

export default function BuyPage() {
    const params = useParams<{ id: string }>()
    const id = typeof params?.id === "string" ? params.id : ""
    const { user } = useAuth()
    const { product, requiredLevel, isLoading } = useProduct(id)
    const isLoggedIn = Boolean(user)

    if (isLoading) {
        return (
            <div className="container py-8 md:py-16">
                <div className="mx-auto max-w-3xl space-y-4">
                    <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
                    <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
                </div>
            </div>
        )
    }

    if (!product && typeof requiredLevel === "number" && requiredLevel >= 0) {
        return <BuyRestricted requiredLevel={requiredLevel} isLoggedIn={isLoggedIn} />
    }

    if (!product) {
        return (
            <main className="container py-16 max-w-lg">
                <Card className="tech-card">
                    <CardContent className="py-8 text-sm text-muted-foreground">
                        Product not found.
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <BuyContent
            product={product}
            stockCount={product.stock}
            lockedStockCount={0}
            isLoggedIn={isLoggedIn}
            reviews={[]}
            averageRating={Number(product.rating || 0)}
            reviewCount={Number(product.reviewCount || 0)}
            canReview={false}
            reviewOrderId={undefined}
            emailConfigured={false}
        />
    )
}
