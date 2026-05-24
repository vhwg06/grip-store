'use client'

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/copy-button"
import { ClientDate } from "@/components/client-date"
import { RefundButton } from "@/components/admin/refund-button"
import { toast } from "sonner"
import { deleteOrder, updateAdminOrderStatus } from "@/adapters/api/admin.api"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"

function statusVariant(status: string | null) {
  switch (status) {
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
  const actionLock = useRef(false)

  const handleStatus = async (newStatus: string) => {
    if (actionLock.current) return
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái thành ${newStatus}?`)) return
    try {
      actionLock.current = true
      setActionLoading(true)
      await updateAdminOrderStatus(order.id, newStatus, updateNote || undefined)
      toast.success(t('common.success'))
      setUpdateNote("")
      // Typically we might want to mutate here if we used SWR correctly, 
      // but since data is passed as prop we might just reload or router.refresh
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(false)
      actionLock.current = false
    }
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng {order.orderNumber || order.id}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={statusVariant(order.status)} className="uppercase text-xs">{order.status}</Badge>
            <span className="text-sm text-muted-foreground"><ClientDate value={order.createdAt} format="dateTime" /></span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/orders">{t('common.back')}</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sản phẩm ({order.items?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                <div>
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-sm text-muted-foreground">SKU: {item.sku || '-'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{item.price.toLocaleString('vi-VN')} ₫ x {item.quantity}</div>
                                    <div className="font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 text-lg">
                            <span className="font-bold">Tổng cộng:</span>
                            <span className="font-bold text-primary">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cập nhật trạng thái</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Ghi chú trạng thái (Tùy chọn)</Label>
                        <Input 
                            value={updateNote} 
                            onChange={(e) => setUpdateNote(e.target.value)} 
                            placeholder="Mã vận đơn, lý do hủy..." 
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {order.status === 'PENDING' && (
                            <Button onClick={() => handleStatus('PROCESSING')} disabled={actionLoading}>Xác nhận & Xử lý</Button>
                        )}
                        {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                            <Button onClick={() => handleStatus('SHIPPED')} variant="secondary" disabled={actionLoading}>Đã giao cho ĐVVC</Button>
                        )}
                        {order.status === 'SHIPPED' && (
                            <Button onClick={() => handleStatus('DELIVERED')} variant="default" className="bg-green-600 hover:bg-green-700" disabled={actionLoading}>Giao hàng thành công</Button>
                        )}
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            <Button variant="destructive" onClick={() => handleStatus('CANCELLED')} disabled={actionLoading}>Hủy đơn</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 border-l-2 border-muted ml-3 pl-4">
                        {order.timeline?.map((event: any, idx: number) => (
                            <div key={idx} className="relative">
                                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary" />
                                <div className="font-medium">{event.status}</div>
                                <div className="text-xs text-muted-foreground"><ClientDate value={event.timestamp} format="dateTime" /></div>
                                {event.note && <div className="text-sm mt-1 bg-muted p-2 rounded-md">{event.note}</div>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm text-muted-foreground">Tên</div>
                        <div className="font-medium">{order.customerName}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Số điện thoại</div>
                        <div className="font-medium">{order.customerPhone}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{order.customerEmail || '-'}</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Giao hàng & Thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm text-muted-foreground">Địa chỉ giao hàng</div>
                        <div className="font-medium leading-relaxed">{order.shippingAddress}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Phương thức thanh toán</div>
                        <div className="font-medium">{order.paymentMethod}</div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                 <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                    {t('admin.orders.delete')}
                 </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
