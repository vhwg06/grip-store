"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/application/hooks/useAuth"
import { useOrders } from "@/application/hooks/useOrders"
import { OrdersContent } from "@/components/orders-content"

export default function OrdersPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const { orders, isLoading } = useOrders()

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login?callbackUrl=/orders')
        }
    }, [loading, router, user])

    if (loading || isLoading) {
        return (
            <div className="container py-12 space-y-4">
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    return <OrdersContent orders={orders} />
}
