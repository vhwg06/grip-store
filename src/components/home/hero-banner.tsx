"use client";
import Link from "next/link";
import { useBanners } from "@/application/hooks/useBanners";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export function HeroBanner() {
  const { banners, isLoading } = useBanners();
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (isLoading) return <div className="w-full h-[400px] md:h-[668px] bg-neutral-100 animate-pulse" />;
  if (!banners?.length) {
    return (
      <section className="w-full" data-testid="hero">
        <div className="relative w-full h-[400px] md:h-[668px] bg-neutral-900">
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
            <h2 data-testid="hero-title" className="text-white text-3xl md:text-5xl font-bold mb-4">
              SẢN PHẨM CỦA CHÚNG TÔI
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full" data-testid="hero">
      {/* eslint-disable-next-line react-hooks/refs */}
      <Carousel plugins={[plugin.current]} className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {banners.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative w-full h-[400px] md:h-[668px]">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.title || "Banner"} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-800" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
                  <h2 data-testid="hero-title" className="text-white text-3xl md:text-5xl font-bold mb-4">
                    {slide.title || "SẢN PHẨM CỦA CHÚNG TÔI"}
                  </h2>
                  <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl">
                    {slide.subtitle || "Bán lẻ và phân phối phụ kiện nắm cửa, nắm tủ, khóa cửa thông minh"}
                  </p>
                  <Link href={slide.ctaUrl || "/products"} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
                    {slide.ctaText || "Xem ngay"}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
}
