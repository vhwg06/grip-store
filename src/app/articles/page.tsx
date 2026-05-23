import { ArticlesListContent } from "@/components/article/articles-list-content";

export const metadata = {
  title: "Tin tức | GRIP",
  description: "Cập nhật các tin tức mới nhất về tay nắm cửa và phụ kiện nội thất từ GRIP.",
};

export default function ArticlesPage() {
  return (
    <main className="py-8 bg-neutral-50 min-h-screen">
      <ArticlesListContent />
    </main>
  );
}
