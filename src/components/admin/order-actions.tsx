'use client'

import Link from "next/link"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { markOrderDelivered, markOrderPaid, cancelOrder } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"
import { CheckCircle, Truck, XCircle, ExternalLink } from "lucide-react"
import { buildExportRoutePath } from "@/lib/export-route"

export function AdminOrderActions({ order }: { order: any }) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  const status = (order.status || 'pending').toLowerCase()
  const isPaid = status === 'paid'
  const isPending = status === 'pending'
  const isTerminal = status === 'delivered' || status === 'cancelled' || status === 'refunded'

  const handleMarkDelivered = async () => {
    if (loadingRef.current) return
    if (!confirm(t('admin.orders.confirmMarkDelivered'))) return
    try {
      loadingRef.current = true
      setLoading(true)
      await markOrderDelivered(order.orderId)
      toast.success(t('common.success'))
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild data-testid="view-order-btn" variant="outline" size="sm" className="h-8 px-2.5">
        <Link href={buildExportRoutePath("/admin/orders", String(order.orderId ?? ""))}>
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Open detail
        </Link>
      </Button>

      {isTerminal ? (
        <Button variant="ghost" size="sm" className="h-8 px-2.5" disabled>
          <Truck className="mr-1.5 h-3.5 w-3.5" />
          {status === 'delivered' ? 'Delivered' : status === 'cancelled' ? 'Cancelled' : 'Refunded'}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5"
          onClick={handleMarkDelivered}
          disabled={loading || isPending}
          title={isPending ? "Unpaid order cannot be marked delivered" : t('admin.orders.markDelivered')}
        >
          <Truck className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Mark delivered (Unpaid)" : "Mark delivered"}
        </Button>
      )}
    </div>
  )
}
