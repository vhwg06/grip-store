"use client";
import { useState } from "react";
import { useCart } from "@/application/hooks/useCart";
import { CatalogProduct } from "@/domain/catalog";

interface AddToCartButtonProps {
  product: CatalogProduct;
  className?: string;
  showQuantity?: boolean;
}

export function AddToCartButton({ product, className = "", showQuantity = true }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {showQuantity && (
        <div className="flex items-center gap-4 mb-2">
          <span className="font-medium text-sm">Số lượng:</span>
          <div className="flex items-center border rounded-md">
            <button 
              className="px-3 py-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="px-4 font-medium min-w-[3ch] text-center">{quantity}</span>
            <button 
              className="px-3 py-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50"
              onClick={() => setQuantity(q => q + 1)}
            >
              +
            </button>
          </div>
        </div>
      )}
      <button
        data-testid="add-to-cart-btn"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(); }}
        className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full hover:bg-primary/90 transition-colors"
      >
        THÊM VÀO GIỎ
      </button>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5">
          Đã thêm vào giỏ hàng thành công!
        </div>
      )}
    </div>
  );
}
