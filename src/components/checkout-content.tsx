'use client'

import { useState } from "react"
import { useCart } from "@/application/hooks/useCart"
import { useCheckout } from "@/application/hooks/useCheckout"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

export function CheckoutContent() {
    const { cart, clearCart } = useCart()
    const cartItems = cart?.items || []
    const { createOrder } = useCheckout()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        paymentMethod: 'COD' as 'COD' | 'BANK_TRANSFER'
    })

    const totalAmount = cartItems?.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) || 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cartItems || cartItems.length === 0) return

        if (!form.name || !form.phone || !form.address) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng")
            return
        }

        setSubmitting(true)
        try {
            const items = cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
            const result = await createOrder({
                items,
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                notes: form.notes,
                paymentMethod: form.paymentMethod
            })

            if (result.success) {
                toast.success("Đặt hàng thành công!")
                // Clear cart (assuming server does this or we can do a local clean up mutate)
                clearCart()
                router.push("/checkout/success") // Assuming success page or maybe track order
            } else {
                toast.error(result.error || "Có lỗi xảy ra khi đặt hàng")
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-24">
                <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
                <Button onClick={() => router.push('/catalog')}>Tiếp tục mua sắm</Button>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 py-12">
            <div className="lg:col-span-7 space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-6">Thông tin giao hàng</h2>
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Họ và tên *</Label>
                                <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại *</Label>
                                <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ giao hàng chi tiết *</Label>
                            <Input id="address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Ghi chú đơn hàng (Tùy chọn)</Label>
                            <Textarea id="notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                        </div>
                    </form>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>
                    <RadioGroup 
                        value={form.paymentMethod} 
                        onValueChange={(val: any) => setForm({...form, paymentMethod: val})}
                        className="space-y-4"
                    >
                        <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer" onClick={() => setForm({...form, paymentMethod: 'COD'})}>
                            <RadioGroupItem value="COD" id="cod" />
                            <Label htmlFor="cod" className="font-medium cursor-pointer flex-1">Thanh toán khi nhận hàng (COD)</Label>
                        </div>
                        <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer" onClick={() => setForm({...form, paymentMethod: 'BANK_TRANSFER'})}>
                            <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                            <Label htmlFor="bank" className="font-medium cursor-pointer flex-1">Chuyển khoản ngân hàng</Label>
                        </div>
                    </RadioGroup>

                    {form.paymentMethod === 'BANK_TRANSFER' && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                            <p><strong>Thông tin chuyển khoản:</strong></p>
                            <p>Ngân hàng: Vietcombank</p>
                            <p>Số tài khoản: 123456789</p>
                            <p>Chủ tài khoản: CÔNG TY TNHH GRIP</p>
                            <p>Nội dung: <em>Số điện thoại của bạn</em></p>
                            <p className="text-muted-foreground mt-2">Đơn hàng sẽ được xử lý sau khi chúng tôi nhận được thanh toán.</p>
                        </div>
                    )}
                </section>
            </div>

            <div className="lg:col-span-5">
                <div className="bg-muted/30 p-6 rounded-2xl sticky top-24 border">
                    <h3 className="text-xl font-bold mb-6">Đơn hàng của bạn</h3>
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border bg-background">
                                    <Image
                                        src={item.product.images?.[0] || "/placeholder.svg"}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium line-clamp-2 text-sm">{item.product.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">SL: {item.quantity}</div>
                                </div>
                                <div className="font-medium text-sm whitespace-nowrap">
                                    {(Number(item.product.price) * item.quantity).toLocaleString('vi-VN')} ₫
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t mt-6 pt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tạm tính</span>
                            <span className="font-medium">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phí vận chuyển</span>
                            <span className="font-medium text-primary">Miễn phí</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-4">
                            <span>Tổng cộng</span>
                            <span className="text-primary">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        form="checkout-form"
                        className="w-full mt-8 h-12 text-base font-bold" 
                        disabled={submitting}
                    >
                        {submitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
