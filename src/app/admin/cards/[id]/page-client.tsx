"use client";

import { CardsContent } from "@/components/admin/cards-content";
import { useAdminCards } from "@/application/hooks/useAdmin";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function CardsPageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/admin/cards");
  const { data, isLoading } = useAdminCards(resolvedId);

  if (isLoading) {
    return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />;
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Product not found.</div>;
  }

  return <CardsContent productId={data.productId ?? resolvedId} productName={data.productName} unusedCards={data.unusedCards ?? []} apiConfig={data.apiConfig} />;
}
