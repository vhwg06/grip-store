"use client";
import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/application/hooks/useCatalog";

export function CategoryRail() {
  const { categories, isLoading } = useCatalog();

  if (isLoading) return <div className="h-[235px] bg-neutral-50 animate-pulse my-8" />;
  if (!categories?.length) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Danh mục nổi bật</h2>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug || category.id}`}
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
