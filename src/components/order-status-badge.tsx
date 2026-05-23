import { Badge } from "@/components/ui/badge"

export function OrderStatusBadge({ status }: { status: string }) {
  const variant = status === "delivered" || status === "paid" ? "secondary" : status === "cancelled" || status === "refunded" ? "destructive" : "outline"
  return <Badge variant={variant}>{status}</Badge>
}
