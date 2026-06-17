"use client";
import Link from "next/link";
import { useCatalog } from "@/application/hooks/useCatalog";
import { useBrands } from "@/application/hooks/useBrands";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function ProductSidebar({ currentCategory }: { currentCategory?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { categories } = useCatalog();
  const { brands } = useBrands();
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 10000000);
  const selectedBrands = new Set(
    (searchParams.get("brand") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  const sourceCategories = categories ?? [];
  const tree = sourceCategories.filter(c => !c.parentId).map(c => ({
    ...c,
    children: sourceCategories.filter(child => String(child.parentId) === String(c.id))
  }));

  const updateParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    updateParams({
      minPrice: String(priceRange[0]),
      maxPrice: String(priceRange[1]),
    });
  };

  const toggleBrand = (brandKey: string) => {
    const next = new Set(selectedBrands);
    if (next.has(brandKey)) {
      next.delete(brandKey);
    } else {
      next.add(brandKey);
    }
    updateParams({ brand: Array.from(next).join(",") || null });
  };

  return (
    <aside className="w-full flex flex-col gap-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-[16px] font-bold text-[#99782b] font-svn-gilroy mb-4">Danh mục sản phẩm</h3>
        <div className="flex flex-col">
          <Link 
            href="/products" 
            data-testid="category-all"
            className={`flex items-center justify-between py-3 border-b border-[#c0a060] ${!currentCategory ? 'text-[#2b1809] font-bold' : 'text-[#475156] font-semibold'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-sm border ${!currentCategory ? 'border-[#99782b] bg-[#99782b]' : 'border-[#c9cfd2] bg-white'} flex items-center justify-center`}>
                {!currentCategory && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-base font-svn-gilroy">Tất cả sản phẩm</span>
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
                  <span className={`text-base font-svn-gilroy ${currentCategory === (category.slug || category.id) ? 'text-[#2b1809] font-bold' : 'text-[#475156] font-semibold'}`}>
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
        <h3 className="text-[16px] font-bold text-[#99782b] font-svn-gilroy mb-4 uppercase">Lọc theo giá</h3>
        <div className="px-2 mb-6">
          <Slider
            data-testid="price-range-slider"
            value={priceRange}
            min={0}
            max={10000000}
            step={100000}
            minStepsBetweenThumbs={1}
            onValueChange={(value) => setPriceRange([value[0] ?? 0, value[1] ?? 10000000])}
            className="mt-6 mb-4"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base text-[#191c1f] font-svn-gilroy">
            Giá: {new Intl.NumberFormat('vi-VN').format(priceRange[0])}đ — {new Intl.NumberFormat('vi-VN').format(priceRange[1])}đ
          </span>
        </div>
        <div className="mt-4 border-b border-[#e4e7e9] pb-6">
          <button
            data-testid="price-filter-submit"
            type="button"
            onClick={applyPriceFilter}
            className="bg-[#9c702a] text-white px-4 py-2 rounded-sm font-semibold text-sm font-svn-gilroy"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-2">
        <h3 className="text-[16px] font-bold text-[#99782b] font-svn-gilroy mb-4 uppercase">Lọc theo thương hiệu</h3>
        <div className="flex flex-col gap-3">
          {brands?.slice(0, 5).map(brand => (
            <button
              key={brand.id}
              type="button"
              data-testid={`brand-filter-${brand.slug || brand.id}`}
              onClick={() => toggleBrand(String(brand.id))}
              className="flex items-center justify-between cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center group-hover:border-[#99782b] ${selectedBrands.has(String(brand.id)) ? "border-[#99782b] bg-[#99782b]" : "border-[#c9cfd2] bg-white"}`}>
                  {selectedBrands.has(String(brand.id)) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-base text-[#475156] font-medium font-svn-gilroy">{brand.name}</span>
              </div>
              <span className="text-sm text-[#a0a0a0] font-medium font-svn-gilroy">({brand.productCount ?? 0})</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
