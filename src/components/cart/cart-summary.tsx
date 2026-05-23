"use client";
import Link from "next/link";
import { useCart } from "@/application/hooks/useCart";

interface CartSummaryProps {
  onCheckoutClick?: () => void;
  checkoutLabel?: string;
  checkoutHref?: string;
}

export function CartSummary({ onCheckoutClick, checkoutLabel = "TIẾN HÀNH THANH TOÁN", checkoutHref = "/checkout" }: CartSummaryProps) {
  const { cart } = useCart();

  if (cart.items.length === 0) return null;

  const totalFormat = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.subtotal || 0);

  return (
    <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
      <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Số lượng sản phẩm:</span>
          <span className="font-medium">{cart.totalQuantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Tạm tính:</span>
          <span className="font-medium">{totalFormat}</span>
        </div>
        <div className="flex justify-between pt-3 border-t">
          <span className="font-bold">Tổng cộng:</span>
          <span className="font-bold text-primary text-lg">{totalFormat}</span>
        </div>
      </div>
      
      <Link href={checkoutHref} onClick={onCheckoutClick} className="block">
        <button className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full hover:bg-primary/90 transition-colors text-center">
          {checkoutLabel}
        </button>
      </Link>
    </div>
  );
}
