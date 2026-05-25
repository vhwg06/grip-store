'use client'

import { getProductForAdminAction, saveProduct } from "@/adapters/api/admin.api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import MediaUploader from "@/components/admin/media-uploader"

export default function ProductForm({ product, categories = [] }: { product?: any; categories?: Array<{ name: string }> }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const submitLock = useRef(false)
    const [currentProduct, setCurrentProduct] = useState(product)
    const [formSeed, setFormSeed] = useState(0)
    // Only show warning section if purchaseWarning has actual content
    const [showWarning, setShowWarning] = useState(Boolean(product?.purchaseWarning && String(product.purchaseWarning).trim()))
    const [visibilityLevel, setVisibilityLevel] = useState(String(product?.visibilityLevel ?? -1))
    const { t } = useI18n()
    const [mainImage, setMainImage] = useState(product?.image || "")
    const [galleryImages, setGalleryImages] = useState<string[]>(product?.images || [])
    const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([])

    useEffect(() => {
        setCurrentProduct(product)
        setMainImage(product?.image || "")
        setGalleryImages(product?.images || [])
        setShowWarning(Boolean(product?.purchaseWarning && String(product.purchaseWarning).trim()))
        setVisibilityLevel(String(product?.visibilityLevel ?? -1))
        setFormSeed((s) => s + 1)
        if (product?.specs) {
            setSpecs(product.specs)
        } else {
            setSpecs([])
        }
    }, [product?.id])

    useEffect(() => {
        if (!product?.id) return
        let active = true
            ; (async () => {
                try {
                    const latest = await getProductForAdminAction(product.id)
                    if (!active || !latest) return
                    setCurrentProduct(latest as any)
                    setMainImage((latest as any)?.image || "")
                    setGalleryImages((latest as any)?.images || [])
                    setShowWarning(Boolean(latest?.purchaseWarning && String(latest.purchaseWarning).trim()))
                    setVisibilityLevel(String(latest?.visibilityLevel ?? -1))
                    setFormSeed((s) => s + 1)
                    if ((latest as any)?.specs) {
                        setSpecs((latest as any).specs)
                    }
                } catch {
                    // ignore
                }
            })()
        return () => {
            active = false
        }
    }, [product?.id])

    const handleAddSpec = () => {
        setSpecs((prev) => [...prev, { key: "", value: "" }])
    }

    const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
        setSpecs((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
    }

    const handleRemoveSpec = (index: number) => {
        setSpecs((prev) => prev.filter((_, i) => i !== index))
    }

    async function handleSubmit(formData: FormData) {
        if (submitLock.current) return
        submitLock.current = true
        setLoading(true)
        try {
            const cleanedSpecs = specs.filter(s => s.key.trim() !== "")
            formData.append("specs", JSON.stringify(cleanedSpecs))
            await saveProduct(formData)
            toast.success(t('common.success'))
            router.push('/admin/products')
        } catch (e: any) {
            console.error('Save product error:', e)
            toast.error(e?.message || t('common.error'))
        } finally {
            setLoading(false)
            submitLock.current = false
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{product ? t('admin.productForm.editTitle') : t('admin.productForm.addTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <form key={formSeed} action={handleSubmit} className="space-y-5">
                    {currentProduct && <input type="hidden" name="id" value={currentProduct.id} />}

                    <div className="grid gap-2">
                        <Label htmlFor="slug">{t('admin.productForm.slugLabel')}</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">/buy/</span>
                            <Input
                                id="slug"
                                name="slug"
                                defaultValue={currentProduct?.id || ''}
                                placeholder={t('admin.productForm.slugPlaceholder')}
                                pattern="^[a-zA-Z0-9_-]+$"
                                className="flex-1"
                                disabled={!!currentProduct}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {currentProduct ? t('admin.productForm.slugReadonly') : t('admin.productForm.slugHint')}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('admin.productForm.nameLabel')}</Label>
                        <Input data-testid="field-title" id="name" name="name" defaultValue={currentProduct?.name} placeholder={t('admin.productForm.namePlaceholder')} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">{t('admin.productForm.priceLabel')}</Label>
                        <Input data-testid="field-price" id="price" name="price" type="number" step="0.01" defaultValue={currentProduct?.price} placeholder={t('admin.productForm.pricePlaceholder')} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="compareAtPrice">{t('admin.productForm.compareAtPriceLabel')}</Label>
                        <Input
                            id="compareAtPrice"
                            name="compareAtPrice"
                            type="number"
                            step="0.01"
                            defaultValue={currentProduct?.compareAtPrice || ''}
                            placeholder={t('admin.productForm.compareAtPricePlaceholder')}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="purchaseLimit">{t('admin.productForm.purchaseLimitLabel') || "Per-user Purchase Limit (0 or empty for unlimited)"}</Label>
                        <Input id="purchaseLimit" name="purchaseLimit" type="number" defaultValue={currentProduct?.purchaseLimit} placeholder={t('admin.productForm.purchaseLimitPlaceholder') || "e.g. 1"} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">{t('admin.productForm.categoryLabel')}</Label>
                        <Input id="category" name="category" list="ldc-category-list" defaultValue={currentProduct?.category} placeholder={t('admin.productForm.categoryPlaceholder')} />
                        <datalist id="ldc-category-list">
                            {categories.map(c => (
                                <option key={c.name} value={c.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="visibilityLevel">{t('admin.productForm.visibilityLabel')}</Label>
                        <select
                            id="visibilityLevel"
                            name="visibilityLevel"
                            value={visibilityLevel}
                            onChange={(e) => setVisibilityLevel(e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2"
                        >
                            <option value="-1">{t('admin.productForm.visibilityAll')}</option>
                            <option value="0">{t('admin.productForm.visibilityLevel0')}</option>
                            <option value="1">{t('admin.productForm.visibilityLevel1')}</option>
                            <option value="2">{t('admin.productForm.visibilityLevel2')}</option>
                            <option value="3">{t('admin.productForm.visibilityLevel3')}</option>
                        </select>
                        <p className="text-xs text-muted-foreground">{t('admin.productForm.visibilityHint')}</p>
                    </div>

                    <div className="grid gap-2">
                        <MediaUploader
                            label={t('admin.productForm.imageLabel')}
                            value={mainImage}
                            onChange={(val) => setMainImage(val as string)}
                        />
                        <input type="hidden" name="image" value={mainImage} />
                    </div>

                    <div className="grid gap-2">
                        <MediaUploader
                            label="Thư viện ảnh sản phẩm"
                            value={galleryImages}
                            onChange={(val) => setGalleryImages(val as string[])}
                            multiple
                            maxFiles={6}
                        />
                        <input type="hidden" name="images" value={galleryImages.join('\n')} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sku">Mã sản phẩm (SKU)</Label>
                        <Input id="sku" name="sku" defaultValue={currentProduct?.sku} placeholder="VD: GRIP-123" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brandId">Thương hiệu (ID)</Label>
                        <Input id="brandId" name="brandId" type="number" defaultValue={currentProduct?.brandId} placeholder="ID của thương hiệu" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('admin.productForm.descLabel')}</Label>
                        <Textarea
                            data-testid="field-description"
                            id="description"
                            name="description"
                            defaultValue={currentProduct?.description}
                            placeholder={t('admin.productForm.descPlaceholder')}
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="usageGuide">Hướng dẫn sử dụng</Label>
                        <Textarea
                            id="usageGuide"
                            name="usageGuide"
                            defaultValue={currentProduct?.usageGuide}
                            placeholder="Nhập hướng dẫn sử dụng (Hỗ trợ Markdown)..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bundledGifts">Quà tặng kèm</Label>
                        <Textarea
                            id="bundledGifts"
                            name="bundledGifts"
                            defaultValue={currentProduct?.bundledGifts}
                            placeholder="Nhập thông tin quà tặng kèm..."
                            className="min-h-[60px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isHot"
                                name="isHot"
                                defaultChecked={!!currentProduct?.isHot}
                                className="h-4 w-4 accent-primary"
                            />
                            <Label htmlFor="isHot" className="cursor-pointer">{t('admin.productForm.isHotLabel')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isNew"
                                name="isNew"
                                defaultChecked={!!currentProduct?.isNew}
                                className="h-4 w-4 accent-primary"
                            />
                            <Label htmlFor="isNew" className="cursor-pointer">Mới (New)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isBestSeller"
                                name="isBestSeller"
                                defaultChecked={!!currentProduct?.isBestSeller}
                                className="h-4 w-4 accent-primary"
                            />
                            <Label htmlFor="isBestSeller" className="cursor-pointer">Bán chạy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isShared"
                                name="isShared"
                                defaultChecked={currentProduct?.isShared ?? false}
                                className="h-4 w-4 accent-primary"
                            />
                            <Label htmlFor="isShared" className="cursor-pointer">{t('admin.productForm.isSharedLabel')}</Label>
                        </div>
                    </div>

                    {/* Specs Section */}
                    <div className="space-y-4 border border-[#c0a060]/20 p-4 rounded-lg bg-neutral-50/50">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-bold uppercase text-[#2b1809]">Thông số kỹ thuật</Label>
                            <Button
                                data-testid="add-spec-row-btn"
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddSpec}
                                className="border-[#c0a060] text-[#9c702a] hover:bg-[#9c702a]/10"
                            >
                                Thêm thông số
                            </Button>
                        </div>
                        <div data-testid="admin-specs-inputs" className="space-y-3">
                            {specs.map((spec, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        data-testid={`spec-key-${index}`}
                                        placeholder="Tên thông số (VD: Chất liệu)"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                                        className="flex-1 bg-white"
                                    />
                                    <Input
                                        data-testid={`spec-value-${index}`}
                                        placeholder="Giá trị (VD: Nhôm CNC)"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                                        className="flex-1 bg-white"
                                    />
                                    <Button
                                        data-testid={`delete-spec-row-${index}`}
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveSpec(index)}
                                        className="h-9 w-9 shrink-0 flex items-center justify-center font-bold"
                                    >
                                        &times;
                                    </Button>
                                </div>
                            ))}
                            {specs.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">Chưa có thông số kỹ thuật nào được cấu hình.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>{t('common.cancel')}</Button>
                        <Button data-testid="save-btn" type="submit" disabled={loading}>{loading ? t('admin.productForm.saving') : t('admin.productForm.saveButton')}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
