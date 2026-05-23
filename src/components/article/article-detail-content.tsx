"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { useArticle } from "@/application/hooks/useArticles";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ArticleContent } from "@/components/article/article-content";
import { RelatedArticles } from "@/components/article/related-articles";
import { Calendar, User } from "lucide-react";

interface ArticleDetailContentProps {
  slug: string;
}

export function ArticleDetailContent({ slug }: ArticleDetailContentProps) {
  const { article, isLoading } = useArticle(slug);
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-[1190px] px-4 py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-neutral-100 rounded-md mb-8" />
          <div className="h-96 w-full max-w-3xl bg-neutral-100 rounded-xl mb-12" />
          <div className="h-4 w-full max-w-3xl bg-neutral-100 rounded-md mb-2" />
          <div className="h-4 w-full max-w-3xl bg-neutral-100 rounded-md mb-2" />
          <div className="h-4 w-3/4 max-w-3xl bg-neutral-100 rounded-md" />
        </div>
      </div>
    );
  }

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();

  return (
    <>
      <div className="container mx-auto max-w-[1190px] px-4 py-8">
        <Breadcrumbs items={[
          { label: "Tin tức", href: "/articles" },
          { label: article.title }
        ]} />
        
        <article className="max-w-3xl mx-auto mt-8">
          <header className="mb-8 text-center">
            {article.tags && article.tags.length > 0 && (
              <div className="flex gap-2 justify-center mb-4">
                {article.tags.map(tag => (
                  <span key={tag} className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-neutral-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={publishedDate.toISOString()}>
                  {publishedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author || "GRIP Admin"}</span>
              </div>
            </div>
          </header>

          {article.featuredImage && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-12">
              <Image 
                src={article.featuredImage} 
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mb-16">
            {article.excerpt && (
              <p className="text-xl text-neutral-600 font-medium leading-relaxed mb-8 italic border-l-4 border-primary pl-4">
                {article.excerpt}
              </p>
            )}
            
            <ArticleContent content={article.content} />
          </div>
        </article>
      </div>

      <RelatedArticles articles={[]} />
    </>
  );
}
