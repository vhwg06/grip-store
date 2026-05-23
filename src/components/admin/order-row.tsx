"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/order-status-badge"

export function AdminOrderRow({ order }: { order: { orderId: string; productName: string; amount: string; status: string; email?: string | null } }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <TableRow>
        <TableCell>{order.orderId}</TableCell>
        <TableCell>{order.productName}</TableCell>
        <TableCell>{order.amount}</TableCell>
        <TableCell><OrderStatusBadge status={order.status} /></TableCell>
        <TableCell className="text-right">
          <Button variant="outline" size="sm" onClick={() => setExpanded((next) => !next)}>
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={5} className="text-sm text-muted-foreground">
            Email: {order.email || "-"}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
