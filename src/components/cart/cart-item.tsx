"use client";
import Image from "next/image";
import { useCart } from "@/application/hooks/useCart";
import { CartItem as CartItemType } from "@/domain/cart";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const image = product.image || product.images?.[0] || "";

  return (
    <div className="flex gap-4 py-4 border-b" data-testid="cart-item" data-product-id={product.id}>
      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border">
        {image && <Image src={image} alt={product.name} fill className="object-cover" />}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 data-testid="cart-item-title" className="font-medium line-clamp-2">{product.name}</h4>
            <p data-testid="cart-item-price" className="text-sm text-neutral-500 mt-1">{product.price}</p>
          </div>
          <button
            data-testid="remove-item-btn"
            onClick={() => removeItem(product.id)}
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
              onClick={() => updateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              data-testid="cart-item-qty"
              aria-label="Cart item quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value || "1", 10);
                updateQuantity(product.id, Number.isNaN(next) ? 1 : Math.max(1, next));
              }}
              className="px-3 text-sm font-medium min-w-[3ch] text-center w-14 border-x bg-transparent"
            />
            <button
              className="px-2 py-1 text-neutral-500 hover:text-black hover:bg-neutral-50"
              onClick={() => updateQuantity(product.id, quantity + 1)}
            >
              +
            </button>
          </div>
          <p className="font-bold text-primary">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              (parseFloat(product.price.replace(/[^0-9.-]+/g,"")) || 0) * quantity
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
