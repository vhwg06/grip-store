import { BuyPageContent } from "@/components/buy/buy-page-content";
import Image from "next/image";

export const metadata = {
  title: "Sản phẩm | GRIP",
  description: "Khám phá bộ sưu tập tay nắm và phụ kiện cao cấp tại GRIP.",
};

export default function BuyListingPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="relative h-[520px] w-full bg-neutral-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1618220179428-22790b46a013?q=80&w=2000&auto=format&fit=crop"
          alt="Products Hero Banner"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4 font-svn-gilroy">Danh Mục Sản Phẩm</h1>
            <p className="text-lg md:text-xl font-medium leading-relaxed font-svn-gilroy">
              Khám phá bộ sưu tập các sản phẩm tay nắm và phụ kiện cao cấp, được thiết kế tỉ mỉ để tôn lên vẻ đẹp cho không gian của bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#2b1809] text-white py-4 px-4 hidden md:block border-y border-[#c0a060]">
        <div className="container mx-auto max-w-[1440px] px-[125px] flex items-center justify-between text-sm font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>Giao hàng toàn quốc</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>Bảo hành chính hãng</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>Hỗ trợ 24/7</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#c0a060] rounded-full"></span>Đổi trả 30 ngày</div>
        </div>
      </section>

      <BuyPageContent />
    </main>
  );
}
