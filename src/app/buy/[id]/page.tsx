import BuyPageClient from "./page-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function BuyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuyPageClient id={id} />;
}
