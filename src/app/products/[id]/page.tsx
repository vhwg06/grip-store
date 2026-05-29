import ProductDetailPageClient from "./page-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailPageClient id={id} />;
}
