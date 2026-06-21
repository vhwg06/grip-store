import EditProductPageClient from "./page-client";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductPageClient id={id} />;
}
