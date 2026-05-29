"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function PaymentCallbackPageClient({ id }: { id: string }) {
  const router = useRouter();
  const orderId = useResolvedRouteParam(id, "/callback");

  useEffect(() => {
    router.replace(orderId ? `/order/${orderId}` : "/orders");
  }, [orderId, router]);

  return <div className="container py-16 text-sm text-muted-foreground">Redirecting...</div>;
}
