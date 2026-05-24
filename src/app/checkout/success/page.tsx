import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
    return (
        <div data-testid="order-confirmation" className="container mx-auto px-4 md:px-6 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Đặt hàng thành công!</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                Cảm ơn bạn đã mua sắm tại GRIP. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/">Về trang chủ</Link>
                </Button>
                <Button asChild>
                    <Link href="/catalog">Tiếp tục mua sắm</Link>
                </Button>
            </div>
        </div>
    )
}
