"use client";

import { useArticles } from "@/application/hooks/useArticles";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ArticleCard } from "@/components/article/article-card";

export function ArticlesListContent() {
  const { articles, isLoading } = useArticles();

  return (
    <div className="container mx-auto max-w-[1190px] px-4">
      <Breadcrumbs items={[{ label: "Tin tức" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Tin tức & Blog</h1>
        <p className="text-neutral-600 max-w-2xl">
          Cập nhật những xu hướng thiết kế nội thất mới nhất, kiến thức chuyên ngành và thông tin hữu ích về các sản phẩm tay nắm cửa từ GRIP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {isLoading && (
        <p className="mt-4 text-sm text-neutral-500">Đang cập nhật danh sách bài viết...</p>
      )}
      {!isLoading && articles.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500" data-testid="articles-empty">
          Chưa có bài viết để hiển thị.
        </p>
      )}
    </div>
  );
}
