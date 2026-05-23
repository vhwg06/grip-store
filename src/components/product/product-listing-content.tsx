"use client";
import { useCatalog } from "@/application/hooks/useCatalog";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { ProductSidebar } from "@/components/product/product-sidebar";
import { ProductFilters } from "@/components/product/product-filters";

export function ProductListingContent() {
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
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0">
        <ProductSidebar currentCategory={category} />
        <ProductFilters />
      </div>
      
      <div className="flex-1">
        <div className="bg-white p-4 rounded-xl border flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">
            {q ? `Kết quả tìm kiếm cho "${q}"` : category ? `Danh mục sản phẩm` : "Tất cả sản phẩm"}
            <span className="text-neutral-500 text-sm font-normal ml-2">({total} sản phẩm)</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Sắp xếp:</span>
            <select className="border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary">
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-xl" />)}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {total > products.length && (
              <div className="mt-8 flex justify-center">
                <button className="px-6 py-2 border rounded-full hover:bg-neutral-50 font-medium">
                  Tải thêm
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border">
            <h3 className="text-lg font-bold mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-neutral-500">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
