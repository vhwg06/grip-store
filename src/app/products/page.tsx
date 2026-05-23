import { ProductListingContent } from "@/components/product/product-listing-content";

export const metadata = {
  title: "Sản phẩm | GRIP",
  description: "Khám phá bộ sưu tập tay nắm và phụ kiện cao cấp tại GRIP.",
};

export default function ProductsPage() {
  return (
    <main className="py-8 bg-neutral-50 min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <ProductListingContent />
      </div>
    </main>
  );
}
