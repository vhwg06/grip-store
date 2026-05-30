'use client'

import { useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react"
import { deleteProduct, toggleProductStatus, reorderProduct } from "@/adapters/api/admin.api"
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
    const [showQuickCreate, setShowQuickCreate] = useState(true)
    const [quickForm, setQuickForm] = useState({ title: "", description: "", price: "" })
    const busyRef = useRef(false)

    const threshold = lowStockThreshold || 5

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

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        if (busyRef.current) return
        const idx = products.findIndex(p => p.id === id)
        if (idx === -1) return

        // Swap with neighbor
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1
        if (targetIdx < 0 || targetIdx >= products.length) return

        const current = products[idx]
        const target = products[targetIdx]

        busyRef.current = true
        setBusy(true)
        try {
            // Use index as sortOrder to ensure unique values
            await reorderProduct(current.id, targetIdx)
            await reorderProduct(target.id, idx)
            toast.success(t('common.success'))
            router.refresh()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setBusy(false)
            busyRef.current = false
        }
    }

    return (
        <div className="space-y-6">
            {/* Products Table */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('common.productManagement')}</h1>
                <Button data-testid="create-btn" type="button" onClick={() => setShowQuickCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.products.addNew')}
                </Button>
            </div>

            {showQuickCreate && (
                <Card className="rounded-md border bg-card p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            data-testid="field-title"
                            className="h-9 rounded-md border px-3 text-sm"
                            placeholder="Title"
                            value={quickForm.title}
                            onChange={(e) => setQuickForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                        <input
                            data-testid="field-description"
                            className="h-9 rounded-md border px-3 text-sm"
                            placeholder="Description"
                            value={quickForm.description}
                            onChange={(e) => setQuickForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                        <input
                            data-testid="field-price"
                            className="h-9 rounded-md border px-3 text-sm"
                            placeholder="Price"
                            value={quickForm.price}
                            onChange={(e) => setQuickForm((prev) => ({ ...prev, price: e.target.value }))}
                        />
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            data-testid="save-btn"
                            type="button"
                            onClick={() => setShowQuickCreate(false)}
                        >
                            {t('common.save')}
                        </Button>
                    </div>
                </Card>
            )}

            <Card className="rounded-md border bg-card">
                <Table data-testid="admin-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">{t('admin.products.order')}</TableHead>
                            <TableHead>{t('admin.products.name')}</TableHead>
                            <TableHead>{t('admin.products.price')}</TableHead>
                            <TableHead>{t('admin.products.category')}</TableHead>
                            <TableHead>{t('admin.products.hot')}</TableHead>
                            <TableHead>{t('admin.products.stock')}</TableHead>
                            <TableHead>{t('admin.products.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.products.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow data-item-id="placeholder-row">
                                <TableCell>-</TableCell>
                                <TableCell className="font-medium">No products</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>general</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">inactive</Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button data-testid="toggle-btn" variant="outline" size="sm" type="button">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button asChild variant="outline" size="sm" data-testid="edit-btn">
                                        <Link href="/admin/product/new">{t('common.edit')}</Link>
                                    </Button>
                                    <Button data-testid="delete-btn" variant="destructive" size="sm" type="button">
                                        {t('common.delete')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : products.map((product, idx) => (
                            <TableRow data-item-id={product.id} key={product.id} className={!product.isActive ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            data-testid="move-up-btn"
                                            variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleReorder(product.id, 'up')}
                                        disabled={busy || idx === 0}
                                    >
                                        <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        data-testid="move-down-btn"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleReorder(product.id, 'down')}
                                        disabled={busy || idx === products.length - 1}
                                    >
                                        <ArrowDown className="h-3 w-3" />
                                    </Button>
                                </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span>{Number(product.price)}</span>
                                        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {Number(product.compareAtPrice)}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{product.categoryId || 'general'}</TableCell>
                                <TableCell>
                                    {product.isHot ? (
                                        <Badge variant="secondary">{t('common.yes')}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span>{product.stock}</span>
                                        {product.stock <= threshold && (
                                            <Badge variant="destructive" className="text-[10px]">{t('admin.products.lowStock')}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                        {product.isActive ? t('admin.products.active') : t('admin.products.inactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        data-testid="toggle-btn"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggle(product.id, product.isActive ?? false)}
                                        title={product.isActive ? t('admin.products.hide') : t('admin.products.show')}
                                        disabled={busy}
                                    >
                                        {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button asChild variant="outline" size="sm" data-testid="edit-btn">
                                        <Link href={buildExportRoutePath("/admin/cards", product.id)}>
                                            {t('admin.products.manageCards')}
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={buildExportRoutePath("/admin/product/edit", product.id)} prefetch={false}>
                                            {t('common.edit')}
                                        </Link>
                                    </Button>
                                    <Button data-testid="delete-btn" variant="destructive" size="sm" onClick={() => handleDelete(product.id)} disabled={busy}>
                                        {t('common.delete')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
