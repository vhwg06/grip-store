import { ArticleForm } from "@/components/admin/article-form";

export const metadata = {
  title: "Thêm Bài viết | Admin GRIP",
};

export default function NewArticlePage() {
  return (
    <div className="container mx-auto p-6">
      <ArticleForm />
    </div>
  );
}
