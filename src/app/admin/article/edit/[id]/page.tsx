import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/articles?articleId=${encodeURIComponent(id)}`);
}
