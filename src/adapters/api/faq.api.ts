import { apiFetch } from "@/adapters/api/http-client";
import { FAQResponse } from "@/domain/faq";

export async function getFAQEntries() {
  return apiFetch<FAQResponse>("/api/faqs/active");
}
