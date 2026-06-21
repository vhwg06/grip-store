"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function EditArticlePageClient({ id }: { id: string }) {
  const router = useRouter();
  const resolvedId = useResolvedRouteParam(id, "/admin/article/edit", ["articleId", "id"]);

  useEffect(() => {
    router.replace(
      resolvedId && resolvedId !== "placeholder"
        ? `/admin/articles?articleId=${encodeURIComponent(resolvedId)}`
        : "/admin/articles"
    );
  }, [resolvedId, router]);

  return <div className="container py-16 text-sm text-muted-foreground">Redirecting...</div>;
}
