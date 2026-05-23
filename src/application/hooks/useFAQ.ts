"use client";

import useSWR from "swr";
import { getFAQEntries } from "@/adapters/api/faq.api";

export function useFAQ() {
  const { data, error, isLoading, mutate } = useSWR("faq-entries", getFAQEntries, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return {
    faqs: data?.items ?? [],
    isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}
