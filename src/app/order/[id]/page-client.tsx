"use client";

import { useOrder } from "@/application/hooks/useOrder";
import { OrderContent } from "@/components/order-content";
import { Card, CardContent } from "@/components/ui/card";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function OrderPageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/order");
  const { order, canViewKey, isOwner, refundRequest, isLoading } = useOrder(resolvedId);

  if (isLoading) {
    return (
      <div className="container py-12 max-w-2xl space-y-4">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-96 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <main className="container py-16 max-w-lg">
        <Card className="tech-card">
          <CardContent className="py-8 text-sm text-muted-foreground">Order not found.</CardContent>
        </Card>
      </main>
    );
  }

  return <OrderContent order={order} canViewKey={canViewKey} isOwner={isOwner} refundRequest={refundRequest} />;
}
