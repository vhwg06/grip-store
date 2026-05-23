"use client";
import { useSiteConfig } from "@/application/hooks/useSiteConfig";

export function CTABanner() {
  const { config } = useSiteConfig();

  return (
    <section className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto max-w-[1190px] px-4 text-center flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Bạn cần tư vấn chi tiết?</h2>
          <p className="text-primary-foreground/90">Đội ngũ chuyên gia của GRIP luôn sẵn sàng hỗ trợ bạn.</p>
        </div>
        <div className="flex gap-4">
          <a href={`tel:${config?.contactPhone}`} className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-neutral-100 transition-colors shadow-sm">
            Gọi ngay: {config?.contactPhone || "1900 xxxx"}
          </a>
          {config?.socialLinks?.zalo && (
            <a href={config.socialLinks.zalo} target="_blank" rel="noreferrer" className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-primary transition-colors">
              Chat Zalo
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
