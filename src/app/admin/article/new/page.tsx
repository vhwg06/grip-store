import { redirect } from "next/navigation";

export const metadata = {
  title: "Thêm Bài viết | Admin GRIP",
};

export default function NewArticlePage() {
  redirect("/admin/articles?compose=new");
}
