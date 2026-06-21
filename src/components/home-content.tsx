"use client";

import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryRail } from "@/components/home/category-rail";
import { ProductSection } from "@/components/home/product-section";
import { USPSection } from "@/components/home/usp-section";
import { NewsSection } from "@/components/home/news-section";
import { ShopByColor } from "@/components/home/shop-by-color";
import { useCatalog, usePublicSettings } from "@/application/hooks/useCatalog";
import { useSiteConfig } from "@/application/hooks/useSiteConfig";

export function HomeContent() {
  const { products, isLoading } = useCatalog({ limit: 10, sort: "popular" });
  const { settings } = usePublicSettings();
  const { config } = useSiteConfig();
  const featuredProducts = products.filter((p) => p.isHot).slice(0, 5);
  const premiumHandles = products.slice(0, 5);

  const blocksStr = settings?.homepageBlocks || (settings as any)?.homepage_blocks || "hero,categories,products,latest-news,colors,usp";
  const blocks = blocksStr.split(",").map((b: string) => b.trim().toLowerCase());
  const bannerPresence = config?.bannerPresence;
  const aboutPresence = config?.aboutPresence;
  const showBanner = bannerPresence ? bannerPresence.enabled && bannerPresence.present : true;
  const showAbout = aboutPresence ? aboutPresence.enabled && aboutPresence.present : false;

  return (
    <div className="flex flex-col w-full">
      {blocks.map((block: string) => {
        switch (block) {
          case "hero":
            if (!showBanner) return null;
            return (
              <div key="hero" data-testid="homepage-module-hero">
                <div data-testid="homepage-banner">
                <HeroBanner />
                </div>
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
      {showAbout ? (
        <section data-testid="homepage-about" className="bg-[#fbfaf7] py-16">
          <div className="container mx-auto max-w-[1190px] px-4">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#99782b]">About Grip</p>
              <h2 className="text-3xl font-bold text-[#211e18]">Built for tactile hardware stories, not just catalog rows.</h2>
              <p className="text-base leading-7 text-[#71685a]">
                Explore the brand narrative and gallery context that back the storefront promise.
              </p>
              <a href="/about" className="inline-flex text-sm font-semibold text-[#99782b] underline-offset-4 hover:underline">
                Read the About page
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
