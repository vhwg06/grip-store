"use client";
import Link from "next/link";

export default function ProductDetailError() {
  return (
    <main className="py-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h1 data-testid="product-detail-error-title" className="text-2xl md:text-3xl font-bold mb-4">
          Sản phẩm đang cập nhật
        </h1>
        <p className="text-neutral-600 mb-8">
          Không thể tải dữ liệu sản phẩm ở thời điểm hiện tại. Vui lòng quay lại danh sách sản phẩm và thử lại.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold px-6 py-3"
        >
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    </main>
  );
}
