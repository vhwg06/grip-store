import CardsPageClient from "./page-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function CardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CardsPageClient id={id} />;
}
