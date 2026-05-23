import { AdminFAQsContent } from "@/components/admin/faqs-content";

export const metadata = {
  title: "Quản lý FAQ | Admin GRIP",
};

export default function AdminFAQsPage() {
  return (
    <div className="container mx-auto p-6">
      <AdminFAQsContent />
    </div>
  );
}
