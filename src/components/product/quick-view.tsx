"use client";
import { CatalogProduct } from "@/domain/catalog";

export function QuickView({ product, isOpen, onClose }: { product: CatalogProduct | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-black">X</button>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-neutral-100 aspect-square rounded-lg flex items-center justify-center overflow-hidden">
            {product.image ? (
               <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
            ) : (
               <div className="text-neutral-400">No Image</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-xl text-primary font-bold mb-4">{product.price}</p>
            <p className="text-neutral-600 mb-6">{product.description}</p>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium w-full">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
