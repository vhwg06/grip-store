import { apiFetch } from "@/adapters/api/http-client";
import { Article, ArticleListResponse } from "@/domain/article";

function normalizeArticle(raw: any): Article {
  if (!raw) return {} as Article;
  
  // Extract clean plain text for excerpt if not provided
  const bodyText = String(raw.body || raw.content || "");
  const excerptText = raw.excerpt || (bodyText ? bodyText.replace(/<[^>]*>/g, "").substring(0, 150) + "..." : "");

  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || ""),
    title: String(raw.title || ""),
    excerpt: excerptText,
    content: bodyText,
    featuredImage: raw.featuredImage ?? raw.image_url ?? null,
    publishedAt: raw.published_at || raw.publishedAt || raw.created_at || new Date().toISOString(),
    author: raw.author_id || raw.author || "GRIP Admin",
    tags: Array.isArray(raw.tags) ? raw.tags : ["Hardware", "Grip Store"],
    isPublished: raw.status === "published" || raw.isPublished === true,
  };
}

function normalizeArticlesResponse(payload: any, page = 1, limit = 10): ArticleListResponse {
  const rawItems = payload?.data || payload?.items || [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeArticle) : [];
  const total = Number(payload?.meta?.total ?? payload?.total ?? items.length);

  return {
    items,
    page,
    limit,
    total,
  };
}

export async function getArticles(page = 1, limit = 10): Promise<ArticleListResponse> {
  const offset = (page - 1) * limit;
  const payload = await apiFetch<any>(`/api/public/content/articles?limit=${limit}&offset=${offset}`);
  return normalizeArticlesResponse(payload, page, limit);
}

export async function getArticle(slug: string): Promise<Article> {
  const payload = await apiFetch<any>(`/api/public/content/articles/${encodeURIComponent(slug)}`);
  // If the backend returns a wrapper { data: Article }
  const data = payload?.data || payload;
  return normalizeArticle(data);
}

export async function getLatestArticles(count = 4): Promise<ArticleListResponse> {
  const payload = await apiFetch<any>(`/api/public/content/articles?limit=${count}&offset=0`);
  return normalizeArticlesResponse(payload, 1, count);
}
