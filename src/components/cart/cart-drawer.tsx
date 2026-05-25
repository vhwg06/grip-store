"use client";

import { ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/application/hooks/useCart";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { useEffect, useState } from "react";
import Link from "next/link";

export function CartDrawer() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors h-full px-2">
          <div className="relative flex items-center justify-center w-6 h-6">
            <ShoppingCart className="w-[21px] h-[22px]" />
            {mounted && cart.totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#99782b] text-white text-[11px] font-medium w-4 h-4 flex items-center justify-center rounded-full leading-none">
                {cart.totalQuantity}
              </span>
            )}
          </div>
          <span className="text-[16px] font-semibold hidden md:block pl-1">Giỏ hàng</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl font-bold">Giỏ hàng của bạn ({cart.totalQuantity})</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Giỏ hàng đang trống.</p>
              <button onClick={() => setOpen(false)} className="px-6 py-2 bg-neutral-100 text-black font-medium rounded-full hover:bg-neutral-200 transition-colors">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t p-6 bg-neutral-50">
            <CartSummary checkoutHref="/cart" checkoutLabel="XEM GIỎ HÀNG" onCheckoutClick={() => setOpen(false)} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
