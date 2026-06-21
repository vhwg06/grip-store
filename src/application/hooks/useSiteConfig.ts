"use client";

import useSWR from "swr";
import { getSiteConfig } from "@/adapters/api/site-config.api";
import type { SiteConfig } from "@/domain/site-config";

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
