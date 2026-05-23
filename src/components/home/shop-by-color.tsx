import Link from "next/link";

export function ShopByColor() {
  const colors = [
    { name: "Vàng Đồng", hex: "#D4AF37", slug: "vang-dong" },
    { name: "Đen Nhám", hex: "#222222", slug: "den-nham" },
    { name: "Bạc Xước", hex: "#C0C0C0", slug: "bac-xuoc" },
    { name: "Đồng Xanh", hex: "#8A9A5B", slug: "dong-xanh" },
    { name: "Trắng Sứ", hex: "#FFFFFF", slug: "trang-su" },
  ];

  return (
    <section className="py-16 bg-neutral-900 text-white">
      <div className="container mx-auto max-w-[1190px] px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold uppercase mb-4">Lựa chọn theo màu sắc</h2>
        <p className="text-neutral-400 mb-10 max-w-2xl mx-auto">Tìm kiếm phụ kiện phù hợp hoàn hảo với phong cách thiết kế nội thất của bạn.</p>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {colors.map((color) => (
            <Link key={color.slug} href={`/products?color=${color.slug}`} className="group flex flex-col items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg border-2 border-neutral-700 group-hover:border-primary group-hover:scale-110 transition-all" style={{ backgroundColor: color.hex }} />
              <span className="font-medium text-sm group-hover:text-primary transition-colors">{color.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
