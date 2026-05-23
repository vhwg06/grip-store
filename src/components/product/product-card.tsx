import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { CatalogProduct } from "@/domain/catalog";
import { useCart } from "@/application/hooks/useCart";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  return (
    <Link href={`/products/${product.id}`} className="group relative block rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isHot && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase">Hot</span>}
        {product.isNew && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase">Mới</span>}
        {product.isBestSeller && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase">Bán Chạy</span>}
      </div>
      {product.discountPercent ? (
        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{product.discountPercent}%
        </div>
      ) : null}

      {/* Image */}
      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex gap-2">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 font-medium text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Mua ngay
          </button>
          <button className="w-9 h-9 bg-white text-neutral-800 rounded-md flex items-center justify-center hover:bg-neutral-100">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-neutral-500 mb-1">{product.sku || product.brand || "GRIP"}</div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 flex-1 group-hover:text-primary transition-colors">{product.name}</h3>
        
        <div className="mt-auto">
          {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
            <div className="text-xs text-neutral-400 line-through mb-0.5">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.compareAtPrice))}
            </div>
          )}
          <div className="text-primary font-bold text-base">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}
          </div>
        </div>
      </div>
    </Link>
  );
}
