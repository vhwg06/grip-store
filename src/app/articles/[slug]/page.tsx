export function generateStaticParams() {
  return [{ slug: "placeholder" }]
}

import { ArticleDetailContent } from "@/components/article/article-detail-content";

export const metadata = {
  title: "Tin tức | GRIP",
  description: "Cập nhật các tin tức mới nhất về tay nắm cửa và phụ kiện nội thất từ GRIP.",
};

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <main className="bg-white min-h-screen">
      <ArticleDetailContent slug={slug} />
    </main>
  );
}
