"use client";

import Image from "next/image";
import { useSiteConfig } from "@/application/hooks/useSiteConfig";

export function ProductsHeroBanner() {
  const { config } = useSiteConfig();
  const bannerPresence = config?.bannerPages?.products ?? config?.bannerPresence;
  const showBanner = bannerPresence ? bannerPresence.enabled && bannerPresence.present : true;

  if (!showBanner) {
    return null;
  }

  return (
    <section data-testid="products-hero-banner" className="relative h-[520px] w-full overflow-hidden bg-neutral-900">
      <Image
        src="https://images.unsplash.com/photo-1618220179428-22790b46a013?q=80&w=2000&auto=format&fit=crop"
        alt="Products Hero Banner"
        fill
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold uppercase tracking-wider md:text-5xl font-svn-gilroy">Danh Muc San Pham</h1>
          <p className="text-lg font-medium leading-relaxed md:text-xl font-svn-gilroy">
            Kham pha bo suu tap cac san pham tay nam va phu kien cao cap, duoc thiet ke ti mi de ton len ve dep cho khong gian cua ban.
          </p>
        </div>
      </div>
    </section>
  );
}
