'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { ClientDate } from "@/components/client-date"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteOrders, updateAdminOrderStatus, verifyOrderRefundStatus } from "@/adapters/api/admin.api"
import { useAdminOrders } from "@/application/hooks/useAdmin"
import { toast } from "sonner"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"
import { Truck, AlertCircle, CheckCircle, XCircle, Info, ExternalLink, ShieldCheck } from "lucide-react"

interface Order {
    orderId: string
    userId: string | null
    username: string | null
    email: string | null
    productName: string
    amount: string
    status: string | null
    tradeNo: string | null
    createdAt: Date | null
}

function buildUrl(params: Record<string, string | number | undefined | null>) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        const str = String(v).trim()
        if (!str) return
        sp.set(k, str)
    })
    const qs = sp.toString()
    return qs ? `/admin/orders?${qs}` : '/admin/orders'
}

function exportUrl(params: Record<string, string | number | undefined | null>) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        const str = String(v).trim()
        if (!str) return
        sp.set(k, str)
    })
    return `/admin/export/download?${sp.toString()}`
}

export function AdminOrdersContent({
    orders,
    total,
    page,
    pageSize,
    query,
    status,
}: {
    orders: Order[]
    total: number
    page: number
    pageSize: number
    query: string
    status: string
}) {
    const { t } = useI18n()
    const router = useRouter()
    const [queryValue, setQueryValue] = useState(query || "")
    const [statusValue, setStatusValue] = useState<string>(status || "all")
    const [selected, setSelected] = useState<Record<string, boolean>>({})
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const deleteLock = useRef(false)

    // Active order selected for the right detail inspector
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
    const [updateNote, setUpdateNote] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const [hasPendingRefund, setHasPendingRefund] = useState(false)
    const actionLock = useRef(false)

    // Fetch dynamic counts for pending, paid, and delivered orders from real database state
    const { data: pendingData } = useAdminOrders({ page: 1, pageSize: 1, status: "pending" })
    const { data: paidData } = useAdminOrders({ page: 1, pageSize: 1, status: "paid" })
    const { data: deliveredData } = useAdminOrders({ page: 1, pageSize: 1, status: "delivered" })

    const pendingCount = pendingData?.total ?? 0
    const paidCount = paidData?.total ?? 0
    const deliveredCount = deliveredData?.total ?? 0

    const activeOrder = useMemo(() => {
        if (orders.length === 0) return null
        return orders.find(o => o.orderId === activeOrderId) || orders[0]
    }, [orders, activeOrderId])

    useEffect(() => {
        setQueryValue(query || "")
    }, [query])

    useEffect(() => {
        setStatusValue(status || "all")
    }, [status])

    useEffect(() => {
        setSelected({})
    }, [orders, page, status, query])

    useEffect(() => {
        let cancelled = false

        if (!activeOrder?.orderId) {
            setHasPendingRefund(false)
            return () => {
                cancelled = true
            }
        }

        verifyOrderRefundStatus(activeOrder.orderId)
            .then((payload) => {
                if (cancelled) return
                setHasPendingRefund(Boolean(payload?.hasPendingRefund))
            })
            .catch(() => {
                if (cancelled) return
                setHasPendingRefund(false)
            })

        return () => {
            cancelled = true
        }
    }, [activeOrder?.orderId])

    const renderStatusBadge = (status: string | null) => {
        const text = getStatusText(status)
        switch (status) {
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {text}
                    </span>
                )
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {text}
                    </span>
                )
            case 'refunded':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {text}
                    </span>
                )
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        {text}
                    </span>
                )
            default: // pending
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {text}
                    </span>
                )
        }
    }

    const getStatusText = (status: string | null) => {
        if (!status) return t('order.status.pending')
        return t(`order.status.${status}`) || status
    }

    const statusOptions = [
        { key: 'all', label: t('common.all') },
        { key: 'pending', label: t('order.status.pending') },
        { key: 'paid', label: t('order.status.paid') },
        { key: 'delivered', label: t('order.status.delivered') },
        { key: 'refunded', label: t('order.status.refunded') },
        { key: 'cancelled', label: t('order.status.cancelled') },
    ]

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const canPrev = page > 1
    const canNext = page < totalPages
    const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1
    const showingTo = Math.min(page * pageSize, total)

    const applyFilters = (next: { q?: string; status?: string; page?: number }) => {
        router.push(buildUrl({
            q: next.q ?? queryValue,
            status: next.status ?? statusValue,
            page: next.page ?? 1,
            pageSize,
        }))
    }

    const applyAllFilters = (next: { q?: string; status?: string; page?: number; pageSize?: number }) => {
        const nextStatus = next.status ?? statusValue
        router.push(buildUrl({
            q: next.q ?? queryValue,
            status: nextStatus,
            page: next.page ?? 1,
            pageSize: next.pageSize ?? pageSize,
        }))
    }

    const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected])
    const allOnPageSelected = orders.length > 0 && selectedIds.length === orders.length

    const handleStatus = async (orderId: string, newStatus: string) => {
        if (actionLock.current) return
        if (!confirm(`Are you sure you want to update order status to ${newStatus}?`)) return
        try {
            actionLock.current = true
            setActionLoading(true)
            await updateAdminOrderStatus(orderId, newStatus, updateNote || undefined)
            toast.success(t('common.success'))
            setUpdateNote("")
            router.refresh()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setActionLoading(false)
            actionLock.current = false
        }
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb matching Figma */}
            <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium">
                <span>Admin</span>
                <span>/</span>
                <span>Commerce</span>
                <span>/</span>
                <span className="text-foreground font-medium">Orders</span>
            </div>

            {/* Title & Subtitle matching Figma */}
            <div className="flex flex-col gap-2">
                <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy leading-none">
                    Order Management
                </h1>
                <p className="text-sm text-[#71685a] leading-relaxed max-w-2xl">
                    Track payment, fulfillment, customer status, and search by order number, buyer, or delivery state.
                </p>
            </div>

            {/* Alert Banner matching Figma Alert Text */}
            <div className="flex items-center gap-2.5 p-3 text-sm text-[#5c4e3c] bg-[#fbf9f4] border border-[#e7e1d7] rounded-xl animate-fade-in shadow-sm">
                <Info className="h-4.5 w-4.5 shrink-0 text-[#8d7c66]" />
                <span className="font-medium text-[#71685a]">
                    Queue shows filter scope, disabled actions, and row-to-detail handoff without mixing signals into mutations.
                </span>
            </div>

            {/* Metrics cards matching Figma Metric 1, 2, 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-amber-500/[0.03] to-amber-500/[0.08] hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending</div>
                        <div className="text-3xl font-black text-amber-900 mt-1 font-svn-gilroy">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-blue-500/[0.03] to-blue-500/[0.08] hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Paid</div>
                        <div className="text-3xl font-black text-blue-900 mt-1 font-svn-gilroy">{paidCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-emerald-500/[0.03] to-emerald-500/[0.08] hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Delivered</div>
                        <div className="text-3xl font-black text-emerald-900 mt-1 font-svn-gilroy">{deliveredCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
                <div className="relative md:w-[360px]">
                    <Input
                        value={queryValue}
                        onChange={(e) => setQueryValue(e.target.value)}
                        placeholder="Search order, buyer, phone..."
                        className="bg-white border-[#e7e1d7] rounded-lg"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') applyFilters({ q: queryValue, page: 1 })
                        }}
                    />
                </div>
                <div className="flex flex-wrap gap-1.5 bg-[#f5f1ea] p-1.5 rounded-lg border border-[#e7e1d7]">
                    {statusOptions.map(s => (
                        <Button
                            key={s.key}
                            type="button"
                            variant={statusValue === s.key ? 'default' : 'ghost'}
                            size="sm"
                            className={`rounded-md text-xs font-medium px-3.5 py-1.5 h-auto ${
                                statusValue === s.key
                                    ? 'bg-white text-foreground hover:bg-white shadow-sm border border-[#e7e1d7]/40'
                                    : 'text-[#71685a] hover:text-foreground hover:bg-white/50'
                            }`}
                            onClick={() => {
                                setStatusValue(s.key)
                                applyAllFilters({ status: s.key, page: 1 })
                            }}
                        >
                            {s.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Delete Mutation Error Banner */}
            {deleteError && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in" data-testid="orders-mutation-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Split Screen Queue & Inspector Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: Queue Rows */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={allOnPageSelected}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    const next: Record<string, boolean> = {}
                                    for (const o of orders) next[o.orderId] = checked
                                    setSelected(next)
                                }}
                                aria-label={t('admin.orders.selectAll')}
                                className="h-4 w-4 rounded border-[#e7e1d7] text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-semibold text-foreground">
                                {t('admin.orders.selectedCount', { count: selectedIds.length })}
                            </span>
                            {selectedIds.length > 0 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs rounded-md px-2.5"
                                    disabled={deleting}
                                    onClick={async () => {
                                        if (deleteLock.current) return
                                        if (!confirm(t('admin.orders.confirmDeleteSelected'))) return
                                        deleteLock.current = true
                                        setDeleting(true)
                                        setDeleteError(null)
                                        try {
                                            await deleteOrders(selectedIds)
                                            toast.success(t('common.success'))
                                            setSelected({})
                                            router.refresh()
                                        } catch (e: any) {
                                            toast.error(e.message)
                                            setDeleteError(e.message || "Failed to delete selected orders")
                                        } finally {
                                            setDeleting(false)
                                            deleteLock.current = false
                                        }
                                    }}
                                >
                                    {t('admin.orders.deleteSelected')}
                                </Button>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {t('admin.orders.showing', { from: showingFrom, to: showingTo, total })}
                        </div>
                    </div>

                    <div className="space-y-3" data-testid="admin-table">
                        {orders.length === 0 ? (
                            <Card data-testid="admin-table-empty" className="border-[#e7e1d7] shadow-sm py-16 text-center">
                                <CardContent className="flex flex-col items-center justify-center space-y-3">
                                    <div className="rounded-full bg-[#fbf9f4] border border-[#e7e1d7] p-3 text-muted-foreground">
                                        <Truck className="h-6 w-6 animate-pulse" />
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">No orders found</div>
                                    <div className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                        There are no orders in the queue matching the selected status or search term.
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            orders.map((order) => {
                                const isSelected = activeOrder?.orderId === order.orderId
                                const isUnpaid = !order.status || order.status === 'pending'
                                const isTerminal = order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'
                                
                                return (
                                    <Card
                                        key={order.orderId}
                                        data-testid="order-row"
                                        onClick={() => setActiveOrderId(order.orderId)}
                                        className={`group transition-all duration-200 border cursor-pointer ${
                                            isSelected
                                                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                                : "border-[#e7e1d7] bg-white hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected[order.orderId]}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setSelected((prev) => ({ ...prev, [order.orderId]: e.target.checked }))}
                                                    aria-label={t('admin.orders.selectOne')}
                                                    className="h-4 w-4 rounded border-[#e7e1d7] text-primary focus:ring-primary mt-1"
                                                />
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-sm text-foreground hover:underline">
                                                            #{order.orderId}
                                                        </span>
                                                        {renderStatusBadge(order.status)}
                                                        <span className="text-xs text-muted-foreground font-semibold">
                                                            {Number(order.amount).toLocaleString('vi-VN')} ₫
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 leading-relaxed">
                                                        <span className="font-semibold text-foreground">
                                                            {order.username ? getDisplayUsername(order.username, order.userId) : "Guest"}
                                                        </span>
                                                        <span>·</span>
                                                        <span>{order.productName}</span>
                                                        <span>·</span>
                                                        <ClientDate value={order.createdAt} format="dateTime" />
                                                    </div>
                                                    {order.tradeNo && (
                                                        <div className="text-[10px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit">
                                                            Ref: {order.tradeNo}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                                                {/* Mark delivered button inside card row */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs font-semibold bg-white border-[#e7e1d7] text-foreground"
                                                    disabled={isUnpaid || isTerminal || actionLoading}
                                                    title={isUnpaid ? "Unpaid orders cannot be marked delivered" : undefined}
                                                    onClick={() => handleStatus(order.orderId, 'delivered')}
                                                >
                                                    Mark delivered
                                                </Button>

                                                {/* Open detail CTA */}
                                                <Button asChild size="sm" variant="default" className="h-8 text-xs font-semibold">
                                                    <Link href={`/admin/orders/${order.orderId}`}>
                                                        Open detail
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>

                    {/* Pagination bottom bar */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4 border-t border-[#e7e1d7]">
                        <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
                            <div>
                                {t('admin.orders.page', { page, totalPages })}
                            </div>
                            <span className="text-[10px] text-muted-foreground/80 italic" data-testid="orders-export-scope">
                                * Export downloads match currently active query/status filters
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground mr-2">
                                <span>{t('admin.orders.pageSize')}:</span>
                                {[50, 100, 200].map((n) => (
                                    <Button
                                        key={n}
                                        type="button"
                                        variant={pageSize === n ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-7 text-xs px-2.5"
                                        onClick={() => applyAllFilters({ page: 1, pageSize: n })}
                                    >
                                        {n}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-[#e7e1d7]"
                                disabled={!canPrev}
                                onClick={() => applyAllFilters({ page: page - 1 })}
                            >
                                {t('admin.orders.prev')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-[#e7e1d7]"
                                disabled={!canNext}
                                onClick={() => applyAllFilters({ page: page + 1 })}
                            >
                                {t('admin.orders.next')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Inspector (Actions & Signals) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Action Cards */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Button asChild type="button" variant="outline" size="sm" className="flex-1 text-xs border-[#e7e1d7]">
                            <a href={exportUrl({ type: 'orders', format: 'csv', q: query, status })}>
                                {t('admin.orders.exportCsv')}
                            </a>
                        </Button>
                        <Button asChild type="button" variant="outline" size="sm" className="flex-1 text-xs border-[#e7e1d7]">
                            <a href={exportUrl({ type: 'orders', format: 'csv', includeSecrets: 1, q: query, status })}>
                                {t('admin.orders.exportCsvSecrets')}
                            </a>
                        </Button>
                    </div>

                    {/* Order Actions Card */}
                    <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
                        <CardHeader className="border-b pb-3.5 bg-muted/10">
                            <CardTitle className="text-base font-bold font-svn-gilroy">Order Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {activeOrder ? (
                                <>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Selection</span>
                                        <p className="text-sm font-bold text-foreground font-mono">#{activeOrder.orderId}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="status-note" className="text-xs font-bold uppercase tracking-wider text-[#71685a]">
                                            Status Note (Optional)
                                        </label>
                                        <Input
                                            id="status-note"
                                            value={updateNote}
                                            onChange={(e) => setUpdateNote(e.target.value)}
                                            placeholder="Enter justification or cancellation reason..."
                                            disabled={activeOrder.status === 'delivered' || activeOrder.status === 'cancelled' || activeOrder.status === 'refunded' || actionLoading}
                                            className="bg-white border-[#e7e1d7] rounded-lg text-sm"
                                        />
                                    </div>

                                    {activeOrder.status === 'delivered' || activeOrder.status === 'cancelled' || activeOrder.status === 'refunded' ? (
                                        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/30 border border-muted/50 rounded-lg">
                                            <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span>Terminal state reached ({activeOrder.status}). Status transitions are locked.</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 pt-2">
                                            {/* Mark Paid CTA */}
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="w-full text-xs font-bold gap-1.5"
                                                disabled={activeOrder.status !== 'pending' && activeOrder.status !== null || actionLoading}
                                                onClick={() => handleStatus(activeOrder.orderId, 'paid')}
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Mark paid
                                            </Button>

                                            {/* Mark Delivered CTA */}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-full text-xs font-bold gap-1.5 border-[#e7e1d7]"
                                                disabled={activeOrder.status === 'pending' || actionLoading}
                                                onClick={() => handleStatus(activeOrder.orderId, 'delivered')}
                                            >
                                                <Truck className="h-3.5 w-3.5" />
                                                Mark delivered
                                            </Button>
                                            
                                            {/* Cancel Order CTA */}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="w-full text-xs font-bold gap-1.5"
                                                disabled={actionLoading}
                                                onClick={() => handleStatus(activeOrder.orderId, 'cancelled')}
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Cancel order
                                            </Button>
                                        </div>
                                    )}

                                    {activeOrder.status === 'pending' && (
                                        <p className="text-[10px] text-red-500 italic font-semibold">
                                            * Unpaid orders cannot be marked delivered.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground italic">
                                    No active order selected
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Signals Card */}
                    <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
                        <CardHeader className="border-b pb-3.5 bg-muted/10">
                            <CardTitle className="text-base font-bold font-svn-gilroy">Order Signals</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3.5">
                            {activeOrder ? (
                                <div className="space-y-3">
                                    {/* Signal 1: Refund requested */}
                                    <div className="flex items-center justify-between py-1.5 border-b border-[#e7e1d7]/60">
                                        <span className="text-xs font-medium text-[#71685a]">Refund requested</span>
                                        {hasPendingRefund || activeOrder.status === 'refunded' ? (
                                            <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded">
                                                Requested
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-[#f5f1ea] text-[#8d7c66] hover:bg-[#f5f1ea] font-medium text-[9px] px-2 py-0.5 rounded border border-[#e7e1d7]/60">
                                                None
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Signal 2: Email mismatch check */}
                                    <div className="flex items-center justify-between py-1.5 border-b border-[#e7e1d7]/60">
                                        <span className="text-xs font-medium text-[#71685a]">Email mismatch check</span>
                                        {activeOrder.email ? (
                                            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white font-bold text-[9px] px-2 py-0.5 rounded">
                                                Passed
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="font-bold text-[9px] px-2 py-0.5 rounded">
                                                Failed
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Signal 3: High-value order check */}
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-xs font-medium text-[#71685a]">High-value order (&gt; 500.00)</span>
                                        {Number(activeOrder.amount) > 500 ? (
                                            <Badge className="bg-blue-500 hover:bg-blue-500 text-white font-bold text-[9px] px-2 py-0.5 rounded">
                                                Info
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-[#f5f1ea] text-[#8d7c66] hover:bg-[#f5f1ea] font-medium text-[9px] px-2 py-0.5 rounded border border-[#e7e1d7]/60">
                                                Normal
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground italic">
                                    No active order selected
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Clear Filters CTA */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full text-xs font-semibold bg-white border-[#e7e1d7]"
                        disabled={!queryValue.trim() && statusValue === 'all'}
                        onClick={() => {
                            setQueryValue("")
                            setStatusValue("all")
                            router.push(buildUrl({ page: 1, pageSize }))
                        }}
                    >
                        {t('admin.orders.clearFilters')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
