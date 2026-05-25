"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CatalogProduct } from "@/domain/catalog";
import { useCart } from "@/application/hooks/useCart";

interface ProductCardProps {
  product: CatalogProduct;
  testId?: string;
  variant?: 'home' | 'listing';
}

export function ProductCard({ 
  product, 
  testId = "product-card",
  variant = "listing" 
}: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant === "home") {
      router.push(`/products/${product.id}`);
    } else {
      addItem(product, 1);
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    }
  };

  return (
    <div
      data-testid={testId}
      data-product-id={product.id}
      className="group relative block rounded border border-[#c5c5c5] bg-white p-3 transition-all hover:shadow-md flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/5] w-full rounded overflow-hidden bg-neutral-100 mb-4">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isHot && (
            <span className="bg-[#2b1809] text-white text-xs font-semibold px-2 py-1 rounded-full text-center min-w-[68px]">
              Bán chạy
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#c0a060] text-white text-xs font-semibold px-2 py-1 rounded-full text-center min-w-[68px]">
              Hàng mới về
            </span>
          )}
        </div>

        {/* Wishlist Icon - Hidden on Home variant to simplify design */}
        {variant !== "home" && (
          <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 text-[#292d32]" />
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercent ? (
          <div className="absolute bottom-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discountPercent}%
          </div>
        ) : null}

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 font-['SVN-Gilroy']">No Image</div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1">
        <div className="text-[12px] font-medium text-[#c0a060] font-['SVN-Gilroy'] leading-[1.2] mb-[23px] text-center uppercase tracking-wider">
          SKU: {product.sku || "2522"}
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <h3 data-testid="product-title" className="text-[16px] font-semibold text-[#2b1809] font-['SVN-Gilroy'] leading-[1.2] text-center mb-[8px] line-clamp-2 group-hover:text-[#9c702a] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex flex-col items-center">
          {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) ? (
            <div data-testid="product-price" className="flex items-center gap-2 justify-center mb-4">
              <span className="text-[16px] font-medium text-[#6e6e6e] line-through font-['SVN-Gilroy']">
                {new Intl.NumberFormat('vi-VN').format(parseFloat(product.compareAtPrice))}đ
              </span>
              <span className="text-[16px] font-bold text-[#99782b] font-['SVN-Gilroy']">
                {new Intl.NumberFormat('vi-VN').format(parseFloat(product.price))}đ
              </span>
            </div>
          ) : (
            <div data-testid="product-price" className="text-[16px] font-bold text-[#99782b] font-['SVN-Gilroy'] mb-4 text-center">
              {new Intl.NumberFormat('vi-VN').format(parseFloat(product.price))}đ
            </div>
          )}
          
          <button
            data-testid="add-to-cart"
            onClick={handleAction}
            className="w-full bg-[#9c702a] hover:bg-[#2b1809] text-white py-2 rounded-sm font-semibold text-[16px] font-['SVN-Gilroy'] transition-colors"
          >
            {variant === "home" ? "Khám phá" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}
