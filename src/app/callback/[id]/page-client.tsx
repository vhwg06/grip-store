"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResolvedRouteParam } from "@/lib/route-param";
import { buildExportRoutePath } from "@/lib/export-route";

export default function PaymentCallbackPageClient({ id }: { id: string }) {
  const router = useRouter();
  const orderId = useResolvedRouteParam(id, "/callback");

  useEffect(() => {
    router.replace(orderId ? buildExportRoutePath("/order", orderId) : "/orders");
  }, [orderId, router]);

  return <div className="container py-16 text-sm text-muted-foreground">Redirecting...</div>;
}
