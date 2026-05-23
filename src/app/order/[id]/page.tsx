"use client"

import { useParams } from "next/navigation"
import { useOrder } from "@/application/hooks/useOrder"
import { OrderContent } from "@/components/order-content"
import { Card, CardContent } from "@/components/ui/card"

export default function OrderPage() {
    const params = useParams<{ id: string }>()
    const id = typeof params?.id === "string" ? params.id : ""
    const { order, canViewKey, isOwner, refundRequest, isLoading } = useOrder(id)

    if (isLoading) {
        return (
            <div className="container py-12 max-w-2xl space-y-4">
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-96 rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    if (!order) {
        return (
            <main className="container py-16 max-w-lg">
                <Card className="tech-card">
                    <CardContent className="py-8 text-sm text-muted-foreground">
                        Order not found.
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <OrderContent
            order={order}
            canViewKey={canViewKey}
            isOwner={isOwner}
            refundRequest={refundRequest}
        />
    )
}
