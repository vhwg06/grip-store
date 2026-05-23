"use client";
import Link from "next/link";
import { useLatestArticles } from "@/application/hooks/useArticles";
import { ArticleCard } from "@/components/article/article-card";

export function NewsSection() {
  const { articles, isLoading } = useLatestArticles(4);

  if (isLoading) return <div className="h-[400px] bg-neutral-50 animate-pulse my-12" />;
  if (!articles?.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-[1190px] px-4">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">TIN TỨC MỚI NHẤT</h2>
          <Link href="/articles" className="text-primary font-medium hover:underline">
            Xem tất cả &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
