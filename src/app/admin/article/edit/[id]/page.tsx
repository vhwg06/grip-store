import { ArticleForm } from "@/components/admin/article-form";
import { getAdminArticle } from "@/adapters/api/admin.api";

export const metadata = {
  title: "Sửa Bài viết | Admin GRIP",
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getAdminArticle(id);

  return (
    <div className="container mx-auto p-6">
      <ArticleForm article={article} />
    </div>
  );
}
