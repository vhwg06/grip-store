"use client";

import { useState } from "react";
import { useLeads } from "@/application/hooks/useLeads";
import { toast } from "sonner";

export function ContactForm() {
  const { submit, isMutating } = useLeads();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10,11}$/.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await submit({
        ...formData,
        source: "Contact Page",
      });
      toast.success("Gửi yêu cầu thành công!", {
        description: "Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất."
      });
      setFormData({ name: "", phone: "", email: "", message: "" });
      setErrors({});
    } catch (error) {
      toast.error("Có lỗi xảy ra", {
        description: "Vui lòng thử lại sau."
      });
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200">
      <h3 className="text-xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className={`w-full px-4 py-2 rounded-md border ${errors.name ? 'border-red-500' : 'border-neutral-300'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
            placeholder="Nhập họ tên của bạn"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              className={`w-full px-4 py-2 rounded-md border ${errors.phone ? 'border-red-500' : 'border-neutral-300'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input 
              type="email" 
              className={`w-full px-4 py-2 rounded-md border ${errors.email ? 'border-red-500' : 'border-neutral-300'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Nội dung</label>
          <textarea 
            className="w-full px-4 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50 h-32 resize-none"
            placeholder="Bạn cần hỗ trợ gì?"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isMutating}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isMutating ? "Đang gửi..." : "GỬI TIN NHẮN"}
        </button>
      </form>
    </div>
  );
}
