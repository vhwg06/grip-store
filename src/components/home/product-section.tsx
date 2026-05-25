import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { CatalogProduct } from "@/domain/catalog";

interface ProductSectionProps {
  title: string;
  products: CatalogProduct[];
  viewAllLink?: string;
  cardTestId?: string;
  isLoading?: boolean;
}

export function ProductSection({
  title,
  products,
  viewAllLink,
  cardTestId = "featured-product-card",
  isLoading = false,
}: ProductSectionProps) {
  const displayProducts = products?.slice(0, 5) ?? [];
  const slots = Array.from({ length: 5 }, (_, idx) => displayProducts[idx] ?? null);

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
          {slots.map((product, idx) => (
            <div key={`slot-${idx}`} data-testid={cardTestId}>
              {product ? (
                <ProductCard product={product} />
              ) : (
                <div className="rounded border border-[#c5c5c5] p-3">
                  <div className={`aspect-[4/5] w-full rounded ${isLoading ? "bg-neutral-100 animate-pulse" : "bg-neutral-50"} mb-4`} />
                  <h3 data-testid="product-title" className="text-sm text-neutral-500 text-center">
                    {isLoading ? "Đang tải sản phẩm..." : "Chưa có sản phẩm"}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
