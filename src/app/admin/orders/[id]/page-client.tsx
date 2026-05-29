"use client";

import { AdminOrderDetailContent } from "@/components/admin/order-detail-content";
import { useAdminOrder } from "@/application/hooks/useAdmin";

export default function AdminOrderDetailPageClient({ id }: { id: string }) {
  const { data: order, isLoading } = useAdminOrder(id);

  if (isLoading) {
    return <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />;
  }

  if (!order) {
    return <div className="text-sm text-muted-foreground">Order not found.</div>;
  }

  return <AdminOrderDetailContent order={order} />;
}
