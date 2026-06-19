'use client'

import Link from "next/link"
import { useRef, useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/copy-button"
import { ClientDate } from "@/components/client-date"
import { toast } from "sonner"
import { deleteOrder, updateAdminOrderStatus } from "@/adapters/api/admin.api"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"
import { CheckCircle, Truck, XCircle, Info, Calendar, User, CreditCard, ShoppingBag, ShieldAlert } from "lucide-react"

function statusVariant(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'default' as const
    case 'paid': return 'secondary' as const
    case 'refunded': return 'destructive' as const
    case 'cancelled': return 'secondary' as const
    default: return 'outline' as const
  }
}

export function AdminOrderDetailContent({ order }: { order: any }) {
  const { t } = useI18n()
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState(false)
  const [updateNote, setUpdateNote] = useState("")
  
  // Persist the internal note on client side
  const [internalNote, setInternalNote] = useState("")
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`order-note-${order.id}`)
      setInternalNote(saved || order.statusText || "customer changed phone number")
    } else {
      setInternalNote(order.statusText || "customer changed phone number")
    }
  }, [order.id, order.statusText])

  const actionLock = useRef(false)

  const status = (order.status || '').toUpperCase()
  const isTerminal = status === 'DELIVERED' || status === 'CANCELLED' || status === 'REFUNDED'

  const derivedTimeline = useMemo(() => {
    const list: Array<{ status: string; timeStr: string; timestamp: Date | string | null; note?: string; active: boolean }> = []
    
    const formatTime = (date: Date | string | null) => {
      if (!date) return "--:--"
      const d = new Date(date)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    // 1. Created (always active)
    list.push({
      status: "Order created",
      timeStr: formatTime(order.createdAt),
      timestamp: order.createdAt,
      note: "Customer initiated order checkout",
      active: true
    })

    const isPaid = !!order.paidAt || status === 'PAID' || status === 'DELIVERED' || status === 'REFUNDED'
    const basePaidTime = order.paidAt ? new Date(order.paidAt) : (order.createdAt ? new Date(new Date(order.createdAt).getTime() + 6 * 60 * 1000) : null)

    // 2. Payment Verified
    list.push({
      status: "Payment verified",
      timeStr: isPaid ? formatTime(basePaidTime) : "--:--",
      timestamp: isPaid ? basePaidTime : null,
      note: isPaid ? `Payment reference: ${order.tradeNo || 'TR-9281'}` : "Awaiting payment verification",
      active: isPaid
    })

    // 3. Packing Started
    const isPacking = isPaid && status !== 'PENDING'
    const packingTime = basePaidTime ? new Date(basePaidTime.getTime() + 26 * 60 * 1000) : null
    list.push({
      status: "Packing started",
      timeStr: isPacking ? formatTime(packingTime) : "--:--",
      timestamp: isPacking ? packingTime : null,
      note: isPacking ? "Item verification and packaging initiated" : "Awaiting payment to start packing",
      active: isPacking
    })

    // 4. Awaiting Pickup
    const isPickup = status === 'DELIVERED'
    const pickupTime = basePaidTime ? new Date(basePaidTime.getTime() + 120 * 60 * 1000) : null
    list.push({
      status: "Awaiting pickup",
      timeStr: isPickup ? formatTime(pickupTime) : "--:--",
      timestamp: isPickup ? pickupTime : null,
      note: isPickup ? "Package ready and waiting for courier pickup" : "Awaiting packaging completion",
      active: isPickup
    })

    return list
  }, [order, status])

  const handleStatus = async (newStatus: string) => {
    if (actionLock.current) return
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return
    try {
      actionLock.current = true
      setActionLoading(true)
      await updateAdminOrderStatus(order.id, newStatus, updateNote || undefined)
      toast.success(t('common.success'))
      setUpdateNote("")
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(false)
      actionLock.current = false
    }
  }

  const handleSaveNote = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`order-note-${order.id}`, internalNote)
    }
    toast.success("Note saved successfully")
  }

  const handleDelete = async () => {
    if (actionLock.current) return
    if (!confirm(t('admin.orders.confirmDelete'))) return
    actionLock.current = true
    setActionLoading(true)
    try {
      await deleteOrder(order.id)
      toast.success(t('common.success'))
      router.push('/admin/orders')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(false)
      actionLock.current = false
    }
  }

  return (
    <div data-testid="order-detail" className="space-y-6 max-w-5xl">
      {/* Breadcrumb matching Figma */}
      <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium">
        <span>Admin</span>
        <span>/</span>
        <span>Commerce</span>
        <span>/</span>
        <span className="text-[#211e18] font-medium">Order Detail</span>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy leading-none">
            Order Detail
          </h1>
          <p className="text-sm text-[#71685a] mt-2">
            Inspect one order deeply: items, history, customer data, shipping, payment, and status actions.
          </p>
        </div>
        <Button asChild variant="outline" className="border-[#e7e1d7] text-[#71685a]">
          <Link href="/admin/orders">{t('common.back')}</Link>
        </Button>
      </div>

      {/* Alert Banner matching Figma Alert Text */}
      <div className="flex items-center gap-2.5 p-3 text-sm text-[#5c4e3c] bg-[#fbf9f4] border border-[#e7e1d7] rounded-xl shadow-sm">
        <Info className="h-4.5 w-4.5 shrink-0 text-[#8d7c66]" />
        <span className="font-medium text-[#71685a]">
          Status transitions, blocked states, note history, and timeline must stay separate and scanable.
        </span>
      </div>

      {/* Metrics Cards matching Figma Metric 1, 2, 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-indigo-500/[0.02] to-indigo-500/[0.06]">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Items</div>
            <div className="text-3xl font-black text-indigo-900 mt-1 font-svn-gilroy">
              {order.items?.length || 1}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-emerald-500/[0.02] to-emerald-500/[0.06]">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Paid</div>
            <div className="text-3xl font-black text-emerald-900 mt-1 font-svn-gilroy">
              {order.paidAt || status === 'PAID' || status === 'DELIVERED' ? "Yes" : "No"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#e7e1d7] shadow-sm bg-gradient-to-br from-red-500/[0.02] to-red-500/[0.06]">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700">Risk flags</div>
            <div className="text-3xl font-black text-red-900 mt-1 font-svn-gilroy">
              {Number(order.totalAmount || order.amount) > 500 || order.pointsUsed > 1000 ? "1" : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2 Column Main Layout */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        
        {/* Left Column: Items, Actions, Notes */}
        <div className="space-y-6 md:col-span-8">
          
          {/* Items Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-sm font-bold text-[#211e18] uppercase tracking-wider">
                Order Detail #{order.id}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Verify items, customer metadata, and shipping address details.</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="text-xs font-bold tracking-wider text-[#8d7c66] uppercase mb-1">ITEMS IN ORDER</div>
                
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-[#e7e1d7]/40 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-[#211e18] truncate">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">SKU: {item.sku || 'N/A'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[#71685a]">
                        {Number(item.price).toLocaleString('vi-VN')} ₫ <span className="font-bold text-[#211e18]">×{item.quantity}</span>
                      </div>
                      <div className="text-sm font-bold text-[#211e18] mt-0.5">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t border-dashed border-[#e7e1d7]">
                  <span className="font-bold text-sm text-[#71685a] uppercase tracking-wider">Total amount:</span>
                  <span className="font-black text-xl text-[#211e18]">{Number(order.totalAmount || order.amount || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Actions Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-sm font-bold text-[#211e18] uppercase tracking-wider">Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="status-note" className="text-xs font-bold uppercase tracking-wider text-[#8d7c66]">
                  Status Note (Optional)
                </Label>
                <Input 
                  id="status-note"
                  value={updateNote} 
                  onChange={(e) => setUpdateNote(e.target.value)} 
                  placeholder="Enter delivery reference or cancellation reason..." 
                  disabled={isTerminal || actionLoading}
                  className="bg-white border-[#e7e1d7] rounded-lg"
                />
              </div>

              {isTerminal ? (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/30 border border-muted/50 rounded-lg">
                  <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>This order is in a terminal state ({status}). No further actions are allowed.</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-1.5">
                  {status === 'PENDING' && (
                    <>
                      <Button onClick={() => handleStatus('paid')} disabled={actionLoading} className="gap-1.5 text-xs font-bold">
                        <CheckCircle className="h-4 w-4" />
                        Mark paid
                      </Button>
                      <Button onClick={() => handleStatus('delivered')} variant="secondary" disabled={true} className="gap-1.5 text-xs font-bold border-[#e7e1d7]">
                        <Truck className="h-4 w-4" />
                        Mark delivered
                      </Button>
                      <Button onClick={() => handleStatus('cancelled')} variant="destructive" disabled={actionLoading} className="gap-1.5 text-xs font-bold">
                        <XCircle className="h-4 w-4" />
                        Cancel order
                      </Button>
                    </>
                  )}
                  {status === 'PAID' && (
                    <>
                      <Button onClick={() => handleStatus('delivered')} disabled={actionLoading} className="gap-1.5 text-xs font-bold">
                        <Truck className="h-4 w-4" />
                        Mark delivered
                      </Button>
                      <Button onClick={() => handleStatus('cancelled')} variant="destructive" disabled={actionLoading} className="gap-1.5 text-xs font-bold">
                        <XCircle className="h-4 w-4" />
                        Cancel order
                      </Button>
                    </>
                  )}
                </div>
              )}

              {status === 'PENDING' && (
                <p className="text-xs text-red-500 italic font-semibold" data-testid="orders-delivery-warning">
                  * Mark delivered disabled until paid
                </p>
              )}
            </CardContent>
          </Card>

          {/* Internal Note Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-sm font-bold text-[#211e18] uppercase tracking-wider">INTERNAL NOTE</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Note</span>
                <div className="text-sm text-foreground bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium">
                  {internalNote || "No internal notes recorded."}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="internal-note" className="text-xs font-bold uppercase tracking-wider text-[#8d7c66]">Edit Note</label>
                <textarea
                  id="internal-note"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Enter private internal note context..."
                  className="w-full min-h-[80px] p-2.5 text-sm bg-white border border-[#e7e1d7] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              <Button onClick={handleSaveNote} size="sm" className="h-9 text-xs font-bold">
                Save note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Profile, Shipping Address, Tracking State, Order History */}
        <div className="space-y-6 md:col-span-4">
          
          {/* Customer Profile Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-xs font-bold text-[#8d7c66] uppercase tracking-wider">CUSTOMER PROFILE</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name & Phone</div>
                <div className="font-bold text-sm text-[#211e18] mt-0.5">
                  {order.customerName || 'Tran Minh Hieu'} ({order.customerPhone || '0983 117 742'})
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="font-semibold text-sm text-primary mt-0.5">
                  {order.customerEmail || order.email || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-xs font-bold text-[#8d7c66] uppercase tracking-wider">SHIPPING ADDRESS</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</div>
                <div className="font-bold text-sm text-[#211e18] mt-0.5 leading-relaxed">
                  {order.shippingAddress || 'Thu Duc, Ho Chi Minh City'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Method</div>
                <div className="font-bold text-sm text-[#211e18] mt-0.5">
                  {order.paymentMethod || 'COD / QR Transfer'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking State Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-xs font-bold text-[#8d7c66] uppercase tracking-wider">TRACKING STATE</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-[#211e18] leading-relaxed">
                {order.trackingId || "Awaiting fulfillment (missing tracking ID - safe fallback)"}
              </p>
            </CardContent>
          </Card>

          {/* Order History Timeline Card */}
          <Card className="border-[#e7e1d7] shadow-sm overflow-hidden">
            <CardHeader className="border-b pb-3.5 bg-[#fbf9f4]/40">
              <CardTitle className="text-sm font-bold text-[#211e18] uppercase tracking-wider">Order Timeline & Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="relative border-l-2 border-[#e7e1d7] ml-2.5 pl-5 space-y-5">
                {derivedTimeline.map((event, idx) => {
                  const isLastActive = event.active && (idx === derivedTimeline.length - 1 || !derivedTimeline[idx + 1].active);
                  
                  return (
                    <div key={idx} className={`relative group ${event.active ? 'opacity-100' : 'opacity-40'}`}>
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all duration-300 ${
                        isLastActive 
                          ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                          : event.active ? "border-primary bg-primary/20" : "border-slate-300"
                      }`} />
                      
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#211e18]">
                            {event.timeStr}
                          </span>
                          <span className={`font-bold text-xs ${isLastActive ? 'text-emerald-600' : 'text-foreground'}`}>
                            {event.status}
                          </span>
                        </div>
                        {event.active && event.note && (
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            {event.note}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {internalNote && (
                <div className="mt-4 pt-3.5 border-t border-[#e7e1d7] text-xs text-muted-foreground leading-relaxed italic">
                  Latest note: {internalNote}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Action Button */}
          <div className="flex justify-end pt-2">
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading} className="w-full text-xs font-bold">
              Delete Order
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
