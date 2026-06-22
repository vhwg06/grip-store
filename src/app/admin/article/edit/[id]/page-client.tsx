"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function EditArticlePageClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedId = useResolvedRouteParam(id, "/admin/article/edit", ["articleId", "id"]);

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    if (resolvedId && resolvedId !== "placeholder") {
      urlParams.set("articleId", resolvedId);
    }
    router.replace(`/admin/articles?${urlParams.toString()}`);
  }, [resolvedId, router, searchParams]);


  return <div className="container py-16 text-sm text-muted-foreground">Redirecting...</div>;
}
