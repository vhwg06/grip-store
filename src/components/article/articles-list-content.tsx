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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-xl" />)}
        </div>
      ) : !articles || articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <h2 className="text-xl font-medium mb-2">Chưa có bài viết nào</h2>
          <p className="text-neutral-500">Vui lòng quay lại sau nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
