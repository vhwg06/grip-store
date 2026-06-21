import AdminOrderDetailPageClient from "./page-client";

export function generateStaticParams() {
  return [
    { id: "placeholder" },
    { id: "test-order-0001" },
    { id: "test-order-0002" },
    { id: "nonexistent-order-12345xyz" }
  ];
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderDetailPageClient id={id} />;
}
