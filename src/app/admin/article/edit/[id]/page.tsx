import EditArticlePageClient from "./page-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditArticlePageClient id={id} />;
}
