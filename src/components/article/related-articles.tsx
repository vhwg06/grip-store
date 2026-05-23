import { Article } from "@/domain/article";
import { ArticleCard } from "./article-card";

interface RelatedArticlesProps {
  articles: Article[];
  title?: string;
}

export function RelatedArticles({ articles, title = "Bài viết liên quan" }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-12 border-t">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
