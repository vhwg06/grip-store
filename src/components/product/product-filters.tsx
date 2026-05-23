"use client";
import { useBrands } from "@/application/hooks/useBrands";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ProductFilters() {
  const { brands } = useBrands();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white border rounded-xl p-5 mt-4 sticky top-[400px]">
      <h3 className="font-bold text-lg mb-4 pb-2 border-b uppercase">Bộ lọc</h3>
      
      {/* Brands */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Thương hiệu</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands?.map(brand => (
            <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 text-primary focus:ring-primary" />
              <span className="text-sm">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Giá (VNĐ)</h4>
        <div className="flex items-center gap-2 mb-4">
          <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="w-full border rounded p-1.5 text-sm" />
          <span>-</span>
          <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-full border rounded p-1.5 text-sm" />
        </div>
        <button onClick={handleFilter} className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm hover:bg-primary/90">Lọc giá</button>
      </div>
    </div>
  );
}
