import OrderPageClient from "./page-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderPageClient id={id} />;
}
