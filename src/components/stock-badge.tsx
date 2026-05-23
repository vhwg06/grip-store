import { Badge } from "@/components/ui/badge"
import { INFINITE_STOCK } from "@/lib/constants"

export function StockBadge({ stock, low = 5 }: { stock: number; low?: number }) {
  if (stock >= INFINITE_STOCK) return <Badge variant="secondary">In stock</Badge>
  if (stock <= 0) return <Badge variant="destructive">Out of stock</Badge>
  if (stock <= low) return <Badge variant="outline">Low stock</Badge>
  return <Badge variant="secondary">In stock</Badge>
}
