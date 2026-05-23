"use client";

import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryRail } from "@/components/home/category-rail";
import { ProductSection } from "@/components/home/product-section";
import { USPSection } from "@/components/home/usp-section";
import { NewsSection } from "@/components/home/news-section";
import { CTABanner } from "@/components/home/cta-banner";
import { ShopByColor } from "@/components/home/shop-by-color";
import { useCatalog } from "@/application/hooks/useCatalog";

export function HomeContent() {
  const { products, isLoading } = useCatalog({ limit: 10, sort: "popular" });

  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      <CategoryRail />
      
      {isLoading ? (
        <div className="h-64 bg-neutral-50 animate-pulse my-12 container mx-auto" />
      ) : (
        <ProductSection 
          title="SẢN PHẨM NỔI BẬT" 
          products={products.filter(p => p.isHot).slice(0, 5)} 
          viewAllLink="/products?filter=hot" 
        />
      )}

      <USPSection />

      {isLoading ? null : (
        <ProductSection 
          title="TAY NẮM CAO CẤP" 
          products={products.slice(0, 5)} 
          viewAllLink="/products" 
        />
      )}

      <ShopByColor />
      <NewsSection />
      <CTABanner />
    </div>
  );
}
