"use client"

import { useSearchParams } from "next/navigation"
import { PaymentLinkContent } from "@/components/payment-link-content"

export default function PaymentLinkPage() {
    const searchParams = useSearchParams()
    const payee = (searchParams.get("to") || "").trim() || null

    return <PaymentLinkContent payee={payee} />
}
