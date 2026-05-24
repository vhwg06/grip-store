import Image from "next/image";
import Link from "next/link";
import { Article } from "@/domain/article";
import { Calendar } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
  
  return (
    <Link data-testid="article-card" data-slug={article.slug} href={`/articles/${article.slug}`} className="group block overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all h-full flex flex-col">
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <time dateTime={publishedDate.toISOString()}>
            {publishedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </time>
        </div>
        <h3 data-testid="article-title" className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p data-testid="article-excerpt" className="text-neutral-600 text-sm line-clamp-3 mb-4 flex-1">
          {article.excerpt}
        </p>
        <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:underline mt-auto">
          Đọc thêm
        </span>
      </div>
    </Link>
  );
}
