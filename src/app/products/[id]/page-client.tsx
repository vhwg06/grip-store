"use client";
import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTabs } from "@/components/product/product-tabs";
import { ConsultationForm } from "@/components/product/consultation-form";
import { ProductReviewsSection } from "@/components/product/product-reviews-section";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { DedupeTestIds } from "@/components/testing/dedupe-testids";
import { useProduct } from "@/application/hooks/useProduct";
import { Card, CardContent } from "@/components/ui/card";
import { useResolvedRouteParam } from "@/lib/route-param";
import { Heart, Facebook, Twitter, Pin as Pinterest, Instagram } from "lucide-react";

export default function ProductDetailPageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/products");
  const { product, isLoading } = useProduct(resolvedId);

  const [selectedSize, setSelectedSize] = useState("156mm");
  const [selectedColor, setSelectedColor] = useState("Trắng");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      const getSpecValue = (keys: string[], fallback: string) => {
        if (!product.specs) return fallback;
        const found = product.specs.find(s => keys.some(k => s.key.toLowerCase().includes(k.toLowerCase())));
        return found ? found.value : fallback;
      };
      setSelectedSize(getSpecValue(["kích thước", "kich thuoc", "size"], "156mm"));
      setSelectedColor(getSpecValue(["màu", "mau", "color"], "Trắng"));
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container py-8 md:py-16">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <main className="container py-16 max-w-lg">
        <Card className="tech-card">
          <CardContent className="py-8 text-sm text-muted-foreground">Product not found.</CardContent>
        </Card>
      </main>
    );
  }

  const sanitizeHtml = (html: string | null | undefined) =>
    (html ?? "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];

  // Parse specifications or fallback
  const getSpecValue = (keys: string[], fallback: string) => {
    if (!product.specs) return fallback;
    const found = product.specs.find(s => keys.some(k => s.key.toLowerCase().includes(k.toLowerCase())));
    return found ? found.value : fallback;
  };

  const formatPrice = (priceStr: string | null | undefined) => {
    if (!priceStr) return "0đ";
    const num = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return priceStr;
    return num.toLocaleString("vi-VN") + "đ";
  };

  return (
    <main className="py-8 bg-white min-h-screen">
      <DedupeTestIds
        ids={["product-detail-title", "product-detail-price", "product-gallery", "product-tabs", "add-to-cart-btn"]}
      />
      <div className="container mx-auto max-w-[1190px] px-4">
        <Breadcrumbs
          items={[
            { label: "Sản phẩm", href: "/products" },
            ...(product.category ? [{ label: product.category, href: `/products?category=${product.categoryId}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <div>
            <ProductGallery images={images} />
          </div>

          <div className="flex flex-col">
            <div className="mb-6">
              {product.sku && (
                <p className="text-xs font-semibold uppercase tracking-wider text-[#c0a060] mb-2 font-svn-gilroy">
                  SKU: {product.sku}
                </p>
              )}
              <h1 data-testid="product-detail-title" className="text-2xl md:text-3xl font-bold font-svn-gilroy text-[#2b1809] mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-base font-medium text-neutral-800">Giá từ:</span>
                <p data-testid="product-detail-price" className="text-3xl font-bold text-[#9c702a]">
                  {formatPrice(product.price)}
                </p>
                {product.compareAtPrice && <p className="text-lg text-neutral-400 line-through">{formatPrice(product.compareAtPrice)}</p>}
                {product.discountPercent && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">-{product.discountPercent}%</span>
                )}
              </div>
              <hr className="border-neutral-200 my-4" />
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="mb-6 bg-[#f9f9f9] rounded-lg p-5">
              <h3 className="text-base font-bold text-[#2b1809] mb-3 font-svn-gilroy">Chi tiết sản phẩm</h3>
              {product.description ? (
                <div 
                  className="prose prose-sm text-neutral-600 mb-4 line-clamp-3 text-sm leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} 
                />
              ) : (
                <p className="text-sm text-neutral-500 mb-4">Chất lượng tinh xảo, chất liệu cao cấp mang lại vẻ đẹp và độ bền vượt trội.</p>
              )}
              
              <table data-testid="product-specs-table" className="w-full text-sm border-t border-neutral-200/60 pt-3 mt-3">
                <tbody>
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((spec) => (
                      <tr key={spec.key} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2 font-semibold text-neutral-500 w-1/3">{spec.key}</td>
                        <td data-testid={`spec-val-${spec.key}`} className="py-2 font-medium text-neutral-800 w-2/3">
                          {spec.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="border-b border-neutral-100">
                        <td className="py-2 font-semibold text-neutral-500 w-1/3">Chất liệu</td>
                        <td className="py-2 font-medium text-neutral-800 w-2/3">{getSpecValue(["chất liệu", "chat lieu"], "Đồng thau nguyên chất")}</td>
                      </tr>
                      <tr className="border-b border-neutral-100">
                        <td className="py-2 font-semibold text-neutral-500 w-1/3">Kích thước</td>
                        <td className="py-2 font-medium text-neutral-800 w-2/3">{selectedSize}</td>
                      </tr>
                      <tr className="border-b border-neutral-100 last:border-0">
                        <td className="py-2 font-semibold text-neutral-500 w-1/3">Phong cách</td>
                        <td className="py-2 font-medium text-neutral-800 w-2/3">{getSpecValue(["phong cách", "phong cach", "kiểu dáng", "kieu dang"], "Bắc Âu, sang trọng nhẹ nhàng")}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Chọn kích thước */}
            <div className="mb-4 bg-[#f9f9f9] rounded-lg p-5">
              <h3 className="text-base font-bold text-[#2b1809] mb-3 font-svn-gilroy">Chọn kích thước</h3>
              <div className="flex flex-wrap gap-2.5">
                {["29mm", "58mm", "156mm", "185mm", "281mm", "377mm"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium rounded transition-all cursor-pointer ${
                      selectedSize === size
                        ? "border-2 border-[#9c702a] bg-[#9c702a]/5 text-[#9c702a] font-bold shadow-sm"
                        : "border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn màu sắc */}
            <div className="mb-6 bg-[#f9f9f9] rounded-lg p-5">
              <h3 className="text-base font-bold text-[#2b1809] mb-3 font-svn-gilroy">Chọn màu sắc</h3>
              <div className="flex flex-wrap gap-2.5">
                {["Hồng", "Trắng"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm font-medium rounded transition-all cursor-pointer ${
                      selectedColor === color
                        ? "border-2 border-[#9c702a] bg-[#9c702a]/5 text-[#9c702a] font-bold shadow-sm"
                        : "border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-200 bg-white rounded-lg h-[50px] px-2">
                <button 
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-800 text-lg font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-semibold text-[#2b1809]">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)} 
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-800 text-lg font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <div className="flex-1 min-w-[200px]">
                <AddToCartButton 
                  product={product} 
                  showQuantity={false} 
                  quantity={quantity}
                />
              </div>

              {/* Wishlist Button */}
              <button 
                data-testid="add-wishlist-btn"
                type="button"
                className="w-[40px] h-[40px] rounded-full bg-[#f5f5f5] hover:bg-[#ebebeb] flex items-center justify-center text-[#99782b] transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Bundled Gifts */}
            {product.bundledGifts && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 text-orange-800 text-sm">
                <strong className="block mb-1">Quà tặng kèm:</strong>
                {product.bundledGifts}
              </div>
            )}

            {/* Consultation Form */}
            <ConsultationForm productTitle={product.name} />

            {/* Share Section */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium text-[#1a1a1a] font-svn-gilroy">Chia sẻ:</span>
              <div className="flex gap-2">
                <a href="#" className="w-8 h-8 rounded-full bg-[#007dfb] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Facebook className="w-4 h-4 fill-current" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#f5f5f5] text-[#4d4d4d] flex items-center justify-center hover:bg-neutral-200 transition-colors">
                  <Twitter className="w-4 h-4 fill-current" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#f5f5f5] text-[#4d4d4d] flex items-center justify-center hover:bg-neutral-200 transition-colors">
                  <Pinterest className="w-4 h-4 fill-current" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#f5f5f5] text-[#4d4d4d] flex items-center justify-center hover:bg-neutral-200 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <ProductTabs description={sanitizeHtml(product.description)} usageGuide={sanitizeHtml(product.usageGuide)} reviewCount={product.reviewCount} />

        {product.introArticle && (
          <section className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 md:p-8" data-testid="product-intro-article">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Intro article</p>
              <h2 className="mt-2 text-2xl font-bold text-[#211e18]">{product.introArticle.title}</h2>
            </div>

            {product.introArticle.featuredImage && (
              <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <img
                  src={product.introArticle.featuredImage}
                  alt={product.introArticle.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-neutral max-w-none text-neutral-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.introArticle.content) }}
            />
          </section>
        )}

        <ProductReviewsSection productId={product.id} />
      </div>
    </main>
  );
}
