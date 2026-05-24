"use client";
import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/application/hooks/useCatalog";

export function CategoryRail() {
  const { categories, isLoading } = useCatalog();
  const fallbackCategories = [
    { id: "fallback-1", name: "Tay nắm cao cấp", slug: "tay-nam-cao-cap", icon: "" },
    { id: "fallback-2", name: "Khóa cửa thông minh", slug: "khoa-cua-thong-minh", icon: "" },
    { id: "fallback-3", name: "Khóa cửa phân thể", slug: "khoa-cua-phan-the", icon: "" },
    { id: "fallback-4", name: "Móc treo đồ", slug: "moc-treo-do", icon: "" },
    { id: "fallback-5", name: "Phụ kiện cửa", slug: "phu-kien-cua", icon: "" },
  ];

  if (isLoading) {
    return (
      <section className="py-12 bg-white" data-testid="category-rail">
        <div className="container mx-auto max-w-[1190px] px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Danh mục nổi bật</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar">
            {fallbackCategories.map((category) => (
              <Link
                key={category.id}
                href={`/buy/products?category=${category.slug || category.id}`}
                data-testid="category-icon"
                className="min-w-[200px] w-[200px] h-[235px] flex flex-col items-center justify-center bg-neutral-50 rounded-xl border border-neutral-100 snap-start"
              >
                <div className="w-24 h-24 mb-4 relative rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <div className="w-16 h-16 bg-neutral-200 rounded-full" />
                </div>
                <h3 className="font-semibold text-center px-2">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }
  const list = categories?.length ? categories : fallbackCategories;

  return (
    <section className="py-12 bg-white" data-testid="category-rail">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Danh mục nổi bật</h2>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar">
          {list.map((category) => (
            <Link
              key={category.id} 
              href={`/buy/products?category=${category.slug || category.id}`}
              data-testid="category-icon"
              className="min-w-[200px] w-[200px] h-[235px] flex flex-col items-center justify-center bg-neutral-50 rounded-xl hover:shadow-md transition-all group snap-start border border-neutral-100"
            >
              <div className="w-24 h-24 mb-4 relative rounded-full bg-white flex items-center justify-center overflow-hidden">
                {category.icon ? (
                  <Image src={category.icon} alt={category.name} width={64} height={64} className="object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-16 h-16 bg-neutral-200 rounded-full" />
                )}
              </div>
              <h3 className="font-semibold text-center group-hover:text-primary transition-colors px-2">{category.name}</h3>
              <span className="text-sm text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Khám phá &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
