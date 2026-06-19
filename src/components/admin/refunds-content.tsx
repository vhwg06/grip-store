'use client'

import { useMemo, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientDate } from "@/components/client-date"
import { adminApproveRefund, adminRejectRefund } from "@/adapters/api/admin.api"
import { RefundButton } from "@/components/admin/refund-button"
import { toast } from "sonner"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"

function statusVariant(status: string | null) {
  switch (status) {
    case 'approved': return 'secondary' as const
    case 'rejected': return 'destructive' as const
    case 'processed': return 'default' as const
    default: return 'outline' as const
  }
}

export function AdminRefundsContent({ requests }: { requests: any[] }) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [selectedRefund, setSelectedRefund] = useState<any | null>(requests[0] || null)
  const processingRef = useRef<number | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return requests
    return requests.filter((r) => {
      const hay = [
        r.orderId,
        r.username || '',
        r.userId || '',
        r.productName || '',
        r.reason || '',
        r.status || ''
      ].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [query, requests])

  const handle = async (id: number, action: 'approve' | 'reject') => {
    if (processingRef.current === id) return
    const note = prompt(t('admin.refunds.adminNotePrompt')) || ''
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

  return (
    <div className="w-[1056px] space-y-6">
      {/* Page Title to satisfy Figma contract */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
          <span>Admin</span>
          <span>/</span>
          <span>Commerce</span>
          <span>/</span>
          <span className="text-foreground font-medium">Refunds</span>
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy mt-[57px] leading-none">
          Refund Requests
        </h1>
        <p className="text-sm text-[#71685a] mt-[12px]">
          Process refunds, inspect order details, and moderate points compensation rules.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-[36px]">
        <div className="flex-1" />
        <Input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder={t('admin.refunds.searchPlaceholder')} 
          className="md:w-[340px] bg-white border-[#e7e1d7] rounded-lg" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Queue Panel */}
        <div data-testid="refunds-queue-container" className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 mb-2">
              <span className="text-sm font-bold text-foreground">Refund Requests</span>
              <span className="text-xs text-muted-foreground">{filtered.length} requests matching filters</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No refund requests found</div>
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filtered.map((r) => {
                  const isSelected = selectedRefund?.id === r.id
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRefund(r)}
                      className={`group flex flex-col gap-2 p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {r.username ? getDisplayUsername(r.username, r.userId) : "-"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">ID: {r.id}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={statusVariant(r.status)} className="uppercase text-[10px] px-1 py-0">
                          {t(`admin.refunds.statusValues.${r.status || 'pending'}`)}
                        </Badge>
                        <span className="text-muted-foreground text-[10px]">
                          <ClientDate value={r.createdAt} format="dateTime" />
                        </span>
                      </div>

                      <p className="text-sm font-medium text-foreground truncate mt-1">
                        {r.productName || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">
                        "{r.reason || '-'}"
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panels */}
        <div className="lg:col-span-5 space-y-6">
          {/* Decision Panel */}
          <Card data-testid="refunds-decision-panel" className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3.5 bg-muted/10">
              <CardTitle className="text-base font-bold font-svn-gilroy">Decision</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {selectedRefund ? (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Order ID</span>
                    <p className="text-sm font-bold text-foreground font-mono">{selectedRefund.orderId}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Product</span>
                    <p className="text-sm font-bold text-foreground">{selectedRefund.productName || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">User</span>
                    {selectedRefund.username ? (
                      <a href={getExternalProfileUrl(selectedRefund.username, selectedRefund.userId) || "#"} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline block">
                        {getDisplayUsername(selectedRefund.username, selectedRefund.userId)} (ID: {selectedRefund.userId})
                      </a>
                    ) : (
                      <p className="text-sm text-foreground">-</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Amount / Value</span>
                    <p className="text-sm font-bold text-foreground">{selectedRefund.amount || '-'}</p>
                  </div>

                  <div className="flex items-center justify-between bg-muted/10 p-2.5 rounded-lg border">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                    <Badge variant={statusVariant(selectedRefund.status)} className="uppercase text-xs">
                      {t(`admin.refunds.statusValues.${selectedRefund.status || 'pending'}`)}
                    </Badge>
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-4">
                    {(selectedRefund.status === 'pending' || !selectedRefund.status) && (
                      <>
                        <Button variant="outline" onClick={() => handle(selectedRefund.id, 'approve')} disabled={processingId === selectedRefund.id}>
                          {t('admin.refunds.approve')}
                        </Button>
                        <Button variant="destructive" onClick={() => handle(selectedRefund.id, 'reject')} disabled={processingId === selectedRefund.id}>
                          {t('admin.refunds.reject')}
                        </Button>
                      </>
                    )}
                    {selectedRefund.status === 'approved' && (
                      <RefundButton order={{
                        orderId: selectedRefund.orderId,
                        tradeNo: selectedRefund.tradeNo,
                        amount: selectedRefund.amount,
                        status: selectedRefund.orderStatus,
                        cardKey: selectedRefund.cardKey
                      }} />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground italic">
                  Select a refund request from the queue to view decision.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Panel */}
          <Card data-testid="refunds-evidence-panel" className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3.5 bg-muted/10">
              <CardTitle className="text-base font-bold font-svn-gilroy">Evidence</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {selectedRefund ? (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Reason</span>
                    <div className="text-sm text-foreground bg-muted/20 p-3 rounded-lg border min-h-[64px] whitespace-pre-wrap break-words leading-relaxed">
                      {selectedRefund.reason || <span className="text-muted-foreground italic">No reason provided.</span>}
                    </div>
                  </div>

                  {selectedRefund.adminNote && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">{t('admin.refunds.adminNote')}</span>
                      <div className="text-xs text-muted-foreground bg-muted/10 p-2.5 rounded border">
                        {selectedRefund.adminNote}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground italic">
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
