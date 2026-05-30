import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { buildExportRoutePath } from "@/lib/export-route"

export function OrderCard({ order }: { order: { orderId: string; productName: string; amount: string; status: string } }) {
  return (
    <Link href={buildExportRoutePath("/order", order.orderId)}>
      <Card className="transition hover:bg-muted/40">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <div className="font-medium">{order.productName}</div>
            <div className="text-sm text-muted-foreground">{order.orderId}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">{order.amount}</div>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
