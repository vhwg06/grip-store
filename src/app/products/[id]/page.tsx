import { getProduct } from "@/adapters/api/catalog.api";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTabs } from "@/components/product/product-tabs";
import { ConsultationForm } from "@/components/product/consultation-form";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductSection } from "@/components/home/product-section";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProduct(id);
  if (!data?.product) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: `${data.product.name} | GRIP`,
    description: data.product.description || "Khám phá sản phẩm tại GRIP",
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProduct(id);
  
  if (!data?.product) {
    notFound();
  }

  const { product } = data;
  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);

  return (
    <main className="py-8 bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4">
        <Breadcrumbs items={[
          { label: "Sản phẩm", href: "/products" },
          ...(product.category ? [{ label: product.category, href: `/products?category=${product.categoryId}` }] : []),
          { label: product.name }
        ]} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Left: Gallery */}
          <div>
            <ProductGallery images={images} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              {product.brand && <p className="text-sm text-neutral-500 font-medium mb-2 uppercase">{product.brand}</p>}
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-3xl font-bold text-primary">{product.price}</p>
                {product.compareAtPrice && (
                  <p className="text-lg text-neutral-400 line-through">{product.compareAtPrice}</p>
                )}
                {product.discountPercent && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">-{product.discountPercent}%</span>
                )}
              </div>
              {product.sku && <p className="text-sm text-neutral-500">Mã SP: {product.sku}</p>}
            </div>

            {product.description && (
              <div className="prose prose-sm text-neutral-600 mb-8" dangerouslySetInnerHTML={{ __html: product.description }} />
            )}

            {product.bundledGifts && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-8 text-orange-800 text-sm">
                <strong className="block mb-1">🎁 Quà tặng kèm:</strong>
                {product.bundledGifts}
              </div>
            )}

            <div className="flex gap-4 mb-8">
              <AddToCartButton product={product} />
            </div>

            <ConsultationForm productTitle={product.name} />
          </div>
        </div>

        <ProductTabs 
          description={product.description} 
          usageGuide={product.usageGuide} 
          reviewCount={product.reviewCount} 
        />
        
        {/* Placeholder for related products - would typically fetch based on categoryId */}
        <div className="mt-20">
          <ProductSection title="Sản phẩm tương tự" products={[]} />
        </div>
      </div>
    </main>
  );
}
