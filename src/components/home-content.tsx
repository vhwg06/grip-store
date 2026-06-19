"use client";

import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryRail } from "@/components/home/category-rail";
import { ProductSection } from "@/components/home/product-section";
import { USPSection } from "@/components/home/usp-section";
import { NewsSection } from "@/components/home/news-section";
import { ShopByColor } from "@/components/home/shop-by-color";
import { useCatalog, usePublicSettings } from "@/application/hooks/useCatalog";

export function HomeContent() {
  const { products, isLoading } = useCatalog({ limit: 10, sort: "popular" });
  const { settings } = usePublicSettings();
  const featuredProducts = products.filter((p) => p.isHot).slice(0, 5);
  const premiumHandles = products.slice(0, 5);

  const blocksStr = settings?.homepageBlocks || (settings as any)?.homepage_blocks || "hero,categories,products,latest-news,colors,usp";
  const blocks = blocksStr.split(",").map((b: string) => b.trim().toLowerCase());

  return (
    <div className="flex flex-col w-full">
      {blocks.map((block: string) => {
        switch (block) {
          case "hero":
            return (
              <div key="hero" data-testid="homepage-module-hero">
                <HeroBanner />
              </div>
            );
          case "categories":
            return (
              <div key="categories" data-testid="homepage-module-categories">
                <CategoryRail />
              </div>
            );
          case "products":
            return (
              <div key="products" data-testid="homepage-module-products" className="contents">
                <ProductSection
                  title="SẢN PHẨM NỔI BẬT"
                  products={featuredProducts}
                  viewAllLink="/products?filter=hot"
                  cardTestId="featured-product-card"
                  isLoading={isLoading}
                  variant="home"
                />
                <ProductSection
                  title="TAY NẮM CAO CẤP"
                  products={premiumHandles}
                  viewAllLink="/products"
                  cardTestId="home-product-card"
                  isLoading={isLoading}
                  variant="home"
                />
              </div>
            );
          case "latest-news":
          case "news":
            return (
              <div key="latest-news" data-testid="homepage-module-latest-news">
                <NewsSection />
              </div>
            );
          case "colors":
            return (
              <div key="colors" data-testid="homepage-module-colors">
                <ShopByColor />
              </div>
            );
          case "usp":
            return (
              <div key="usp" data-testid="homepage-module-usp">
                <USPSection />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
