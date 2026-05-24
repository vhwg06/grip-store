"use client";
import Link from "next/link";
import { useCatalog } from "@/application/hooks/useCatalog";
import { useBrands } from "@/application/hooks/useBrands";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export function ProductSidebar({ currentCategory }: { currentCategory?: string }) {
  const { categories } = useCatalog();
  const { brands } = useBrands();
  const [priceRange, setPriceRange] = useState([2000000, 5000000]);
  
  const tree = categories?.filter(c => !c.parentId).map(c => ({
    ...c,
    children: categories.filter(child => child.parentId === c.id)
  }));

  return (
    <aside className="w-full flex flex-col gap-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-[16px] font-bold text-[#99782b] font-['SVN-Gilroy'] mb-4">Danh mục sản phẩm</h3>
        <div className="flex flex-col">
          <Link 
            href="/products" 
            data-testid="category-filter-all"
            className={`flex items-center justify-between py-3 border-b border-[#c0a060] ${!currentCategory ? 'text-[#2b1809] font-bold' : 'text-[#475156] font-semibold'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-sm border ${!currentCategory ? 'border-[#99782b] bg-[#99782b]' : 'border-[#c9cfd2] bg-white'} flex items-center justify-center`}>
                {!currentCategory && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-base font-['SVN-Gilroy']">Tất cả sản phẩm</span>
            </div>
          </Link>
          {tree?.map((category) => (
            <div key={category.id} className="flex flex-col border-b border-[#c0a060] py-3">
              <Link 
                href={`/products?category=${category.slug || category.id}`}
                data-testid={`category-filter-${category.slug || category.id}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-sm border ${currentCategory === (category.slug || category.id) ? 'border-[#99782b] bg-[#99782b]' : 'border-[#c9cfd2] bg-white'} flex items-center justify-center`}>
                    {currentCategory === (category.slug || category.id) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-base font-['SVN-Gilroy'] ${currentCategory === (category.slug || category.id) ? 'text-[#2b1809] font-bold' : 'text-[#475156] font-semibold'}`}>
                    {category.name}
                  </span>
                </div>
                {category.children.length > 0 && (
                  <ChevronDown className="w-4 h-4 text-[#292d32]" />
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="pt-2">
        <h3 className="text-[16px] font-bold text-[#99782b] font-['SVN-Gilroy'] mb-4 uppercase">Lọc theo giá</h3>
        <div className="px-2 mb-6">
          {/* Custom Slider Representation */}
          <div className="relative h-1.5 bg-[#e6e6e6] rounded-full mt-6 mb-4">
            <div className="absolute h-full bg-[#c0a060] rounded-full" style={{ left: '20%', right: '40%' }}></div>
            <div className="absolute w-4 h-4 bg-white border border-[#c0a060] rounded-full top-1/2 -translate-y-1/2 -ml-2" style={{ left: '20%' }}></div>
            <div className="absolute w-4 h-4 bg-white border border-[#c0a060] rounded-full top-1/2 -translate-y-1/2 -mr-2" style={{ right: '40%' }}></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base text-[#191c1f] font-['SVN-Gilroy']">
            Giá: {new Intl.NumberFormat('vi-VN').format(priceRange[0])}đ — {new Intl.NumberFormat('vi-VN').format(priceRange[1])}đ
          </span>
        </div>
        <div className="mt-4 border-b border-[#e4e7e9] pb-6">
          <button className="bg-[#9c702a] text-white px-4 py-2 rounded-sm font-semibold text-sm font-['SVN-Gilroy']">
            Lọc
          </button>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-2">
        <h3 className="text-[16px] font-bold text-[#99782b] font-['SVN-Gilroy'] mb-4 uppercase">Lọc theo thương hiệu</h3>
        <div className="flex flex-col gap-3">
          {brands?.slice(0, 5).map(brand => (
            <label key={brand.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm border border-[#c9cfd2] bg-white flex items-center justify-center group-hover:border-[#99782b]">
                  {/* <Check className="w-3.5 h-3.5 text-white" /> */}
                </div>
                <span className="text-base text-[#475156] font-medium font-['SVN-Gilroy']">{brand.name}</span>
              </div>
              <span className="text-sm text-[#a0a0a0] font-medium font-['SVN-Gilroy']">(30)</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
