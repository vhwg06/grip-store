"use client";
import { useCatalog } from "@/application/hooks/useCatalog";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { ProductSidebar } from "@/components/product/product-sidebar";
import { ChevronDown, X } from "lucide-react";

export function ProductListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const sort = searchParams.get("sort") || "default";
  
  const { products, isLoading, total } = useCatalog({ 
    category, 
    q, 
    sort,
    limit: 20,
    page: 1
  });

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
            {/* Example chips */}
            <div className="flex items-center gap-1.5 bg-[#f5f5f5] border border-[#c5c5c5] rounded-full px-3 py-1">
              <span className="text-sm font-medium text-[#090909]">Thương hiệu A</span>
              <X className="w-3.5 h-3.5 text-[#4e4e4e] cursor-pointer" />
            </div>
            <div className="flex items-center gap-1.5 bg-[#f5f5f5] border border-[#c5c5c5] rounded-full px-3 py-1">
              <span className="text-sm font-medium text-[#090909]">Từ 2,000,000đ đến 5,000,000đ</span>
              <X className="w-3.5 h-3.5 text-[#4e4e4e] cursor-pointer" />
            </div>
          </div>
          <div data-testid="result-count" className="text-sm font-semibold text-[#2b1809] font-['SVN-Gilroy']">
            Tìm thấy {total} kết quả.
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-neutral-100 animate-pulse rounded border border-[#c5c5c5]" />)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {total > products.length && (
                <div className="mt-12 flex justify-center border-t border-neutral-200 pt-8">
                  <button className="px-8 py-3 border border-[#9c702a] text-[#9c702a] rounded-sm hover:bg-[#9c702a] hover:text-white transition-colors font-semibold">
                    Tải thêm sản phẩm
                  </button>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
