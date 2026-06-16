import { apiFetch } from "@/adapters/api/http-client";
import { BannerSlide } from "@/domain/banner";

function firstString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value !== "string") continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ""
}

export async function getActiveBanners(): Promise<BannerSlide[]> {
  try {
    const payload = await apiFetch<any>("/api/public/homepage");
    const blocks = payload?.data || [];
    
    // Look for block with block_type === "banner"
    const bannerBlock = blocks.find((b: any) => b.block_type === "banner" && b.is_active);
    
    if (bannerBlock && bannerBlock.config && Array.isArray(bannerBlock.config.slides)) {
      return bannerBlock.config.slides.map((slide: any, idx: number) => ({
        id: String(slide.id || `banner-db-${idx}`),
        title: slide.title ?? "",
        subtitle: slide.subtitle ?? "",
        imageUrl: firstString(slide.imageUrl, slide.image_url, slide.image, slide.url),
        mobileImageUrl: firstString(slide.mobileImageUrl, slide.mobile_image_url, slide.mobileImage, slide.mobile_image, slide.mobileUrl) || undefined,
        ctaText: slide.ctaText ?? slide.cta_text ?? "Xem ngay",
        ctaUrl: slide.ctaUrl ?? slide.cta_url ?? "/products",
        sortOrder: Number(slide.sortOrder ?? slide.sort_order ?? idx),
        isActive: true
      }));
    }
  } catch (error) {
    console.warn("Could not fetch banners from backend homepage API:", error);
  }
  
  return [];
}
