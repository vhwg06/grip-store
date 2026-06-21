"use client";

import useSWR from "swr";
import { getSiteConfig, getAboutPage } from "@/adapters/api/site-config.api";
import type { SiteConfig, AboutPageData } from "@/domain/site-config";

export function useSiteConfig() {
  const { data, error, isLoading, mutate } = useSWR<SiteConfig>("site-config", getSiteConfig, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return {
    config: data ?? null,
    isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}

export function useAboutPage() {
  const { data, error, isLoading, mutate } = useSWR<AboutPageData>("about-page", getAboutPage, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    shouldRetryOnError: false, // Don't keep retrying if 404
  });

  return {
    aboutPage: data ?? null,
    isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}

