import PaymentCallbackPageClient from "./page-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function PaymentCallbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentCallbackPageClient id={id} />;
}
