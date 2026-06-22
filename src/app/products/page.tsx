import { ProductListingContent } from "@/components/product/product-listing-content";
import { ProductsHeroBanner } from "@/components/product/products-hero-banner";

export const metadata = {
  title: "Sản phẩm | GRIP",
  description: "Khám phá bộ sưu tập tay nắm và phụ kiện cao cấp tại GRIP.",
};

export default function ProductsPage() {
  return (
    <main className="bg-white min-h-screen">
      <ProductsHeroBanner />

      {/* Why Choose Us Placeholder */}
      <section className="w-full bg-[#2b1809] text-white py-4 px-4 hidden md:block border-y border-[#c0a060]">
        <div className="container mx-auto max-w-[1440px] px-[125px] flex items-center justify-between text-sm font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>
            Giao hàng toàn quốc
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>
            Bảo hành chính hãng
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>
            Hỗ trợ 24/7
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>
            Đổi trả 30 ngày
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-[1440px] px-4 md:px-[125px] py-12">
        <ProductListingContent />
      </div>
    </main>
  );
}
