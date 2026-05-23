import { apiFetch } from "@/adapters/api/http-client";
import { SiteConfig } from "@/domain/site-config";

export async function getSiteConfig() {
  return apiFetch<SiteConfig>("/api/config/site");
}
