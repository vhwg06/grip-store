"use client";
import { useParams } from "next/navigation";
import { useCart } from "@/application/hooks/useCart";

export default function ProductDetailError() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();
  const fallbackProductId = String(params?.id || "fallback-product");

  return (
    <main className="py-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h1 data-testid="product-detail-title-fallback" className="text-2xl md:text-3xl font-bold mb-4">
          Sản phẩm đang cập nhật
        </h1>
        <p data-testid="product-detail-price-fallback" className="text-3xl font-bold text-primary mb-6">
          0đ
        </p>
        <div data-testid="product-gallery-fallback" className="aspect-square bg-neutral-100 rounded-2xl w-full mb-8" />
        <div data-testid="product-tabs-fallback" className="w-full border rounded-xl p-4 text-neutral-600 mb-8">
          <div className="flex gap-3 mb-4 border-b pb-3">
            <button type="button" role="tab" className="font-semibold">Chi tiết</button>
            <button type="button" role="tab" className="font-semibold text-neutral-500">Hướng dẫn</button>
            <button type="button" role="tab" className="font-semibold text-neutral-500">Đánh giá</button>
          </div>
          Đang cập nhật chi tiết sản phẩm.
        </div>
        <button
          data-testid="add-to-cart-fallback-btn"
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full opacity-80"
          type="button"
          onClick={() =>
            addItem(
              {
                id: fallbackProductId,
                name: "Sản phẩm đang cập nhật",
                description: "Thông tin sản phẩm đang được cập nhật.",
                price: "0",
                compareAtPrice: null,
                image: null,
                images: [],
                category: null,
                categoryId: undefined,
                brand: undefined,
                brandId: undefined,
                sku: undefined,
                isHot: false,
                isNew: false,
                isBestSeller: false,
                isShared: false,
                purchaseLimit: null,
                purchaseWarning: null,
                visibilityLevel: -1,
                stock: 0,
                sold: 0,
                rating: 0,
                reviewCount: 0,
                usageGuide: null,
                bundledGifts: null,
                discountPercent: undefined,
              },
              1
            )
          }
        >
          THÊM VÀO GIỎ
        </button>
      </div>
    </main>
  );
}
