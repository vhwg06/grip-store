"use client"

import { saveProduct } from "@/adapters/api/admin.api"
import { useAdminProductForm, useAdminProducts } from "@/application/hooks/useAdmin"
import MediaUploader from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminProduct } from "@/domain/admin"
import { ImageIcon, Search } from "lucide-react"
import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type ContentTab = "intro" | "detail"

export function AdminProductMediaContent() {
  const { data: productsPayload, isLoading: productsLoading } = useAdminProducts()
  const products = productsPayload?.products ?? []
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [contentTab, setContentTab] = useState<ContentTab>("intro")
  const deferredQuery = useDeferredValue(query)

  const filteredProducts = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    if (!normalized) return products
    return products.filter((product) =>
      [product.name, product.sku ?? "", String(product.categoryId ?? "")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    )
  }, [deferredQuery, products])

  useEffect(() => {
    if (!selectedId && filteredProducts.length > 0) {
      setSelectedId(filteredProducts[0].id)
    }
  }, [filteredProducts, selectedId])

  const { data: productForm, mutate } = useAdminProductForm(selectedId ?? undefined)
  const selectedProduct = productForm?.product

  const [mainImage, setMainImage] = useState("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [introContent, setIntroContent] = useState("")
  const [detailContent, setDetailContent] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMainImage(selectedProduct?.image || "")
    setGalleryImages(selectedProduct?.images || [])
    setIntroContent(selectedProduct?.description || "")
    setDetailContent(selectedProduct?.usageGuide || "")
  }, [selectedProduct?.id])

  const handleSave = async () => {
    if (!selectedProduct?.id) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.set("id", selectedProduct.id)
      formData.set("image", mainImage)
      formData.set("images", galleryImages.join("\n"))
      formData.set("description", introContent)
      formData.set("usageGuide", detailContent)
      await saveProduct(formData)
      toast.success("Product content updated")
      await mutate()
    } catch (error: any) {
      toast.error(error?.message || "Could not save product content")
    } finally {
      setSaving(false)
    }
  }

  if (productsLoading) {
    return <div className="h-[680px] rounded-xl bg-[#f3f1ec]" />
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#211e18]">Product Media & Content</h1>
        <p className="max-w-[680px] text-sm text-[#71685a]">
          Adjust product-linked media and tab content without drifting into core catalog editing.
        </p>
      </div>

      <div className="rounded-lg border border-[#e7e1d7] bg-white px-6 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9184]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, SKU, category..."
            className="h-[54px] border-0 pl-10 text-sm font-semibold text-[#3a352b] shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="text-sm font-semibold text-[#3a352b]">
          {selectedProduct
            ? `Editing: ${selectedProduct.name} / SKU ${selectedProduct.sku || "N/A"}`
            : "Choose a product to edit content"}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_362px_226px]">
        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Media</h2>
          <div className="mt-5 space-y-6">
            <div data-testid="product-main-media" className="space-y-3">
              <div className="h-[190px] overflow-hidden rounded-lg bg-[#f3f1ec]">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage} alt={selectedProduct?.name || "Main"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#8a806f]">Main image</div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[#3a352b]">
                  Main image
                  <div className="text-xs font-normal text-[#71685a]">Updates card and detail page.</div>
                </div>
              </div>
              <MediaUploader label="Replace media" value={mainImage} onChange={(value) => setMainImage(String(value))} />
            </div>

            <div data-testid="product-gallery-media" className="space-y-3 border-t border-[#f0ebe1] pt-5">
              <div className="text-sm font-semibold text-[#211e18]">Gallery order</div>
              <div className="flex flex-wrap gap-4">
                {galleryImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative h-[76px] w-[76px] overflow-hidden rounded-lg bg-[#f3f1ec]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
                {!galleryImages.length ? (
                  <div className="flex h-[76px] w-[76px] items-center justify-center rounded-lg border border-dashed border-[#d8c9ad] bg-[#fbfaf7] text-[11px] font-semibold text-[#99782b]">
                    Add media
                  </div>
                ) : null}
              </div>
              <MediaUploader
                label="Gallery images"
                value={galleryImages}
                onChange={(value) => setGalleryImages(value as string[])}
                multiple
                maxFiles={8}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Rich content</h2>
          <div className="mt-5 flex gap-2">
            <Button
              type="button"
              onClick={() => setContentTab("intro")}
              className={`h-[34px] rounded-lg px-4 text-xs font-semibold ${
                contentTab === "intro"
                  ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                  : "border border-[#e7e1d7] bg-white text-[#71685a]"
              }`}
            >
              Introduction
            </Button>
            <Button
              type="button"
              onClick={() => setContentTab("detail")}
              className={`h-[34px] rounded-lg px-4 text-xs font-semibold ${
                contentTab === "detail"
                  ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                  : "border border-[#e7e1d7] bg-white text-[#71685a]"
              }`}
            >
              Detail content
            </Button>
          </div>

          <div className="mt-6 rounded-lg border border-[#e7e1d7] bg-[#fbfaf7] px-5 py-3 text-xs font-semibold text-[#4c4437]">
            B  I  H2  H3  List  Link  Image
          </div>

          <Textarea
            data-testid="field-description"
            value={contentTab === "intro" ? introContent : detailContent}
            onChange={(event) =>
              contentTab === "intro"
                ? setIntroContent(event.target.value)
                : setDetailContent(event.target.value)
            }
            className="mt-4 min-h-[222px] resize-none rounded-lg border-[#e7e1d7] text-sm leading-6 text-[#3a352b]"
          />

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedProduct?.id}
              className="h-10 rounded-lg bg-[#99782b] px-5 text-sm font-semibold text-white hover:bg-[#99782b]/90"
            >
              {saving ? "Saving..." : "Save content"}
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Public preview</h2>
          <div className="mt-5 space-y-4">
            <div className="h-[150px] overflow-hidden rounded-lg bg-[#f3f1ec]">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={selectedProduct?.name || "Preview"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#8a806f]">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Placeholder
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {galleryImages.slice(0, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="h-[46px] w-[46px] overflow-hidden rounded-md bg-[#f3f1ec]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Thumb ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-xs font-medium leading-5 text-[#71685a]">
              Show thumbs only when gallery &gt; 1.
              <br />
              <br />
              Render tab HTML safely.
            </div>
            <div className="rounded-lg bg-[#fffdf8] px-4 py-3 text-xs font-semibold leading-5 text-[#3a2f18]">
              Empty main image:
              <br />
              show placeholder,
              <br />
              keep layout stable.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
