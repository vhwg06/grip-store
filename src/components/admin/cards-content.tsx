"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, CreditCard } from "lucide-react"
import { useAdminCards } from "@/application/hooks/useAdmin"
import { Button } from "@/components/ui/button"

function formatDate(value: string | null) {
  if (!value) return "Not set"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AdminCardsContent() {
  const searchParams = useSearchParams()
  const productId = (searchParams.get("productId") || "").trim()
  const productName = (searchParams.get("productName") || "").trim()
  const productSku = (searchParams.get("productSku") || "").trim()
  const { data, error, isLoading } = useAdminCards()

  const cards = useMemo(() => {
    const list = data ?? []
    if (!productId) return list
    return list.filter((card) => card.productId === productId)
  }, [data, productId])

  const backHref = productId
    ? `/admin/product/edit/placeholder?id=${encodeURIComponent(productId)}`
    : "/admin/products"

  return (
    <div className="w-[1056px]">
      <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
        <span>Admin</span>
        <span>/</span>
        <span>Commerce</span>
        <span>/</span>
        <span className="text-foreground font-medium">Cards</span>
      </div>

      <div className="flex items-center justify-between mt-[57px] mb-[12px] leading-none">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy">
            Product-linked cards
          </h1>
          <p className="text-sm text-[#71685a] mt-[12px]">
            Review inventory artifacts without losing the selected product context.
          </p>
        </div>
        <Button
          asChild
          type="button"
          variant="outline"
          className="h-10 border-[#d8cfbf] bg-white text-[#50483d] hover:bg-[#f8f5ef] rounded-lg text-sm font-semibold"
        >
          <Link data-testid="product-cards-back-link" href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to product
          </Link>
        </Button>
      </div>

      <div
        data-testid="product-cards-context"
        className="mb-6 rounded-lg border border-[#e7e1d7] bg-white p-5 text-sm text-[#50483d]"
      >
        <div className="font-semibold text-[#211e18]">
          {productName || "Selected product"}
        </div>
        <div className="mt-1 text-xs text-[#787774]">
          Product ID: <span className="font-medium text-[#50483d]">{productId || "All products"}</span>
          {productSku ? <> · SKU: <span className="font-medium text-[#50483d]">{productSku}</span></> : null}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-28 w-full rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-28 w-full rounded-xl bg-muted/40 animate-pulse" />
        </div>
      )}

      {!isLoading && error && (
        <div
          data-testid="product-cards-error"
          className="rounded-lg border border-[#ffccc7] bg-[#fff1f0] p-6 text-[#a33b2b]"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="font-semibold">Cards could not be loaded</div>
              <p className="mt-1 text-sm leading-relaxed">
                The backend cards surface did not return usable data for this product context. No fallback inventory was fabricated.
              </p>
              <p className="mt-2 text-xs opacity-80">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && cards.length === 0 && (
        <div
          data-testid="product-cards-empty"
          className="rounded-lg border border-[#e7e1d7] bg-white p-8 text-center text-[#71685a]"
        >
          <CreditCard className="mx-auto mb-3 h-8 w-8 text-[#99782b]" />
          <div className="font-semibold text-[#211e18]">No linked cards found</div>
          <p className="mt-2 text-sm leading-relaxed">
            This product currently has no card inventory attached, but the product context was preserved.
          </p>
        </div>
      )}

      {!isLoading && !error && cards.length > 0 && (
        <div className="rounded-lg border border-[#e7e1d7] bg-white p-4">
          <table data-testid="product-cards-table" className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-[#9a9184]">
                <th className="px-3 py-2">Card</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Reserved order</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.id}
                  data-testid="product-card-row"
                  data-product-id={card.productId}
                  className="border-t border-[#f0ebe1] text-sm text-[#50483d]"
                >
                  <td className="px-3 py-3 font-mono text-xs">{card.cardKey || `Card ${card.id}`}</td>
                  <td className="px-3 py-3">{card.isUsed ? "Used" : "Available"}</td>
                  <td className="px-3 py-3">{card.reservedOrderId || "Not reserved"}</td>
                  <td className="px-3 py-3">{formatDate(card.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
