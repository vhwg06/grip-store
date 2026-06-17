"use client";
import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/application/hooks/useCatalog";

export function CategoryRail() {
  const { categories, isLoading } = useCatalog();
  const list = categories ?? [];
  const slots = Array.from({ length: 5 }, (_, idx) => list[idx] ?? null);

  return (
    <section className="py-12 bg-white" data-testid="category-rail">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Danh mục nổi bật</h2>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar">
          {slots.map((category, idx) => (
            <Link
              key={`slot-${idx}`}
              href={category ? `/products?category=${category.slug || category.id}` : "/products"}
              data-testid="category-icon"
              className="min-w-[200px] w-[200px] h-[235px] flex flex-col items-center justify-center bg-neutral-50 rounded-xl hover:shadow-md transition-all group snap-start border border-neutral-100"
            >
              <div className="w-24 h-24 mb-4 relative rounded-full bg-white flex items-center justify-center overflow-hidden">
                {category?.icon ? (
                  <Image src={category.icon} alt={category.name} width={64} height={64} className="object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <div className={`w-16 h-16 rounded-full ${isLoading ? "bg-neutral-200 animate-pulse" : "bg-neutral-200"}`} />
                )}
              </div>
              <h3 className="font-semibold text-center group-hover:text-primary transition-colors px-2">
                {category?.name ?? (isLoading ? "Đang tải danh mục..." : "Khám phá sản phẩm")}
              </h3>
              {category && (
                <span className="text-sm text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Khám phá &rarr;</span>
              )}
            </Link>
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-center text-sm text-neutral-500" data-testid="category-empty">
            Chưa có danh mục để hiển thị.
          </p>
        )}
      </div>
    </section>
  );
}
