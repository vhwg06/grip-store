import { AdminArticlesContent } from "@/components/admin/articles-content";

export const metadata = {
  title: "Quản lý Bài viết | Admin GRIP",
};

export default function AdminArticlesPage() {
  return (
    <div className="container mx-auto p-6">
      <AdminArticlesContent />
    </div>
  );
}
