import { MediaLibrary } from "@/components/admin/media-library";

export const metadata = {
  title: "Quản lý Media | Admin GRIP",
};

export default function AdminMediaPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Media</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tải lên, chọn lại, sao chép và xóa ảnh dùng cho banner, bài viết và sản phẩm.
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
