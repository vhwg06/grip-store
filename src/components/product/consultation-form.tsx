"use client";
import { useState } from "react";
import { useLeads } from "@/application/hooks/useLeads";

export function ConsultationForm({ productTitle }: { productTitle?: string }) {
  const { submit, isMutating } = useLeads();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const response = await submit({
        name: fd.get("name") as string,
        phone: fd.get("phone") as string,
        email: (fd.get("email") as string) || undefined,
        message: `Tư vấn sản phẩm: ${productTitle || "Chung"}\n${fd.get("message") as string}`,
        source: "product_detail"
      });
      if (response.id) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      // Ignore error, handle globally if needed
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
        <h4 className="font-bold text-lg mb-2">Đăng ký thành công!</h4>
        <p>Cảm ơn bạn. Chuyên viên của GRIP sẽ liên hệ sớm nhất.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm font-medium underline">Gửi yêu cầu khác</button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
      <h3 className="font-bold text-lg mb-4">Nhận tư vấn ngay</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" required placeholder="Họ và tên *" className="w-full border rounded-md px-4 py-2.5 outline-none focus:border-primary" />
        <input name="phone" required placeholder="Số điện thoại *" className="w-full border rounded-md px-4 py-2.5 outline-none focus:border-primary" />
        <input name="email" type="email" placeholder="Email (Tùy chọn)" className="w-full border rounded-md px-4 py-2.5 outline-none focus:border-primary" />
        <textarea name="message" placeholder="Ghi chú thêm..." className="w-full border rounded-md px-4 py-2.5 outline-none focus:border-primary min-h-[80px]" />
        <button disabled={isMutating} type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {isMutating ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </form>
    </div>
  );
}
