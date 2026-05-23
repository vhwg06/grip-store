"use client";

import useSWR from "swr";
import { getBrands } from "@/adapters/api/brands.api";

export function useBrands() {
  const { data, error, isLoading, mutate } = useSWR("brands", getBrands, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return {
    brands: data ?? [],
    isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}
