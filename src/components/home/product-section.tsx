import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { CatalogProduct } from "@/domain/catalog";

interface ProductSectionProps {
  title: string;
  products: CatalogProduct[];
  viewAllLink?: string;
}

export function ProductSection({ title, products, viewAllLink }: ProductSectionProps) {
  if (!products?.length) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-[1190px] px-4">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">{title}</h2>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-primary font-medium hover:underline flex items-center gap-1">
              Xem tất cả &rarr;
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
