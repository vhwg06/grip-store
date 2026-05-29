"use client";

import ProductForm from "@/components/admin/product-form";
import { RefreshOnMount } from "@/components/refresh-on-mount";
import { useAdminProductForm } from "@/application/hooks/useAdmin";

export default function EditProductPageClient({ id }: { id: string }) {
  const { data, isLoading } = useAdminProductForm(id);

  if (isLoading) {
    return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />;
  }

  if (!data?.product) {
    return <div className="text-sm text-muted-foreground">Product not found.</div>;
  }

  return (
    <>
      <RefreshOnMount />
      <ProductForm product={data.product} categories={data.categories ?? []} />
    </>
  );
}
