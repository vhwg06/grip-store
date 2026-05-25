"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/application/hooks/useCart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function CartPage() {
  const { cart } = useCart();
  const cartTotal = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
        cart.subtotal || 0,
      ),
    [cart.subtotal],
  );

  return (
    <main className="py-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <Breadcrumbs items={[{ label: "Giỏ hàng" }]} />
        
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        {cart.items.length === 0 ? (
          <div data-testid="empty-cart" className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-100">
            <h2 className="text-xl font-medium mb-4">Giỏ hàng đang trống</h2>
            <p className="text-neutral-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <div className="mb-6">
              <span className="text-neutral-500">Tổng cộng: </span>
              <span data-testid="cart-total" className="font-bold text-primary">{cartTotal}</span>
            </div>
            <Link href="/checkout">
              <button data-testid="checkout-btn" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">
                TIẾN HÀNH THANH TOÁN
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div data-testid="cart-items" className="bg-white border rounded-xl p-4 md:p-6 flex flex-col">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-medium text-neutral-500 uppercase tracking-wider">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-3 text-center">Số lượng</div>
                  <div className="col-span-3 text-right">Thành tiền</div>
                </div>
                
                {cart.items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1 sticky top-32">
              <CartSummary checkoutHref="/checkout" checkoutLabel="TIẾN HÀNH THANH TOÁN" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
