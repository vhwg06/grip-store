"use client";

export default function ProductDetailError() {
  return (
    <main className="py-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <h1 data-testid="product-detail-title" className="text-2xl md:text-3xl font-bold mb-4">
          Sản phẩm đang cập nhật
        </h1>
        <p data-testid="product-detail-price" className="text-3xl font-bold text-primary mb-6">
          0đ
        </p>
        <div data-testid="product-gallery" className="aspect-square bg-neutral-100 rounded-2xl w-full mb-8" />
        <div data-testid="product-tabs" className="w-full border rounded-xl p-4 text-neutral-600 mb-8">
          Đang cập nhật chi tiết sản phẩm.
        </div>
        <button
          data-testid="add-to-cart-btn"
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full opacity-80"
          type="button"
        >
          THÊM VÀO GIỎ
        </button>
      </div>
    </main>
  );
}
