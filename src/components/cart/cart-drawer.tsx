"use client";

import { ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/application/hooks/useCart";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { useState } from "react";
import Link from "next/link";

export function CartDrawer() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-neutral-600 hover:text-black transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {cart.totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cart.totalQuantity}
            </span>
          )}
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
