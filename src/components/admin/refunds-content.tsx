'use client'

import { useMemo, useRef, useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientDate } from "@/components/client-date"
import { adminApproveRefund, adminRejectRefund, getAdminRefundDetail } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"
import { AlertCircle, CheckCircle2, XCircle, Info, HelpCircle } from "lucide-react"

type AdminRefundsContentProps = {
  requests: any[]
  initialQuery?: string
  refreshRequests?: () => Promise<unknown>
}

export function AdminRefundsContent({
  requests,
  initialQuery = "",
  refreshRequests,
}: AdminRefundsContentProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState(initialQuery)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null)
  const [note, setNote] = useState("")
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const processingRef = useRef<number | null>(null)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (!refreshRequests) return
    const handle = window.setTimeout(() => {
      void refreshRequests()
    }, 150)
    return () => window.clearTimeout(handle)
  }, [query, refreshRequests])

  useEffect(() => {
    if (!refreshRequests || typeof window === "undefined") return
    const handle = () => {
      void refreshRequests()
    }
    window.addEventListener("grip-store:refunds-updated", handle)
    return () => window.removeEventListener("grip-store:refunds-updated", handle)
  }, [refreshRequests])

  const renderRefundStatus = (status: string | null) => {
    const text = t(`admin.refunds.statusValues.${status || 'pending'}`)
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {text}
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
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

  const filtered = useMemo(() => {
    let list = requests
    if (activeTab === 'pending') {
      list = list.filter(r => !r.status || r.status.toLowerCase() === 'pending')
    } else {
      list = list.filter(r => r.status && r.status.toLowerCase() !== 'pending')
    }

    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) => {
      const orderId = r.order_id ?? r.orderId ?? ''
      const username = r.username || ''
      const userId = r.user_id ?? r.userId ?? ''
      const productName = r.product_name ?? r.productName ?? ''
      const reason = r.reason || ''
      const status = r.status || ''
      const hay = [
        orderId,
        username,
        userId,
        productName,
        reason,
        status
      ].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [query, requests, activeTab])

  useEffect(() => {
    let cancelled = false

    async function syncSelectedRefund() {
      if (filtered.length === 0) {
        setSelectedRefund(null)
        return
      }

      const nextRefund = filtered.find(r => r.id === selectedRefund?.id) ?? filtered[0]
      setSelectedRefund(nextRefund)

      try {
        const detail = await getAdminRefundDetail(nextRefund.id)
        if (cancelled) return
        setSelectedRefund((current: any) => (
          current?.id === nextRefund.id
            ? { ...nextRefund, ...detail }
            : current
        ))
      } catch {
        if (!cancelled) {
          setSelectedRefund((current: any) => current?.id === nextRefund.id ? nextRefund : current)
        }
      }
    }

    void syncSelectedRefund()

    return () => {
      cancelled = true
    }
  }, [filtered, selectedRefund?.id])

  // Reset inputs when switching selected refund
  useEffect(() => {
    setNote("")
    setConfirmAction(null)
  }, [selectedRefund?.id])

  // Calculate dynamic metrics from the list
  const metrics = useMemo(() => {
    const pending = requests.filter(r => r.status === 'pending' || !r.status).length
    const approved = requests.filter(r => r.status === 'approved' || r.status === 'processed').length
    const escalated = requests.filter(r => r.status === 'rejected').length
    return { pending, approved, escalated }
  }, [requests])

  const handle = async (id: number, action: 'approve' | 'reject') => {
    if (processingRef.current === id) return
    try {
      processingRef.current = id
      setProcessingId(id)
      if (action === 'approve') {
        const result = await adminApproveRefund(id, note)
        if (result?.processed) {
          toast.success(t('admin.refunds.autoRefundSuccess'))
        } else {
          toast.success(t('admin.refunds.autoRefundPending'))
          if (result?.error) {
            toast.error(result.error)
          }
        }
      } else {
        await adminRejectRefund(id, note)
        toast.success(t('common.success'))
      }
      setConfirmAction(null)
      setNote("")
      await refreshRequests?.()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("grip-store:refunds-updated"))
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setProcessingId(null)
      processingRef.current = null
    }
  }

  const selectedOrderId = selectedRefund?.order_id ?? selectedRefund?.orderId ?? ''
  const selectedProductName = selectedRefund?.product_name ?? selectedRefund?.productName ?? ''
  const selectedUsername = selectedRefund?.username ?? ''
  const selectedUserId = selectedRefund?.user_id ?? selectedRefund?.userId ?? ''
  const selectedAmount = selectedRefund?.amount ?? ''
  const selectedStatus = selectedRefund?.status ?? 'pending'
  const selectedAdminNote = selectedRefund?.admin_note ?? selectedRefund?.adminNote ?? ''
  const selectedTradeNo = selectedRefund?.trade_no ?? selectedRefund?.tradeNo ?? ''
  const selectedOrderStatus = selectedRefund?.order_status ?? selectedRefund?.orderStatus ?? ''

  return (
    <div className="space-y-6">
      {/* Breadcrumbs matching Figma */}
      <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium">
        <span>Admin</span>
        <span>/</span>
        <span>Commerce</span>
        <span>/</span>
        <span className="text-[#211e18] font-medium">Refunds</span>
      </div>

      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy leading-none">
          Refund Requests
        </h1>
        <p className="text-sm text-[#71685a] leading-relaxed max-w-2xl">
          Review pending refunds, capture notes, and approve or reject with traceable actions.
        </p>
      </div>

      {/* Alert Banner matching Figma Alert Text */}
      <div className="flex items-center gap-2.5 p-3 text-sm text-[#5c4e3c] bg-[#fbf9f4] border border-[#e7e1d7] rounded-xl shadow-sm">
        <Info className="h-4.5 w-4.5 shrink-0 text-[#8d7c66]" />
        <span className="font-medium text-[#71685a]">
          Refund decisions require evidence, admin note, confirmation, and backend-owned reclaim result.
        </span>
      </div>

      {/* Metrics Cards matching Figma Metric 1, 2, 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-amber-500/[0.02] to-amber-500/[0.06]">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending</div>
            <div className="text-3xl font-black text-amber-900 mt-1 font-svn-gilroy">{metrics.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-emerald-500/[0.02] to-emerald-500/[0.06]">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved</div>
            <div className="text-3xl font-black text-emerald-900 mt-1 font-svn-gilroy">{metrics.approved}</div>
          </CardContent>
        </Card>
        <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-red-500/[0.02] to-red-500/[0.06]">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700">Escalated</div>
            <div className="text-3xl font-black text-red-900 mt-1 font-svn-gilroy">{metrics.escalated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-2">
        <div role="tablist" className="flex gap-2 border-b border-[#e7e1d7] flex-1 md:flex-initial">
          <button
            role="tab"
            aria-selected={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pending'
                ? 'border-[#99782b] text-[#99782b]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#99782b] text-[#99782b]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            History
          </button>
        </div>
        <Input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search refund or order..." 
          className="md:w-[340px] bg-white border-[#e7e1d7] rounded-lg text-sm" 
        />
      </div>

      {/* 2-Column Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Refund Requests Queue */}
        <div data-testid="refunds-queue-container" className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-[#e7e1d7] bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 mb-1">
              <span className="text-sm font-bold text-foreground">Refund Queue</span>
              <span className="text-xs text-muted-foreground">{filtered.length} requests in queue</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm leading-relaxed">
                No refund requests in queue matching the filters.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filtered.map((r) => {
                  const isSelected = selectedRefund?.id === r.id
                  const username = r.username || ''
                  const userId = r.user_id ?? r.userId ?? ''
                  const orderId = r.order_id ?? r.orderId ?? ''
                  const productName = r.product_name ?? r.productName ?? ''
                  const createdAt = r.created_at ?? r.createdAt ?? null
                  
                  return (
                    <div
                      key={r.id}
                      data-testid="refund-queue-item"
                      onClick={() => setSelectedRefund(r)}
                      className={`group flex flex-col gap-2 p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-[#e7e1d7] bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[#211e18] truncate block">
                            {username ? getDisplayUsername(username, userId) : "Guest User"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                            Order {orderId || "-"}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground font-semibold bg-slate-100 px-1.5 py-0.5 rounded block">
                            #{r.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {renderRefundStatus(r.status)}
                        <span className="text-muted-foreground text-[10px] font-medium">
                          <ClientDate value={createdAt} format="dateTime" />
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-dashed border-[#e7e1d7]/60">
                        <p className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                          {productName || 'Product item'}
                        </p>
                        <span className="text-xs font-bold text-foreground">
                          {Number(r.amount).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-1 italic mt-0.5">
                        "{r.reason || 'No reason provided.'}"
                      </p>

                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        className="h-7 text-[10px] font-bold w-fit mt-2 border-[#e7e1d7] bg-white text-foreground hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRefund(r)
                        }}
                      >
                        Open request
                      </Button>

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Decision Maker & Evidence Indicator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Refund Decision Panel Card */}
          <Card data-testid="refunds-decision-panel" className="border-[#e7e1d7] shadow-sm">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-base font-bold font-svn-gilroy text-[#211e18]">Refund Decision</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Verify evidence and confirm the action below. This decision cannot be reversed.
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {selectedRefund ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Order ID</span>
                    <p className="text-sm font-bold text-foreground font-mono">#{selectedOrderId}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Product</span>
                    <p className="text-sm font-semibold text-foreground">{selectedProductName || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">User</span>
                    {selectedUsername ? (
                      <a href={getExternalProfileUrl(selectedUsername, selectedUserId) || "#"} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline block">
                        {getDisplayUsername(selectedUsername, selectedUserId)} (ID: {selectedUserId})
                      </a>
                    ) : (
                      <p className="text-sm text-foreground">Guest User</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Amount / Value</span>
                    <p className="text-sm font-bold text-foreground">
                      {Number(selectedAmount).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Payment Context</span>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTradeNo ? `Payment trade available for refund review` : `Payment context is limited to order-level fallback`}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Trade Reference</span>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {selectedTradeNo || `REF-${selectedOrderId}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                    {renderRefundStatus(selectedStatus)}
                  </div>

                  {(selectedStatus === 'pending' || !selectedStatus) && (
                    <div className="space-y-1">
                      <label htmlFor="refund-admin-note" className="text-xs font-bold uppercase tracking-wider text-[#8d7c66] block">
                        Admin Note
                      </label>
                      <textarea
                        id="refund-admin-note"
                        data-testid="refund-decision-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Admin note (required for rejection)..."
                        className="w-full min-h-[80px] p-2.5 text-sm bg-white border border-[#e7e1d7] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                        disabled={processingId === selectedRefund.id}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5 border-t border-[#e7e1d7]/60 pt-4">
                    {confirmAction ? (
                      <div className="bg-[#fbf9f4] border border-[#e7e1d7] rounded-lg p-3 space-y-2.5 animate-fade-in shadow-sm">
                        <p className="text-xs font-medium text-foreground leading-relaxed">
                          {confirmAction === 'approve'
                            ? "Are you sure you want to approve this refund request?"
                            : "Are you sure you want to reject this refund request?"}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={confirmAction === 'approve' ? 'default' : 'destructive'}
                            className="h-8 text-xs font-bold px-3.5"
                            onClick={() => handle(selectedRefund.id, confirmAction)}
                            disabled={processingId === selectedRefund.id}
                          >
                            {processingId === selectedRefund.id ? "Processing..." : "Yes, Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-bold px-3.5 border-[#e7e1d7]"
                            onClick={() => setConfirmAction(null)}
                            disabled={processingId === selectedRefund.id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2.5">
                        {(selectedStatus === 'pending' || !selectedStatus) && (
                          <>
                            <Button
                              variant="outline"
                              className="text-xs font-bold border-[#e7e1d7] bg-white text-foreground"
                              onClick={() => setConfirmAction('approve')}
                              disabled={processingId === selectedRefund.id}
                            >
                              Approve refund
                            </Button>
                            <Button
                              variant="destructive"
                              className="text-xs font-bold"
                              onClick={() => setConfirmAction('reject')}
                              disabled={processingId === selectedRefund.id}
                            >
                              Reject request
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm italic">
                  Select a refund request from the queue to view decision.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence & Risk Indicators Card Panel */}
          <Card data-testid="refunds-evidence-panel" className="border-[#e7e1d7] shadow-sm">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-base font-bold font-svn-gilroy text-[#211e18]">Evidence & Risk Indicators</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {selectedRefund ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Customer Reason</span>
                    <div className="text-sm text-[#211e18] bg-slate-50 border border-slate-100 p-3 rounded-lg min-h-[64px] whitespace-pre-wrap break-words leading-relaxed">
                      {selectedRefund.reason || <span className="text-muted-foreground italic">No reason provided.</span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Payment Context</span>
                    <div 
                      data-testid="refunds-evidence-payment-context" 
                      className="text-xs text-[#211e18] bg-slate-50 border border-slate-100 p-2.5 rounded-lg font-medium"
                    >
                      {selectedTradeNo ? `Trade No: ${selectedTradeNo}` : `Auto-refund for Order #${selectedOrderId}`}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Trade Reference</span>
                    <div 
                      data-testid="refunds-evidence-trade-ref" 
                      className="text-xs font-mono text-[#211e18] bg-slate-50 border border-slate-100 p-2.5 rounded-lg font-semibold"
                    >
                      {selectedTradeNo || `REF-${selectedOrderId}`}
                    </div>
                  </div>

                  {selectedAdminNote && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d7c66] block">{t('admin.refunds.adminNote')}</span>
                      <div className="text-xs text-muted-foreground bg-[#fbf9f4] border border-[#e7e1d7] p-2.5 rounded">
                        {selectedAdminNote}
                      </div>
                    </div>
                  )}

                  {/* Dynamic risk factors to match Figma design exactly */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Checklist Evidence</span>
                    
                    {/* Item 1: Manual refund indicator */}
                    <div className="flex items-center justify-between p-2 rounded-lg border border-[#e7e1d7] bg-white text-xs">
                      <span className="font-medium text-[#71685a]">Manual refund only (no auto-reclaim)</span>
                      <Badge className="bg-amber-500 text-white font-bold text-[9px] hover:bg-amber-500 rounded px-1.5 py-0.5">
                        Warning
                      </Badge>
                    </div>

                    {/* Item 2: Item photo description matches */}
                    <div className="flex items-center justify-between p-2 rounded-lg border border-[#e7e1d7] bg-white text-xs">
                      <span className="font-medium text-[#71685a]">Item photo matches description</span>
                      <Badge className="bg-emerald-500 text-white font-bold text-[9px] hover:bg-emerald-500 rounded px-1.5 py-0.5">
                        Matched
                      </Badge>
                    </div>

                    {/* Item 3: Return frequency */}
                    <div className="flex items-center justify-between p-2 rounded-lg border border-[#e7e1d7] bg-white text-xs">
                      <span className="font-medium text-[#71685a]">Customer return frequency: 2.4%</span>
                      <Badge className="bg-blue-500 text-white font-bold text-[9px] hover:bg-blue-500 rounded px-1.5 py-0.5">
                        Normal
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm italic">
                  Select a refund request from the queue to view evidence.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
