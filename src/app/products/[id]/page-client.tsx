"use client";

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

export default function ProductDetailPageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/products");
  const { product, isLoading } = useProduct(resolvedId);

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
              {product.brand && <p className="text-sm text-neutral-500 font-medium mb-2 uppercase">{product.brand}</p>}
              <h1 data-testid="product-detail-title" className="text-2xl md:text-3xl font-bold mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <p data-testid="product-detail-price" className="text-3xl font-bold text-primary">
                  {product.price}
                </p>
                {product.compareAtPrice && <p className="text-lg text-neutral-400 line-through">{product.compareAtPrice}</p>}
                {product.discountPercent && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">-{product.discountPercent}%</span>
                )}
              </div>
              {product.sku && <p className="text-sm text-neutral-500">Mã SP: {product.sku}</p>}
            </div>

            {product.description && (
              <div className="prose prose-sm text-neutral-600 mb-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} />
            )}

            {product.bundledGifts && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-8 text-orange-800 text-sm">
                <strong className="block mb-1">Quà tặng kèm:</strong>
                {product.bundledGifts}
              </div>
            )}

            <div className="mb-8 border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
              <h3 className="text-base font-bold text-[#2b1809] mb-3 uppercase tracking-wider font-svn-gilroy">Thông số kỹ thuật</h3>
              <table data-testid="product-specs-table" className="w-full text-sm">
                <tbody>
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((spec) => (
                      <tr key={spec.key} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2.5 font-semibold text-neutral-500 w-1/3">{spec.key}</td>
                        <td data-testid={`spec-val-${spec.key}`} className="py-2.5 font-medium text-neutral-800 w-2/3">
                          {spec.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-neutral-100 last:border-0">
                      <td className="py-2.5 font-semibold text-neutral-500 w-1/3">Trạng thái</td>
                      <td className="py-2.5 font-medium text-neutral-800 w-2/3">Chưa có thông số</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 mb-8">
              <AddToCartButton product={product} />
              <button data-testid="add-wishlist-btn" type="button" className="rounded-full border px-5 py-3 font-semibold">
                Yêu thích
              </button>
            </div>

            <ConsultationForm productTitle={product.name} />
          </div>
        </div>

        <ProductTabs description={sanitizeHtml(product.description)} usageGuide={sanitizeHtml(product.usageGuide)} reviewCount={product.reviewCount} />

        <ProductReviewsSection productId={product.id} />
      </div>
    </main>
  );
}
