"use client";

import useSWR from "swr";
import { getArticles, getArticle, getLatestArticles } from "@/adapters/api/articles.api";

export function useArticles(page = 1, limit = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    ["articles", page, limit],
    () => getArticles(page, limit),
    { revalidateOnFocus: false }
  );

  return {
    articles: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}

export function useArticle(slug: string) {
  const { data, error, isLoading } = useSWR(
    slug ? ["article", slug] : null,
    () => getArticle(slug),
    { revalidateOnFocus: false }
  );

  return {
    article: data ?? null,
    isLoading,
    error: error ?? null,
  };
}

export function useLatestArticles(count = 4) {
  const { data, error, isLoading } = useSWR(
    ["latest-articles", count],
    () => getLatestArticles(count),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    articles: data?.items ?? [],
    isLoading,
    error: error ?? null,
  };
}
