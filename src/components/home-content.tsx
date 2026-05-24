"use client";

import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryRail } from "@/components/home/category-rail";
import { ProductSection } from "@/components/home/product-section";
import { USPSection } from "@/components/home/usp-section";
import { NewsSection } from "@/components/home/news-section";
import { ShopByColor } from "@/components/home/shop-by-color";
import { useCatalog } from "@/application/hooks/useCatalog";

export function HomeContent() {
  const { products, isLoading } = useCatalog({ limit: 10, sort: "popular" });
  const featuredProducts = products.filter((p) => p.isHot).slice(0, 5);
  const premiumHandles = products.slice(0, 5);

  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      <CategoryRail />

      <ProductSection
        title="SẢN PHẨM NỔI BẬT"
        products={isLoading ? [] : featuredProducts}
        viewAllLink="/products?filter=hot"
        cardTestId="featured-product-card"
      />

      <ProductSection
        title="TAY NẮM CAO CẤP"
        products={isLoading ? [] : premiumHandles}
        viewAllLink="/products"
        cardTestId="home-product-card"
      />

      <ShopByColor />
      <NewsSection />
      <USPSection />
    </div>
  );
}
