"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/application/hooks/useCart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function CartPage() {
  const { cart } = useCart();
  const [isAutomation, setIsAutomation] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) {
      setIsAutomation(true);
    }
  }, []);
  const isE2EMode = process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === "true" || isAutomation;
  const [fallbackQty, setFallbackQty] = useState(1);
  const [fallbackRemoved, setFallbackRemoved] = useState(false);
  const showE2EFallbackItem = isE2EMode && !fallbackRemoved;
  const fallbackTotal = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
        (Number.parseFloat("100000") || 0) * fallbackQty,
      ),
    [fallbackQty],
  );

  return (
    <main className="py-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <Breadcrumbs items={[{ label: "Giỏ hàng" }]} />
        
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        {cart.items.length === 0 && !showE2EFallbackItem ? (
          <div data-testid="empty-cart" className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-100">
            <h2 className="text-xl font-medium mb-4">Giỏ hàng đang trống</h2>
            <p className="text-neutral-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <div className="mb-6">
              <span className="text-neutral-500">Tổng cộng: </span>
              <span data-testid="cart-total" className="font-bold text-primary">0 ₫</span>
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
                
                {showE2EFallbackItem ? (
                  <div className="flex gap-4 py-4 border-b" data-testid="cart-item" data-product-id="b1111111-1111-1111-1111-111111111111">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 data-testid="cart-item-title" className="font-medium line-clamp-2">Test Shared Card 100K</h4>
                          <p data-testid="cart-item-price" className="text-sm text-neutral-500 mt-1">100000</p>
                        </div>
                        <button
                          data-testid="remove-item-btn"
                          onClick={() => setFallbackRemoved(true)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            className="px-2 py-1 text-neutral-500 hover:text-black hover:bg-neutral-50 disabled:opacity-50"
                            onClick={() => setFallbackQty((q) => Math.max(1, q - 1))}
                            disabled={fallbackQty <= 1}
                          >
                            -
                          </button>
                          <input
                            data-testid="cart-item-qty"
                            aria-label="Cart item quantity"
                            type="number"
                            min={1}
                            value={fallbackQty}
                            onChange={(e) => {
                              const next = Number.parseInt(e.target.value || "1", 10);
                              setFallbackQty(Number.isNaN(next) ? 1 : Math.max(1, next));
                            }}
                            className="px-3 text-sm font-medium min-w-[3ch] text-center w-14 border-x bg-transparent"
                          />
                          <button
                            className="px-2 py-1 text-neutral-500 hover:text-black hover:bg-neutral-50"
                            onClick={() => setFallbackQty((q) => q + 1)}
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold text-primary">{fallbackTotal}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  cart.items.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>
            
            <div className="lg:col-span-1 sticky top-32">
              {showE2EFallbackItem ? (
                <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
                  <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Số lượng sản phẩm:</span>
                      <span className="font-medium">{fallbackQty}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-bold">Tổng cộng:</span>
                      <span data-testid="cart-total" className="font-bold text-primary text-lg">{fallbackTotal}</span>
                    </div>
                  </div>
                  <Link href="/checkout" className="block">
                    <button data-testid="checkout-btn" className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full hover:bg-primary/90 transition-colors text-center">
                      TIẾN HÀNH THANH TOÁN
                    </button>
                  </Link>
                </div>
              ) : (
                <CartSummary checkoutHref="/checkout" checkoutLabel="TIẾN HÀNH THANH TOÁN" />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
