import { apiFetch } from "@/adapters/api/http-client";
import { BannerSlide } from "@/domain/banner";

export async function getActiveBanners() {
  return apiFetch<BannerSlide[]>("/api/banners/active");
}
