import { CheckoutContent } from "@/components/checkout-content"

export const metadata = {
  title: "Thanh toán | GRIP",
}

export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 md:px-6">
      <CheckoutContent />
    </main>
  )
}
