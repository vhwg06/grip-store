"use client";

import { ArticleForm } from "@/components/admin/article-form";
import { useAdminArticle } from "@/application/hooks/useAdmin";
import { useResolvedRouteParam } from "@/lib/route-param";

export default function EditArticlePageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/admin/article/edit");
  const { data: article, isLoading } = useAdminArticle(resolvedId);

  if (isLoading) {
    return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />;
  }

  if (!article) {
    return <div className="text-sm text-muted-foreground">Article not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <ArticleForm article={article} />
    </div>
  );
}
