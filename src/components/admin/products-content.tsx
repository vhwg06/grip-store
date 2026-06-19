'use client'

import { useRef, useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteProduct, toggleProductStatus } from "@/adapters/api/admin.api"
import { useAdminCategories } from "@/application/hooks/useAdmin"
import { toast } from "sonner"

import { AdminProduct } from "@/domain/admin"
import { buildExportRoutePath } from "@/lib/export-route"

interface AdminProductsContentProps {
    products: AdminProduct[]
    lowStockThreshold: number
}

export function AdminProductsContent({ products, lowStockThreshold }: AdminProductsContentProps) {
    const { t } = useI18n()
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    const busyRef = useRef(false)
    const [activeTab, setActiveTab] = useState<'visible' | 'hidden' | 'lowstock'>('visible')

    const threshold = lowStockThreshold || 5

    const activeSkusCount = products.filter(p => p.isActive).length
    const lowStockCount = products.filter(p => p.stock <= threshold).length
    const hiddenCount = products.filter(p => !p.isActive).length
    const activeMissingImageCount = products.filter(p => p.isActive && !p.image).length
    const categoryMappingPercent = products.length > 0 ? Math.round((products.filter(p => p.categoryId !== null).length / products.length) * 100) : 0

    const handleDelete = async (id: string) => {
        if (busyRef.current) return
        if (!confirm(t('admin.products.confirmDelete'))) return
        busyRef.current = true
        setBusy(true)
        try {
            await deleteProduct(id)
            toast.success(t('common.success'))
            router.refresh()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setBusy(false)
            busyRef.current = false
        }
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        if (busyRef.current) return
        busyRef.current = true
        setBusy(true)
        try {
            await toggleProductStatus(id, !currentStatus)
            toast.success(t('common.success'))
            router.refresh()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setBusy(false)
            busyRef.current = false
        }
    }

    const { data: categories } = useAdminCategories()

    const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)

    useEffect(() => {
        if (products.length > 0 && !selectedProduct) {
            setSelectedProduct(products[0])
        }
    }, [products, selectedProduct])

    const getCategoryName = (categoryId: string | number | null) => {
        if (!categoryId) return 'General'
        const catStr = String(categoryId).toLowerCase()
        const found = categories?.find(c => 
            String(c.id).toLowerCase() === catStr || 
            String(c.slug).toLowerCase() === catStr || 
            String(c.name).toLowerCase() === catStr
        )
        return found ? found.name : 'General'
    }


    const displayProducts = activeTab === 'hidden'
        ? products.filter(p => !p.isActive)
        : activeTab === 'lowstock'
        ? products.filter(p => p.stock <= threshold)
        : products.filter(p => p.isActive)

    return (
        <div className="w-[1056px]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
                <span>Admin</span>
                <span>/</span>
                <span>Catalog</span>
                <span>/</span>
                <span className="text-foreground font-medium">Products</span>
            </div>

            {/* Title & Create Button row */}
            <div className="flex items-center justify-between mt-[57px] mb-[12px] leading-none">
                <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy">
                    Product Management
                </h1>
                <Button
                    data-testid="create-btn"
                    asChild
                    className="w-[153px] h-10 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-sm font-semibold border-none"
                >
                    <Link href="/admin/product/new">Create product</Link>
                </Button>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-[#71685a] mt-[12px] mb-[34px]">
                Catalog overview, stock health, visibility, pricing, and quick access to full product editing.
            </p>

            {/* Statistics Cards Row */}
            <div className="flex gap-6 mb-8 w-[1056px]">
                <div className="w-[220px] h-[100px] bg-white border border-[#e7e1d7] rounded-lg p-5 flex flex-col justify-between">
                    <span className="text-xs text-[#71685a] font-medium">Active SKUs</span>
                    <span className="text-2xl font-bold text-[#211e18]">{activeSkusCount}</span>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-[#e7e1d7] rounded-lg p-5 flex flex-col justify-between">
                    <span className="text-xs text-[#71685a] font-medium">Low stock</span>
                    <span className="text-2xl font-bold text-[#211e18]">{lowStockCount}</span>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-[#e7e1d7] rounded-lg p-5 flex flex-col justify-between">
                    <span className="text-xs text-[#71685a] font-medium">Hidden</span>
                    <span className="text-2xl font-bold text-[#211e18]">{hiddenCount}</span>
                </div>
                <div className="w-[324px] h-[100px] bg-[#fffcf6] border border-[#e7e1d7] rounded-lg p-5 text-xs text-[#71685a] leading-relaxed flex items-center">
                    List view shows search, row actions, guard states, and quick product editing in one scan.
                </div>
            </div>


            {/* Columns Container */}
            <div className="flex items-start gap-6 w-[1056px]">
                {/* Left Column: Product List */}
                <div className="w-[648px] space-y-4">
                    {/* Search & Tabs Box */}
                    <div className="w-[648px] h-[52px] bg-white border border-[#e7e1d7] rounded-lg flex items-center justify-between px-4">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-gray-400 text-sm">🔍</span>
                            <input
                                type="text"
                                placeholder="Search product, SKU, category..."
                                className="border-none bg-transparent text-sm focus:outline-none w-full placeholder-[#9a9184]"
                            />
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <button
                                onClick={() => setActiveTab('visible')}
                                className={`transition-colors ${activeTab === 'visible' ? 'text-[#99782b] font-bold' : 'text-[#787774] hover:text-foreground'}`}
                            >Visible</button>
                            <button
                                onClick={() => setActiveTab('hidden')}
                                className={`transition-colors ${activeTab === 'hidden' ? 'text-[#99782b] font-bold' : 'text-[#787774] hover:text-foreground'}`}
                            >Hidden</button>
                            <button
                                onClick={() => setActiveTab('lowstock')}
                                className={`transition-colors ${activeTab === 'lowstock' ? 'text-[#99782b] font-bold' : 'text-[#787774] hover:text-foreground'}`}
                            >Low stock</button>
                        </div>
                    </div>

                    {/* Table element wrapper to support Playwright masking and row counts */}
                    <table data-testid="admin-table" className="w-[648px] bg-transparent border-none">
                        <tbody className="flex flex-col gap-3 w-full">
                            {displayProducts.map((product, idx) => {
                                const isLowStock = product.stock <= threshold
                                const hasMissingImage = !product.image
                                const hasInvalidCompareAtPrice = product.compareAtPrice != null && product.compareAtPrice <= (product.price ?? 0)
                                
                                return (
                                    <tr
                                        key={product.id}
                                        data-item-id={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className={`block bg-white border border-[#e7e1d7] rounded-lg p-4 w-[648px] transition-all hover:shadow-sm cursor-pointer ${!product.isActive ? 'opacity-90' : ''} ${selectedProduct?.id === product.id ? 'ring-1 ring-[#99782b]' : ''}`}
                                    >
                                        <td className="block p-0">
                                            <div className="flex items-center justify-between">
                                                {/* Checkbox, Image and Info */}
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-[#e7e1d7] text-[#99782b] focus:ring-[#99782b] h-4 w-4" 
                                                        defaultChecked={idx === 0}
                                                    />
                                                    {/* Thumbnail Box */}
                                                    <div className={`w-[60px] h-[60px] rounded-lg flex items-center justify-center text-[10px] font-bold overflow-hidden ${!hasMissingImage ? 'bg-[#e9dfc8]' : 'bg-[#f3f1ec] text-[#a3a3a3]'}`}>
                                                        {!hasMissingImage && product.image
                                                            ? <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                            : <span className="text-[10px] font-bold text-[#a3a3a3]">NO IMG</span>
                                                        }
                                                    </div>
                                                    {/* Product Details */}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#211e18] leading-snug">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[11px] text-[#787774] mt-0.5 font-medium">
                                                            SKU: {product.sku || 'N/A'} | {getCategoryName(product.categoryId)}
                                                        </span>
                                                        <span className="text-[11px] text-[#787774] mt-0.5 font-medium">
                                                            {Number(product.price).toFixed(2)} • {product.stock} in stock
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions & Status */}
                                                <div className="flex items-center gap-2">
                                                    {/* Status Badge */}
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.isActive ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#f1f3f4] text-[#3c4043]'}`}>
                                                        {product.isActive ? 'Visible' : 'Hidden'}
                                                    </span>
                                                    {/* Action Buttons */}
                                                    <Button 
                                                        asChild 
                                                        variant="outline" 
                                                        size="sm" 
                                                        data-testid="edit-btn"
                                                        className="h-7 px-3 bg-[#99782b] hover:bg-[#99782b]/90 text-white border-none rounded-md text-xs font-semibold"
                                                    >
                                                        <Link href={buildExportRoutePath("/admin/product/edit", product.id)}>Edit</Link>
                                                    </Button>
                                                    <Button
                                                        data-testid="toggle-btn"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggle(product.id, product.isActive ?? false)}
                                                        className="h-7 px-2.5 bg-[#f3f1ec] text-[#50483d] hover:bg-[#e9dfc8]/30 border-none rounded-md text-xs font-semibold"
                                                    >
                                                        {product.isActive ? 'Hide' : 'Show'}
                                                    </Button>

                                                    <Button 
                                                        data-testid="delete-btn" 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="h-7 w-7 p-0 bg-[#fff1f0] text-[#a33b2b] border border-[#ffccc7] hover:bg-[#fff1f0]/80 flex items-center justify-center rounded-md"
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Warnings block */}
                                            {(hasMissingImage || hasInvalidCompareAtPrice) && (
                                                <div className="mt-2 pt-2 border-t border-[#f0ebe1] flex flex-col gap-1">
                                                    {hasMissingImage && (
                                                        <span className="text-[11px] text-[#a33b2b] font-semibold flex items-center gap-1">
                                                            ⚠️ Missing gallery image
                                                        </span>
                                                    )}
                                                    {hasInvalidCompareAtPrice && (
                                                        <span className="text-[11px] text-[#a33b2b] font-semibold flex items-center gap-1">
                                                            ⚠️ Invalid compare-at price
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Right Column: Selected Product & Audit */}
                <div className="w-[384px] space-y-6">
                    {/* Card 1: Selected Product */}
                    <div className="w-[384px] border border-[#e7e1d7] bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-sm font-bold text-[#211e18]">Selected Product</h3>
                        <p className="text-[11px] text-[#787774] mt-0.5">Quick actions for the selected catalog item.</p>
                        
                        {selectedProduct ? (
                            <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-bold text-[#211e18]">{selectedProduct.name}</h4>
                                <div className="grid grid-cols-2 gap-y-1.5 text-xs mt-2 border-t border-[#f0ebe1] pt-3">
                                    <span className="text-[#787774] font-medium">Base SKU</span>
                                    <span className="font-semibold text-[#211e18] text-right">{selectedProduct.sku || 'N/A'}</span>
                                    
                                    <span className="text-[#787774] font-medium">Category</span>
                                    <span className="font-semibold text-[#211e18] text-right">{getCategoryName(selectedProduct.categoryId)}</span>
                                    
                                    <span className="text-[#787774] font-medium">Active Stock</span>
                                    <span className="font-semibold text-[#211e18] text-right">{selectedProduct.stock} units</span>
                                </div>
                                
                                <div className="flex gap-2 pt-3 border-t border-[#f0ebe1]">
                                    <Button asChild className="h-8 flex-1 bg-[#99782b] hover:bg-[#99782b]/90 text-white border-none rounded-lg text-xs font-semibold flex items-center justify-center">
                                        <Link href={buildExportRoutePath("/admin/product/edit", selectedProduct.id)}>Quick edit</Link>
                                    </Button>

                                    <Button 
                                        onClick={() => handleToggle(selectedProduct.id, selectedProduct.isActive ?? false)}
                                        className="h-8 flex-1 bg-[#f3f1ec] text-[#50483d] hover:bg-[#e9dfc8]/30 border-none rounded-lg text-xs font-semibold"
                                    >
                                        {selectedProduct.isActive ? 'Hide product' : 'Show product'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-4 text-center">No product selected</p>
                        )}
                    </div>

                    {/* Card 2: Catalog Health Audit */}
                    <div className="w-[384px] border border-[#e7e1d7] bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-sm font-bold text-[#211e18]">Catalog Health Audit</h3>
                        <p className="text-[11px] text-[#787774] mt-0.5">Automatic validation checks on active and draft items.</p>
                        
                        <div className="mt-4 space-y-2.5">
                            <div className="bg-[#fffbe6] border border-[#ffe58f] text-[#d48806] rounded-lg p-2.5 text-xs font-medium flex items-center gap-1.5">
                                <span>⚠️</span>
                                <span>{lowStockCount} items are low in stock (less than {threshold} units left)</span>
                            </div>
                            
                            <div className="bg-[#fff1f0] border border-[#ffccc7] text-[#a33b2b] rounded-lg p-2.5 text-xs font-medium flex items-center gap-1.5">
                                <span>⚠️</span>
                                <span>{activeMissingImageCount} active items are missing gallery images</span>
                            </div>
                            
                            <div className="bg-[#f6ffed] border border-[#b7eb8f] text-[#389e0d] rounded-lg p-2.5 text-xs font-medium flex items-center gap-1.5">
                                <span>✅</span>
                                <span>Category mapping: {categoryMappingPercent}% complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
