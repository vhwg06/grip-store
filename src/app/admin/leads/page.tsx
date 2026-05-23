import { AdminLeadsContent } from "@/components/admin/leads-content";

export const metadata = {
  title: "Quản lý Leads | Admin GRIP",
};

export default function AdminLeadsPage() {
  return (
    <div className="container mx-auto p-6">
      <AdminLeadsContent />
    </div>
  );
}
