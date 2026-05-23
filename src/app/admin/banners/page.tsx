import { AdminBannersContent } from "@/components/admin/banners-content";

export const metadata = {
  title: "Quản lý Banner | Admin GRIP",
};

export default function AdminBannersPage() {
  return (
    <div className="container mx-auto p-6">
      <AdminBannersContent />
    </div>
  );
}
