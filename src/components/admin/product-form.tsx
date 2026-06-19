'use client'

import { getProductForAdminAction, saveProduct } from "@/adapters/api/admin.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import MediaUploader from "@/components/admin/media-uploader"
import Link from "next/link"
import { buildExportRoutePath } from "@/lib/export-route"

interface ProductFormProps {
    product?: any
    categories?: Array<{ id?: string | number; name: string; slug?: string }>
    isCreate?: boolean
}

export default function ProductForm({ product, categories = [], isCreate = false }: ProductFormProps) {
    const router = useRouter()
    const { t } = useI18n()
    const submitLock = useRef(false)
    const mediaLock = useRef(false)

    const [currentProduct, setCurrentProduct] = useState(product)
    const [formSeed, setFormSeed] = useState(0)
    const [generalSaving, setGeneralSaving] = useState(false)
    const [mediaSaving, setMediaSaving] = useState(false)

    const [visibilityLevel, setVisibilityLevel] = useState(String(product?.visibilityLevel ?? -1))
    const [mainImage, setMainImage] = useState(product?.image || "")
    const [galleryImages, setGalleryImages] = useState<string[]>(product?.images || [])
    const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(product?.specs || [])

    // Validation state for the publish checklist panel
    const hasSlug = Boolean(currentProduct?.id)
    const hasPrice = Boolean(currentProduct?.price && Number(currentProduct.price) > 0)
    const hasPrimaryImage = Boolean(mainImage)
    const hasCategory = Boolean(currentProduct?.categoryId)

    const publishReady = hasSlug && hasPrice && hasPrimaryImage && hasCategory

    useEffect(() => {
        setCurrentProduct(product)
        setMainImage(product?.image || "")
        setGalleryImages(product?.images || [])
        setVisibilityLevel(String(product?.visibilityLevel ?? -1))
        setFormSeed(s => s + 1)
        if (product?.specs) setSpecs(product.specs)
        else setSpecs([])
    }, [product?.id])

    // Refresh product data from backend after load (for edit)
    useEffect(() => {
        if (!product?.id) return
        let active = true
        ;(async () => {
            try {
                const latest = await getProductForAdminAction(product.id)
                if (!active || !latest) return
                setCurrentProduct(latest as any)
                setMainImage((latest as any)?.image || "")
                setGalleryImages((latest as any)?.images || [])
                setVisibilityLevel(String((latest as any)?.visibilityLevel ?? -1))
                setFormSeed(s => s + 1)
                if ((latest as any)?.specs) setSpecs((latest as any).specs)
            } catch { /* ignore */ }
        })()
        return () => { active = false }
    }, [product?.id])

    // --- General fields save ---
    async function handleSaveGeneral(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (submitLock.current) return
        submitLock.current = true
        setGeneralSaving(true)
        try {
            const form = e.currentTarget
            const formData = new FormData(form)
            // Keep existing images if not changed in general save
            formData.delete("image")
            formData.delete("images")
            formData.set("image", mainImage)
            formData.set("images", galleryImages.join("\n"))

            const cleanedSpecs = specs.filter(s => s.key.trim() !== "")
            formData.set("specs", JSON.stringify(cleanedSpecs))

            const res = await saveProduct(formData)
            if (res.success === false) {
                toast.error((res as any).error || t('common.error'))
            } else {
                toast.success(isCreate ? "Draft created!" : "General info saved!")
                if (isCreate) {
                    // Redirect to edit page with the returned product id
                    const createdId = (res as any).id || (res as any).data?.id
                    if (createdId) {
                        router.push(buildExportRoutePath("/admin/product/edit", String(createdId)))
                    } else {
                        router.push("/admin/products")
                    }
                } else {
                    router.refresh()
                }
            }
        } catch (e: any) {
            toast.error(e?.message || t('common.error'))
        } finally {
            setGeneralSaving(false)
            submitLock.current = false
        }
    }

    // --- Media save (edit mode only) ---
    async function handleSaveMedia() {
        if (!currentProduct?.id || mediaLock.current) return
        mediaLock.current = true
        setMediaSaving(true)
        try {
            const formData = new FormData()
            formData.set("id", currentProduct.id)
            formData.set("image", mainImage)
            formData.set("images", galleryImages.join("\n"))
            const res = await saveProduct(formData)
            if (res.success === false) {
                toast.error((res as any).error || t('common.error'))
            } else {
                toast.success("Media saved!")
                router.refresh()
            }
        } catch (e: any) {
            toast.error(e?.message || t('common.error'))
        } finally {
            setMediaSaving(false)
            mediaLock.current = false
        }
    }

    const handleAddSpec = () => setSpecs(prev => [...prev, { key: "", value: "" }])
    const handleSpecChange = (i: number, field: "key" | "value", val: string) => {
        setSpecs(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n })
    }
    const handleRemoveSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i))

    return (
        <div className="w-[1056px]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
                <span>Admin</span>
                <span>/</span>
                <span>Catalog</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                    {isCreate ? "Product Create" : "Product Editor"}
                </span>
            </div>

            {/* Title & CTA row */}
            <div className="flex items-center justify-between mt-[57px] mb-[12px] leading-none">
                <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy">
                    {isCreate ? "Product Create" : "Product Editor"}
                </h1>
                <Button
                    type="submit"
                    form="product-general-form"
                    disabled={generalSaving}
                    className="w-[153px] h-10 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-sm font-semibold border-none"
                >
                    {generalSaving
                        ? "Saving..."
                        : isCreate ? "Create draft" : "Save product"}
                </Button>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-[#71685a] mt-[12px] mb-[34px]">
                {isCreate
                    ? "Create a new product with commercial fields, media, and SEO checks in separate save-safe groups."
                    : "Edit an existing product with loaded state, blocked publish rules, media handoff, and route-safe error handling."}
            </p>

            {/* Stats Cards Row */}
            <div className="flex gap-6 mb-8 w-[1056px]">
                <div className="w-[220px] h-[100px] bg-white border border-[#e7e1d7] rounded-lg p-5 flex flex-col justify-between">
                    <span className="text-xs text-[#71685a] font-medium">Drafts</span>
                    <span className="text-2xl font-bold text-[#211e18]">
                        {!currentProduct?.isActive ? 1 : 0}
                    </span>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-[#e7e1d7] rounded-lg p-5 flex flex-col justify-between">
                    <span className="text-xs text-[#71685a] font-medium">Published</span>
                    <span className="text-2xl font-bold text-[#211e18]">
                        {currentProduct?.isActive ? 1 : 0}
                    </span>
                </div>

                <div className="w-[324px] h-[100px] bg-[#fffcf6] border border-[#e7e1d7] rounded-lg p-5 text-xs text-[#71685a] leading-relaxed flex items-center">
                    {isCreate
                        ? "Slug, category, price, and visibility rules validate before first publish."
                        : "Edit route shows loading, not-found, and blocked publish states before save."}
                </div>
            </div>

            {/* Main two-column layout */}
            <div className="flex items-start gap-6 w-[1056px]">

                {/* LEFT: General form */}
                <div className="w-[648px]">
                    <form
                        id="product-general-form"
                        key={formSeed}
                        onSubmit={handleSaveGeneral}
                    >
                        {/* Hidden product ID for updates */}
                        {currentProduct?.id && (
                            <input type="hidden" name="id" value={currentProduct.id} />
                        )}

                        {/* Form container card */}
                        <div className="bg-white border border-[#e7e1d7] rounded-lg p-6 space-y-5">

                            {/* Route-safe not-found banner for edit mode */}
                            {!isCreate && !currentProduct && (
                                <div className="bg-[#fff1f0] border border-[#ffccc7] rounded-lg p-3 text-xs text-[#a33b2b] font-medium">
                                    If the product cannot load, replace the form with a route-safe not-found panel.
                                </div>
                            )}

                            {/* Slug (new only) */}
                            {isCreate && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="slug" className="text-xs font-semibold text-[#211e18]">
                                        Product URL slug
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-[#9a9184]">/buy/</span>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            placeholder="e.g. daytona-cnc-carbon"
                                            pattern="^[a-zA-Z0-9_-]+$"
                                            className="flex-1 h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                        />
                                    </div>
                                    <p className="text-[11px] text-[#9a9184]">URL-safe slug, set once. Cannot be changed after creation.</p>
                                </div>
                            )}

                            {/* Product name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-[#211e18]">
                                    Product title
                                </Label>
                                <Input
                                    data-testid="field-title"
                                    id="name"
                                    name="name"
                                    defaultValue={currentProduct?.name}
                                    placeholder="e.g. Daytona CNC Grip Carbon"
                                    required
                                    className="h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                />
                            </div>

                            {/* Price & Stock row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="price" className="text-xs font-semibold text-[#211e18]">
                                        Price (VNĐ)
                                    </Label>
                                    <Input
                                        data-testid="field-price"
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        defaultValue={currentProduct?.price}
                                        placeholder="0.00"
                                        required
                                        className="h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#211e18]">Stock</Label>
                                    <div className="h-9 border border-[#e7e1d7] rounded-md bg-[#f8f5ef] px-3 flex items-center text-sm text-[#787774]">
                                        {currentProduct?.stock ?? 0} in stock
                                    </div>
                                </div>
                            </div>

                            {/* Compare-at price */}
                            <div className="space-y-1.5">
                                <Label htmlFor="compareAtPrice" className="text-xs font-semibold text-[#211e18]">
                                    Compare-at price (optional)
                                </Label>
                                <Input
                                    id="compareAtPrice"
                                    name="compareAtPrice"
                                    type="number"
                                    step="0.01"
                                    defaultValue={currentProduct?.compareAtPrice || ""}
                                    placeholder="Strike-through price"
                                    className="h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                />
                            </div>

                            {/* Visibility */}
                            <div className="space-y-1.5">
                                <Label htmlFor="visibilityLevel" className="text-xs font-semibold text-[#211e18]">
                                    Visibility
                                </Label>
                                <select
                                    id="visibilityLevel"
                                    name="visibilityLevel"
                                    value={visibilityLevel}
                                    onChange={e => setVisibilityLevel(e.target.value)}
                                    className="h-9 w-full rounded-md border border-[#e7e1d7] bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#99782b]/50"
                                >
                                    <option value="-1">All visitors</option>
                                    <option value="0">Logged-in only</option>
                                    <option value="1">Level 1+</option>
                                    <option value="2">Level 2+</option>
                                    <option value="3">Level 3+</option>
                                </select>
                                {isCreate && (
                                    <p className="text-[11px] text-[#9a9184]">Draft visibility. Publish stays blocked until slug, price, and media checks all pass.</p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-xs font-semibold text-[#211e18]">
                                    Category
                                </Label>
                                <Input
                                    id="category"
                                    name="category"
                                    list="product-category-list"
                                    defaultValue={currentProduct?.category}
                                    placeholder="General category"
                                    className="h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                />
                                <datalist id="product-category-list">
                                    {categories.map(c => (
                                        <option key={String(c.id ?? c.name)} value={c.name} />
                                    ))}
                                </datalist>
                            </div>

                            {/* SKU */}
                            <div className="space-y-1.5">
                                <Label htmlFor="sku" className="text-xs font-semibold text-[#211e18]">
                                    SKU (optional)
                                </Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    defaultValue={currentProduct?.sku || ""}
                                    placeholder="e.g. GRIP-001"
                                    className="h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-semibold text-[#211e18]">
                                    Description
                                </Label>
                                <Textarea
                                    data-testid="field-description"
                                    id="description"
                                    name="description"
                                    defaultValue={currentProduct?.description || ""}
                                    placeholder="Product description (Markdown supported)..."
                                    className="min-h-[80px] border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm resize-none"
                                />
                            </div>

                            {/* Usage guide */}
                            <div className="space-y-1.5">
                                <Label htmlFor="usageGuide" className="text-xs font-semibold text-[#211e18]">
                                    Usage guide (optional)
                                </Label>
                                <Textarea
                                    id="usageGuide"
                                    name="usageGuide"
                                    defaultValue={currentProduct?.usageGuide || ""}
                                    placeholder="How to use this product..."
                                    className="min-h-[60px] border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm resize-none"
                                />
                            </div>

                            {/* Purchase limit */}
                            <div className="space-y-1.5">
                                <Label htmlFor="purchaseLimit" className="text-xs font-semibold text-[#211e18]">
                                    Per-user purchase limit
                                </Label>
                                <Input
                                    id="purchaseLimit"
                                    name="purchaseLimit"
                                    type="number"
                                    defaultValue={currentProduct?.purchaseLimit || ""}
                                    placeholder="0 or empty = unlimited"
                                    className="h-9 border-[#e7e1d7] focus-visible:ring-[#99782b]/30 text-sm"
                                />
                            </div>

                            {/* Flags row */}
                            <div className="flex flex-wrap gap-4 pt-1">
                                {[
                                    { id: "isHot", label: "🔥 Hot", checked: currentProduct?.isHot },
                                ].map(flag => (
                                    <label key={flag.id} className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name={flag.id}
                                            defaultChecked={!!flag.checked}
                                            value="true"
                                            className="h-4 w-4 rounded border-[#e7e1d7] accent-[#99782b]"
                                        />
                                        <span className="text-xs font-medium text-[#50483d]">{flag.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Specs section */}
                            <div className="pt-3 border-t border-[#f0ebe1]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-[#211e18] uppercase tracking-wide">
                                        Specifications
                                    </span>
                                    <button
                                        data-testid="add-spec-row-btn"
                                        type="button"
                                        onClick={handleAddSpec}
                                        className="h-7 px-3 text-xs font-semibold text-[#99782b] border border-[#99782b]/40 rounded-md hover:bg-[#99782b]/5 transition-colors"
                                    >
                                        + Add spec
                                    </button>
                                </div>
                                <div data-testid="admin-specs-inputs" className="space-y-2">
                                    {specs.map((spec, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Input
                                                data-testid={`spec-key-${i}`}
                                                placeholder="Name (e.g. Material)"
                                                value={spec.key}
                                                onChange={e => handleSpecChange(i, "key", e.target.value)}
                                                className="flex-1 h-8 text-xs border-[#e7e1d7]"
                                            />
                                            <Input
                                                data-testid={`spec-value-${i}`}
                                                placeholder="Value (e.g. CNC Aluminium)"
                                                value={spec.value}
                                                onChange={e => handleSpecChange(i, "value", e.target.value)}
                                                className="flex-1 h-8 text-xs border-[#e7e1d7]"
                                            />
                                            <button
                                                data-testid={`delete-spec-row-${i}`}
                                                type="button"
                                                onClick={() => handleRemoveSpec(i)}
                                                className="h-8 w-8 flex items-center justify-center text-[#a33b2b] hover:bg-[#fff1f0] rounded-md text-sm font-bold transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {specs.length === 0 && (
                                        <p className="text-[11px] text-[#9a9184] py-2 text-center">No specifications added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save general CTA */}
                        <div className="flex justify-end pt-4">
                            <Button
                                data-testid="save-btn"
                                type="submit"
                                disabled={generalSaving}
                                className="h-9 px-6 bg-[#99782b] hover:bg-[#99782b]/90 text-white border-none rounded-lg text-sm font-semibold"
                            >
                                {generalSaving
                                    ? "Saving..."
                                    : isCreate ? "Create draft" : "Save general"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* RIGHT: Media + Publish checks */}
                <div className="w-[384px] space-y-5">

                    {/* Media panel */}
                    <div className="bg-white border border-[#e7e1d7] rounded-lg p-5">
                        <h3 className="text-sm font-bold text-[#211e18] mb-0.5">Media & content</h3>
                        <p className="text-[11px] text-[#787774] mb-4">
                            Primary image is required to publish. Gallery images are optional.
                        </p>

                        {/* Primary image */}
                        <div className="mb-4">
                            <Label className="text-[11px] font-semibold text-[#50483d] mb-2 block">
                                Primary image
                            </Label>
                            {mainImage ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#e7e1d7] bg-[#f8f5ef]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={mainImage}
                                        alt="Primary"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMainImage("")}
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-lg border-2 border-dashed border-[#e7e1d7] bg-[#f8f5ef] flex flex-col items-center justify-center text-center gap-1">
                                    <span className="text-xs text-[#9a9184]">Primary image</span>
                                    <span className="text-[10px] text-[#b5a99a]">not attached</span>
                                </div>
                            )}
                        </div>

                        {/* Publish blocker notice */}
                        {!isCreate && !hasPrimaryImage && (
                            <div className="mb-4 bg-[#fffbe6] border border-[#ffe58f] rounded-lg p-2.5 text-[11px] text-[#d48806] font-medium">
                                Publish stays blocked until slug, price, and media checks all pass.
                            </div>
                        )}

                        {/* Media uploader */}
                        <MediaUploader
                            label="Upload primary image"
                            value={mainImage}
                            onChange={val => setMainImage(val as string)}
                        />

                        {/* Gallery */}
                        <div className="mt-4 pt-4 border-t border-[#f0ebe1]">
                            <Label className="text-[11px] font-semibold text-[#50483d] mb-2 block">
                                Gallery images (optional)
                            </Label>
                            <MediaUploader
                                label="Upload gallery images"
                                value={galleryImages}
                                onChange={val => setGalleryImages(val as string[])}
                                multiple
                                maxFiles={6}
                            />
                        </div>

                        {/* Save media button (edit only) */}
                        {!isCreate && currentProduct?.id && (
                            <div className="mt-4 pt-4 border-t border-[#f0ebe1] flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleSaveMedia}
                                    disabled={mediaSaving}
                                    className="h-8 px-4 bg-[#99782b] hover:bg-[#99782b]/90 text-white border-none rounded-lg text-xs font-semibold"
                                >
                                    {mediaSaving ? "Saving..." : "Save media"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Publish checklist panel */}
                    <div className="bg-white border border-[#e7e1d7] rounded-lg p-5">
                        <h3 className="text-sm font-bold text-[#211e18] mb-0.5">
                            {isCreate ? "Pre-publish checks" : "Validation + state"}
                        </h3>
                        <p className="text-[11px] text-[#787774] mb-4">
                            {isCreate
                                ? "Slug unique · Price valid · Primary image attached"
                                : "Slug unique · Price valid · Primary image attached"}
                        </p>

                        <div className="space-y-2">
                            {[
                                { label: "Slug / ID set", ok: hasSlug },
                                { label: "Price valid (> 0)", ok: hasPrice },
                                { label: "Primary image attached", ok: hasPrimaryImage },
                                { label: "Category mapped", ok: hasCategory },
                            ].map(check => (
                                <div
                                    key={check.label}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${check.ok
                                        ? "bg-[#f6ffed] border border-[#b7eb8f] text-[#389e0d]"
                                        : "bg-[#fff1f0] border border-[#ffccc7] text-[#a33b2b]"
                                        }`}
                                >
                                    <span>{check.ok ? "✓" : "○"}</span>
                                    <span>{check.label}</span>
                                </div>
                            ))}
                        </div>

                        {!isCreate && (
                            <p className="text-[10px] text-[#9a9184] mt-3">
                                SEO preview stays in edit scope; it does not invent publish state on the FE.
                            </p>
                        )}
                    </div>



                    {/* Navigation back */}
                    <div className="flex gap-2 pt-1">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 h-8 border-[#e7e1d7] text-[#50483d] hover:bg-[#f8f5ef] text-xs font-medium"
                        >
                            ← Back
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1 h-8 border-[#e7e1d7] text-[#50483d] hover:bg-[#f8f5ef] text-xs font-medium"
                        >
                            <Link href="/admin/products">All products</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
