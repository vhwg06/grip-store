import { apiFetch } from "@/adapters/api/http-client";
import { Article, ArticleListResponse } from "@/domain/article";

export async function getArticles(page = 1, limit = 10) {
  return apiFetch<ArticleListResponse>(`/api/articles?page=${page}&limit=${limit}`);
}

export async function getArticle(slug: string) {
  return apiFetch<Article>(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function getLatestArticles(count = 4) {
  return apiFetch<ArticleListResponse>(`/api/articles/latest?count=${count}`);
}
