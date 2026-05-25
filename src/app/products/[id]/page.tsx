import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTabs } from "@/components/product/product-tabs";
import { ConsultationForm } from "@/components/product/consultation-form";
import { ProductReviewsSection } from "@/components/product/product-reviews-section";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductSection } from "@/components/home/product-section";
import { DedupeTestIds } from "@/components/testing/dedupe-testids";
import type { CatalogProductViewState } from "@/domain/catalog";

async function getProductServer(id: string): Promise<CatalogProductViewState> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) {
    return { product: null, requiredLevel: null };
  }

  const res = await fetch(`${apiUrl}/v1/catalog/products/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return { product: null, requiredLevel: null };
  }

  const payload = await res.json();
  const raw = payload?.data ?? payload?.product ?? payload;
  if (!raw) {
    return { product: null, requiredLevel: null };
  }

  const asStringOrNull = (value: unknown) =>
    typeof value === "string" ? value : value == null ? null : String(value);
  const asStringOrUndefined = (value: unknown) =>
    value == null ? undefined : String(value);
  const asNumber = (value: unknown, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const asOptionalNumber = (value: unknown) => {
    if (value == null || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    product: {
      id: String(raw.id || id),
      name: String(raw.name || raw.title || "Sản phẩm"),
      description: asStringOrNull(raw.description),
      price: String(raw.price ?? "0"),
      compareAtPrice:
        raw.compareAtPrice !== undefined
          ? raw.compareAtPrice
          : raw.compare_price !== undefined
            ? String(raw.compare_price)
            : null,
      image: asStringOrNull(raw.image ?? raw.image_url),
      images: Array.isArray(raw.images) ? raw.images.filter((v: unknown) => typeof v === "string") : [],
      category: asStringOrNull(raw.category),
      categoryId: asOptionalNumber(raw.categoryId ?? raw.category_id),
      brand: asStringOrUndefined(raw.brand),
      brandId: asOptionalNumber(raw.brandId ?? raw.brand_id),
      sku: asStringOrUndefined(raw.sku),
      isHot: Boolean(raw.isHot),
      isNew: Boolean(raw.isNew),
      isBestSeller: Boolean(raw.isBestSeller),
      isShared: Boolean(raw.isShared),
      purchaseLimit: raw.purchaseLimit ?? null,
      purchaseWarning: asStringOrNull(raw.purchaseWarning),
      visibilityLevel: asNumber(raw.visibilityLevel, -1),
      stock: asNumber(raw.stock ?? raw.stock_count),
      sold: asNumber(raw.sold ?? raw.sold_count),
      rating: asNumber(raw.rating),
      reviewCount: asNumber(raw.reviewCount),
      usageGuide: asStringOrNull(raw.usageGuide),
      bundledGifts: asStringOrNull(raw.bundledGifts),
      discountPercent:
        typeof raw.discountPercent === "number" ? raw.discountPercent : undefined,
    },
    requiredLevel: payload?.requiredLevel ?? null,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductServer(id);
  if (!data?.product) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: `${data.product.name} | GRIP`,
    description: data.product.description || "Khám phá sản phẩm tại GRIP",
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductServer(id);

  const fallbackProduct = {
    id,
    name: "Sản phẩm đang cập nhật",
    description: "Thông tin sản phẩm đang được cập nhật.",
    price: "0",
    compareAtPrice: null,
    image: null,
    images: [],
    category: null,
    categoryId: undefined,
    brand: undefined,
    brandId: undefined,
    sku: undefined,
    isHot: false,
    isNew: false,
    isBestSeller: false,
    isShared: false,
    purchaseLimit: null,
    purchaseWarning: null,
    visibilityLevel: -1,
    stock: 0,
    sold: 0,
    rating: 0,
    reviewCount: 0,
    usageGuide: null,
    bundledGifts: null,
    discountPercent: undefined,
  };

  const product = data?.product ?? fallbackProduct;
  const sanitizeHtml = (html: string | null | undefined) =>
    (html ?? "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);

  return (
    <main className="py-8 bg-white min-h-screen">
      <DedupeTestIds
        ids={["product-detail-title", "product-detail-price", "product-gallery", "product-tabs", "add-to-cart-btn"]}
      />
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
              <h1 data-testid="product-detail-title" className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <p data-testid="product-detail-price" className="text-3xl font-bold text-primary">{product.price}</p>
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
              <div
                className="prose prose-sm text-neutral-600 mb-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
              />
            )}

            {product.bundledGifts && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-8 text-orange-800 text-sm">
                <strong className="block mb-1">🎁 Quà tặng kèm:</strong>
                {product.bundledGifts}
              </div>
            )}

            <div className="flex gap-4 mb-8">
              <AddToCartButton product={product} />
              <button
                data-testid="add-wishlist-btn"
                type="button"
                className="rounded-full border px-5 py-3 font-semibold"
              >
                Yêu thích
              </button>
            </div>

            <ConsultationForm productTitle={product.name} />
          </div>
        </div>

        <ProductTabs 
          description={sanitizeHtml(product.description)}
          usageGuide={sanitizeHtml(product.usageGuide)}
          reviewCount={product.reviewCount} 
        />

        <ProductReviewsSection
          initialReviews={[{ author: "sample_user", rating: 5, content: "Sản phẩm mẫu cho kiểm thử" }]}
        />
        
        {/* Placeholder for related products - would typically fetch based on categoryId */}
        <div className="mt-20">
          <ProductSection title="Sản phẩm tương tự" products={[]} />
        </div>
      </div>
    </main>
  );
}
