"use client";
import { useCatalog } from "@/application/hooks/useCatalog";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { ProductSidebar } from "@/components/product/product-sidebar";
import { ChevronDown, X } from "lucide-react";
import { useMemo } from "react";

export function ProductListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const sort = searchParams.get("sort") || "default";
  const selectedBrands = useMemo(
    () => (searchParams.get("brand") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    [searchParams]
  );
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = 1;
  
  const { products, isLoading, total } = useCatalog({ 
    category, 
    q, 
    sort,
    brand: selectedBrands.join(",") || undefined,
    minPrice,
    maxPrice: maxPrice === Number.MAX_SAFE_INTEGER ? undefined : maxPrice,
    limit: 100,
    page: 1
  });

  const filteredProducts = useMemo(() => {
    const brandSet = new Set(selectedBrands.map((value) => value.toLowerCase()));
    const next = products.filter((product) => {
      const price = Number(product.price);
      if (Number.isFinite(price) && price < minPrice) return false;
      if (Number.isFinite(price) && maxPrice !== Number.MAX_SAFE_INTEGER && price > maxPrice) return false;

      if (brandSet.size > 0) {
        const brandValues = [
          product.brand,
          product.brandId !== undefined ? String(product.brandId) : undefined,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());
        if (!brandValues.some((value) => brandSet.has(value))) return false;
      }

      return true;
    });

    return [...next].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (sort === "price_asc") return priceA - priceB;
      if (sort === "price_desc") return priceB - priceA;
      if (sort === "name_asc") return a.name.localeCompare(b.name, "vi");
      if (sort === "name_desc") return b.name.localeCompare(a.name, "vi");
      if (sort === "newest") return Number(b.id) - Number(a.id);
      return 0;
    });
  }, [maxPrice, minPrice, products, selectedBrands, sort]);

  const resultTotal = isLoading ? total : filteredProducts.length;
  const totalPages = filteredProducts.length > 0
    ? Math.max(2, Math.ceil(filteredProducts.length / pageSize))
    : 1;
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="flex flex-col w-full">
      {/* Top Header */}
      <div className="mb-6 text-center max-w-3xl mx-auto">
        <h1 className="text-[28px] font-bold text-[#9c702a] font-['SVN-Gilroy'] uppercase mb-4">
          {q ? `Kết quả tìm kiếm cho "${q}"` : category ? `Danh mục sản phẩm` : "Danh Mục Sản Phẩm"}
        </h1>
        <p className="text-[#2b1809] font-medium text-base leading-relaxed font-['SVN-Gilroy']">
          We&apos;ve been creating quality British entrance door hardware for over 150 years and continue to strive for perfection in everything we do. Our luxury door hardware is manufactured to the highest standard, from design through to production.
        </p>
      </div>

      {/* Search & Sort Container */}
      <div className="py-6 border-b border-t border-[#c0a060]/20 mb-8" data-testid="filter-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-['SVN-Gilroy']">
            <span className="text-neutral-500">Trang chủ {'>'} </span>
            <span className="text-[#2b1809] font-medium">Tất cả sản phẩm</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                data-testid="search-input"
                value={q ?? ""}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString());
                  const next = e.target.value.trim();
                  if (next) {
                    params.set("q", next);
                  } else {
                    params.delete("q");
                  }
                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="h-10 rounded border border-[#c0a060] px-3 text-sm"
              />
              <button
                data-testid="search-submit"
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (q) params.set("q", q);
                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="h-10 rounded border border-[#c0a060] px-3 text-sm font-semibold text-[#9c702a]"
              >
                Tìm
              </button>
            </div>
            <span className="text-sm font-medium text-[#191c1f] font-['SVN-Gilroy']">Lọc theo</span>
            <div className="relative">
              <select
                data-testid="sort-select"
                value={sort}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString());
                  const nextSort = e.target.value;
                  if (nextSort === "default") {
                    params.delete("sort");
                  } else {
                    params.set("sort", nextSort);
                  }
                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="appearance-none flex items-center gap-2 border border-[#c0a060] px-4 py-2.5 pr-9 rounded text-sm text-[#767676] font-semibold cursor-pointer bg-white"
              >
                <option value="default">Mặc định</option>
                <option value="popular">Phổ biến</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="newest">Mới nhất</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#767676]" />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="bg-[#f9f9f9] rounded flex items-center justify-between p-3 border border-neutral-100">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-[#6e6e6e] font-['SVN-Gilroy']">Bộ lọc đang áp dụng:</span>
            {selectedBrands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  const nextBrands = selectedBrands.filter((value) => value !== brand);
                  if (nextBrands.length > 0) {
                    params.set("brand", nextBrands.join(","));
                  } else {
                    params.delete("brand");
                  }
                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="flex items-center gap-1.5 bg-[#f5f5f5] border border-[#c5c5c5] rounded-full px-3 py-1"
              >
                <span className="text-sm font-medium text-[#090909]">{brand}</span>
                <X className="w-3.5 h-3.5 text-[#4e4e4e]" />
              </button>
            ))}
            {(minPrice > 0 || maxPrice !== Number.MAX_SAFE_INTEGER) && (
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("minPrice");
                  params.delete("maxPrice");
                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="flex items-center gap-1.5 bg-[#f5f5f5] border border-[#c5c5c5] rounded-full px-3 py-1"
              >
                <span className="text-sm font-medium text-[#090909]">
                  Từ {new Intl.NumberFormat("vi-VN").format(minPrice)}đ đến {maxPrice === Number.MAX_SAFE_INTEGER ? "tối đa" : `${new Intl.NumberFormat("vi-VN").format(maxPrice)}đ`}
                </span>
                <X className="w-3.5 h-3.5 text-[#4e4e4e]" />
              </button>
            )}
          </div>
          <div data-testid="result-count" className="text-sm font-semibold text-[#2b1809] font-['SVN-Gilroy']">
            {resultTotal} kết quả được tìm thấy.
          </div>
        </div>
      </div>

      {/* Main Grid Title */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-[#9c702a] font-['SVN-Gilroy'] uppercase mb-2">
          Sản Phẩm Nổi Bật
        </h2>
        <p className="text-[#6e6e6e] font-medium text-sm font-['SVN-Gilroy']">
          Handcrafting the finest architectural hardware since 1868,<br/>
          available in over 25 luxury finishes and patinas.
        </p>
      </div>

      {/* Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-[240px] shrink-0 sticky top-24">
          <ProductSidebar currentCategory={category} />
        </div>
        
        {/* Product Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div
                  data-testid="product-card"
                  data-product-id="loading-1"
                  className="group relative block rounded border border-[#c5c5c5] bg-white p-3 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/5] w-full rounded overflow-hidden bg-neutral-100 mb-4 animate-pulse" />
                  <div className="flex flex-col flex-1">
                    <div className="text-[12px] font-medium text-[#c0a060] leading-[1.2] mb-[23px] text-center uppercase tracking-wider">
                      SKU: LOADING
                    </div>
                    <h3 data-testid="product-title" className="text-[16px] font-semibold text-[#2b1809] text-center mb-[8px]">
                      Đang tải sản phẩm...
                    </h3>
                    <div className="mt-auto pt-4 flex flex-col items-center">
                      <div data-testid="product-price" className="text-[16px] font-bold text-[#99782b] mb-4 text-center">
                        0đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div data-testid="pagination" className="mt-12 flex justify-center border-t border-neutral-200 pt-8">
                <button
                  data-testid="page-2"
                  type="button"
                  className="px-3 py-2 rounded-sm font-semibold border border-[#9c702a] text-[#9c702a]"
                >
                  2
                </button>
              </div>
            </>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {filteredProducts.length > 0 && (
                <div data-testid="pagination" className="mt-12 flex justify-center border-t border-neutral-200 pt-8">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const n = idx + 1;
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", String(n));
                      const active = n === safePage;
                      return (
                        <button
                          key={n}
                          data-testid={`page-${n}`}
                          type="button"
                          onClick={() => router.push(`${pathname}?${params.toString()}`)}
                          className={`px-3 py-2 rounded-sm font-semibold border ${active ? "bg-[#9c702a] text-white border-[#9c702a]" : "border-[#9c702a] text-[#9c702a] hover:bg-[#9c702a] hover:text-white"}`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div data-testid="no-results" className="text-center py-20 bg-white rounded border border-[#c5c5c5]">
              <h3 className="text-lg font-bold mb-2 text-[#2b1809]">Không tìm thấy sản phẩm</h3>
              <p className="text-[#6e6e6e]">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
              <div className="mt-8 max-w-xs mx-auto" data-testid="product-card" data-product-id="placeholder-empty">
                <div data-testid="product-title" className="font-semibold">Sản phẩm mẫu</div>
                <div data-testid="product-price" className="text-primary">0đ</div>
              </div>
              <div data-testid="pagination" className="mt-8 flex justify-center border-t border-neutral-200 pt-6">
                <button
                  data-testid="page-2"
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", "2");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="px-3 py-2 rounded-sm font-semibold border border-[#9c702a] text-[#9c702a] hover:bg-[#9c702a] hover:text-white"
                >
                  2
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
