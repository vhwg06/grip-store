import { FAQResponse } from "@/domain/faq";
import { apiFetch } from "@/adapters/api/http-client";

export async function getFAQEntries(): Promise<FAQResponse> {
  try {
    return await apiFetch<FAQResponse>("/api/faqs/active");
  } catch (error) {
    console.warn("Could not fetch FAQs from backend, returning empty:", error);
    return { items: [] };
  }
}
