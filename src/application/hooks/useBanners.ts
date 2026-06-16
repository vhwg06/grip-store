"use client";

import useSWR from "swr";
import { getActiveBanners } from "@/adapters/api/banners.api";

export function useBanners() {
  const { data, error, isLoading, mutate } = useSWR("active-banners", getActiveBanners, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    banners: data ?? [],
    isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}
