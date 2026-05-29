"use client";

import { AdminOrderDetailContent } from "@/components/admin/order-detail-content";
import { useAdminOrder } from "@/application/hooks/useAdmin";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function AdminOrderDetailPageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/admin/orders");
  const { data: order, isLoading } = useAdminOrder(resolvedId);

  if (isLoading) {
    return <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />;
  }

  if (!order) {
    return <div className="text-sm text-muted-foreground">Order not found.</div>;
  }

  return <AdminOrderDetailContent order={order} />;
}
