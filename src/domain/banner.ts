export interface BannerSlide {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
