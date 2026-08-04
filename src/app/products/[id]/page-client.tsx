"use client"

import { useEffect, useMemo, useState } from "react"
import { Heart, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { getProductModelOptions, resolveProductModelVariant } from "@/adapters/api/catalog.api"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductReviewsSection } from "@/components/product/product-reviews-section"
import { ProductTabs } from "@/components/product/product-tabs"
import { ConsultationForm } from "@/components/product/consultation-form"
import { DedupeTestIds } from "@/components/testing/dedupe-testids"
import { useProduct } from "@/application/hooks/useProduct"
import type { CatalogAvailableOption, CatalogVariant } from "@/domain/catalog"
import { useResolvedRouteParam } from "@/lib/route-param"

function formatPrice(value: string | number | null | undefined) {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? `${amount.toLocaleString("vi-VN")}đ` : "—"
}

function sanitizeHtml(html: string | null | undefined) {
  return (html ?? "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
}

export default function ProductDetailPageClient({ id }: { id: string }) {
  const resolvedId = useResolvedRouteParam(id, "/products")
  const { product, isLoading } = useProduct(resolvedId)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [availableOptions, setAvailableOptions] = useState<CatalogAvailableOption[]>([])
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!product?.id) return
    let active = true
    setSelectedOptions({})
    setSelectedVariant(null)
    setOptionsLoading(true)
    getProductModelOptions(product.id, {})
      .then((options) => { if (active) setAvailableOptions(options) })
      .catch((error) => {
        if (!active) return
        setAvailableOptions([])
        toast.error(error instanceof Error ? error.message : "Không thể tải tuỳ chọn sản phẩm")
      })
      .finally(() => { if (active) setOptionsLoading(false) })
    return () => { active = false }
  }, [product?.id])

  const chooseOption = async (key: string, label: string) => {
    if (!product) return
    const next = { ...selectedOptions, [key]: label }
    setSelectedOptions(next)
    setSelectedVariant(null)
    setOptionsLoading(true)
    try {
      const options = await getProductModelOptions(product.id, next)
      setAvailableOptions(options)
      const dimensionKeys = product.variantDimensions?.map((dimension) => dimension.key) ?? []
      if (dimensionKeys.length > 0 && dimensionKeys.every((dimension) => next[dimension])) {
        setSelectedVariant(await resolveProductModelVariant(product.id, next))
      }
    } catch (error) {
      setSelectedVariant(null)
      toast.error(error instanceof Error ? error.message : "Không thể xác định Variant")
    } finally {
      setOptionsLoading(false)
    }
  }

  const displayProduct = useMemo(() => {
    if (!product || !selectedVariant) return product
    return {
      ...product,
      sku: selectedVariant.sku,
      price: String(selectedVariant.sellingPrice?.amount ?? product.price),
      selectedVariantId: selectedVariant.id,
    }
  }, [product, selectedVariant])

  if (isLoading) {
    return <div className="container py-8 md:py-16"><div className="mx-auto max-w-5xl space-y-4"><div className="h-8 w-48 animate-pulse rounded-md bg-muted/60" /><div className="h-96 animate-pulse rounded-2xl bg-muted/40" /></div></div>
  }

  if (!product || !displayProduct) {
    return <main className="container max-w-lg py-16"><Card><CardContent className="py-8 text-sm text-muted-foreground">ProductModel not found or not publicly sellable.</CardContent></Card></main>
  }

  const images = product.images?.length ? product.images : product.image ? [product.image] : []
  const dimensions = product.variantDimensions ?? []
  const selectionComplete = dimensions.length === 0 || dimensions.every((dimension) => selectedOptions[dimension.key])

  return (
    <main className="min-h-screen bg-white py-8">
      <DedupeTestIds ids={["product-detail-title", "product-detail-price", "product-gallery", "product-tabs", "add-to-cart-btn"]} />
      <div className="container mx-auto max-w-[1190px] px-4">
        <Breadcrumbs items={[{ label: "Sản phẩm", href: "/products" }, { label: product.name }]} />

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          <ProductGallery images={images} />

          <div className="flex flex-col">
            <div className="mb-6">
              {displayProduct.sku && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#c0a060]">SKU: {displayProduct.sku}</p>}
              <h1 data-testid="product-detail-title" className="mb-4 text-2xl font-bold text-[#2b1809] md:text-3xl">{product.name}</h1>
              <div className="mb-4 flex items-center gap-4"><span className="text-base font-medium text-neutral-800">Giá:</span><p data-testid="product-detail-price" className="text-3xl font-bold text-[#9c702a]">{formatPrice(displayProduct.price)}</p></div>
              <hr className="my-4 border-neutral-200" />
            </div>

            <section className="mb-6 rounded-xl border border-neutral-100 bg-[#faf9f6] p-5">
              <h2 className="mb-3 text-base font-bold text-[#2b1809]">Chi tiết sản phẩm</h2>
              {product.description ? <div className="prose prose-sm mb-4 text-sm leading-relaxed text-neutral-600" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} /> : <p className="mb-4 text-sm text-neutral-500">Chưa có mô tả sản phẩm.</p>}
              {product.specs && product.specs.length > 0 ? (
                <table data-testid="product-specs-table" className="w-full border-t border-neutral-200/60 text-sm">
                  <tbody>{product.specs.map((spec) => <tr key={spec.key} className="border-b border-neutral-100 last:border-0"><th scope="row" className="w-1/3 py-2 text-left font-semibold text-neutral-500">{spec.key}</th><td data-testid={`spec-val-${spec.key}`} className="w-2/3 py-2 font-medium text-neutral-800">{spec.value}</td></tr>)}</tbody>
                </table>
              ) : <p data-testid="product-specs-empty" className="border-t border-neutral-200 pt-3 text-sm text-neutral-500">Chưa có thông số kỹ thuật.</p>}
            </section>

            {dimensions.length > 0 && (
              <section className="mb-6 space-y-4">
                {dimensions.map((dimension) => {
                  const serverOption = availableOptions.find((option) => option.key === dimension.key)
                  const values = serverOption?.values ?? []
                  return <div key={dimension.id} className="rounded-xl border border-neutral-100 bg-[#faf9f6] p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[#2b1809]">{dimension.key}</h2>{selectedOptions[dimension.key] && <span className="text-xs font-semibold text-[#9c702a]">{selectedOptions[dimension.key]}</span>}</div><div className="flex flex-wrap gap-2">{values.map((value) => <button key={value.id} type="button" disabled={optionsLoading} onClick={() => chooseOption(dimension.key, value.label)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedOptions[dimension.key] === value.label ? "border-[#9c702a] bg-[#9c702a] text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-[#9c702a]"}`}>{value.label}</button>)}</div></div>
                })}
                {!selectionComplete && <p className="text-xs font-medium text-amber-700">Chọn đủ tuỳ chọn để xác định đúng Variant và giá bán hiện tại.</p>}
              </section>
            )}

            {product.warrantySummary?.term && <div className="mb-6 flex gap-3 rounded-xl border border-[#e7ddc7] bg-[#fffaf0] p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#99782b]" /><div><p className="text-sm font-bold text-[#4e3b16]">Bảo hành {product.warrantySummary.term}</p>{product.warrantySummary.note && <p className="mt-1 text-xs text-[#71685a]">{product.warrantySummary.note}</p>}</div></div>}

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex h-[50px] items-center rounded-lg border border-neutral-200 bg-white px-2"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-8 w-8 text-lg font-bold text-neutral-500">−</button><span className="w-10 text-center font-semibold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-8 w-8 text-lg font-bold text-neutral-500">+</button></div>
              <div className="min-w-[220px] flex-1"><AddToCartButton product={displayProduct} showQuantity={false} quantity={quantity} disabled={!selectionComplete || (dimensions.length > 0 && !selectedVariant)} /></div>
              <button type="button" aria-label="Add to wishlist" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#99782b]"><Heart className="h-5 w-5" /></button>
            </div>

            <ConsultationForm productTitle={product.name} />
          </div>
        </div>

        <ProductTabs description={sanitizeHtml(product.description)} usageGuide="" reviewCount={product.reviewCount} />
        <ProductReviewsSection productId={product.id} />
      </div>
    </main>
  )
}
