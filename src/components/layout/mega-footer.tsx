"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteConfig } from "@/application/hooks/useSiteConfig";
import { useLeads } from "@/application/hooks/useLeads";
import { toast } from "sonner";
import { Phone, MessageSquare, Facebook, Mail, MapPin, Youtube, Instagram, Send } from "lucide-react";

export function MegaFooter() {
  const { config } = useSiteConfig();
  const { submit, isMutating } = useLeads();
  const [phone, setPhone] = useState("");

  const hotline = config?.contactHotline || "0985 694 444";
  const address = config?.contactAddress || "Hà Nội, Việt Nam";
  const email = config?.contactEmail || "contact@grip.vn";

  const handleSubscribeQuote = async () => {
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }

    const phoneRegex = /^[0-9+ ]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    try {
      await submit({
        name: "Khách hàng nhận báo giá",
        phone: phone.trim(),
        message: "Đăng ký nhận báo giá dự án và ưu đãi đại lý tốt nhất từ CTA Banner dưới chân trang.",
        source: "cta_banner",
      });
      toast.success("Đăng ký nhận báo giá thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
      setPhone("");
    } catch (err) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại sau!");
    }
  };

  return (
    <footer className="bg-[#2b1809] text-neutral-300 text-sm mt-auto w-full border-t border-[#9c702a]/20">
      {/* 1. CTA Banner Section (Figma: GRIP CTA - I8:619;138:5177) */}
      <div className="bg-[#c0a060] text-[#2b1809] py-10 border-b border-[#9c702a]">
        <div className="container mx-auto max-w-[1440px] px-4 md:px-[125px]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Text description */}
            <div className="text-center lg:text-left max-w-xl">
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider font-svn-gilroy mb-2 text-[#2b1809]">
                GRIP - TỔNG KHO TAY NẮM VIỆT NAM
              </h3>
              <p className="text-[14px] md:text-[15px] font-medium opacity-90 leading-relaxed font-svn-gilroy">
                Liên hệ ngay với chúng tôi để nhận báo giá dự án và ưu đãi đại lý tốt nhất.
              </p>
            </div>
            
            {/* Form and Direct contacts container */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center w-full sm:w-auto max-w-md gap-2">
                <input 
                  type="tel" 
                  placeholder="Nhập số điện thoại nhận báo giá..." 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isMutating}
                  className="flex-1 bg-white text-[#2b1809] placeholder-[#2b1809]/50 border border-[#2b1809]/20 px-5 py-3 rounded-full font-medium focus:outline-none focus:border-[#2b1809] text-sm min-w-[220px] sm:min-w-[260px] shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleSubscribeQuote}
                  disabled={isMutating}
                  className="bg-[#2b1809] hover:bg-black text-white hover:text-[#c0a060] px-6 py-3 rounded-full font-bold transition-all shadow-md text-sm uppercase tracking-wider font-svn-gilroy shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4 text-white" />
                  {isMutating ? "Đang gửi..." : "ĐĂNG KÝ"}
                </button>
              </div>

              {/* Direct channels links */}
              <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                <a 
                  href={`tel:${hotline}`} 
                  className="w-10 h-10 rounded-full bg-[#2b1809] hover:bg-black flex items-center justify-center text-white transition-all shadow-sm"
                  title={`Gọi Hotline: ${hotline}`}
                >
                  <Phone className="w-4 h-4 fill-white" />
                </a>
                
                {config?.socialLinks?.zalo && (
                  <a 
                    href={config.socialLinks.zalo} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-10 h-10 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-[#2b1809] transition-all shadow-sm border border-[#2b1809]/10"
                    title="Chat Zalo"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                
                {config?.socialLinks?.facebook && (
                  <a 
                    href={config.socialLinks.facebook} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-10 h-10 rounded-full bg-[#2b1809]/10 hover:bg-[#2b1809] flex items-center justify-center text-[#2b1809] hover:text-white transition-all border border-[#2b1809]/20"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer columns (Figma: Footer - I8:619;1:397) */}
      <div className="py-16">
        <div className="container mx-auto max-w-[1440px] px-4 md:px-[125px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Column 1: Company details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-[102px] h-[52px]">
                  <Image src="/logo.svg" alt="GRIP Logo" fill className="object-contain filter brightness-110 contrast-110" />
                </div>
              </div>
              <p className="text-[#c0a060] font-bold text-[15px] uppercase tracking-wider font-svn-gilroy mt-2">
                TỔNG KHO TAY NẮM VIỆT NAM
              </p>
              <p className="text-neutral-400 leading-relaxed max-w-sm">
                Chuyên cung cấp các loại tay nắm tủ, tay nắm cửa và phụ kiện kiến trúc cao cấp nhập khẩu chính hãng.
              </p>
              
              <div className="space-y-3 pt-2 text-neutral-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#c0a060] shrink-0 mt-0.5" />
                  <span className="text-neutral-300 leading-relaxed">{address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#c0a060] shrink-0" />
                  <span className="text-neutral-300">Hotline: {hotline}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#c0a060] shrink-0" />
                  <span className="text-neutral-300">Email: {email}</span>
                </div>
              </div>
            </div>

            {/* Dynamic and Fallback Columns */}
            {config?.footerColumns && config.footerColumns.length > 0 ? (
              config.footerColumns.map((col) => (
                <div key={col.id} className="space-y-4">
                  <h4 className="text-white font-bold text-[15px] uppercase tracking-wider font-svn-gilroy border-b border-[#9c702a]/30 pb-2">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link, idx) => (
                      <li key={idx}>
                        <Link 
                          href={link.url} 
                          className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <>
                {/* Fallback Column 2: Products */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-[15px] uppercase tracking-wider font-svn-gilroy border-b border-[#9c702a]/30 pb-2">
                    Sản Phẩm
                  </h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/products" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Tay nắm tủ cao cấp
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Tay nắm cửa sảnh
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Khóa cửa thông minh
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Phụ kiện mộc cao cấp
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Fallback Column 3: Policies */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-[15px] uppercase tracking-wider font-svn-gilroy border-b border-[#9c702a]/30 pb-2">
                    Chính Sách
                  </h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/terms" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Chính sách bảo hành
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Chính sách đổi trả 1-1
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Chính sách vận chuyển
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Chính sách bảo mật
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Fallback Column 4: Guide & Support */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-[15px] uppercase tracking-wider font-svn-gilroy border-b border-[#9c702a]/30 pb-2">
                    Hỗ Trợ & Kết Nối
                  </h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/contact" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Liên hệ tư vấn
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="text-neutral-400 hover:text-[#c0a060] transition-colors font-medium text-[14px]">
                        Câu hỏi thường gặp
                      </Link>
                    </li>
                    <li className="flex gap-4 pt-2">
                      {config?.socialLinks?.zalo && (
                        <a 
                          href={config.socialLinks.zalo} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#3a220e] flex items-center justify-center text-[#c0a060] hover:bg-[#c0a060] hover:text-[#2b1809] transition-all"
                          title="Zalo"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      {config?.socialLinks?.facebook && (
                        <a 
                          href={config.socialLinks.facebook} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#3a220e] flex items-center justify-center text-[#c0a060] hover:bg-[#c0a060] hover:text-[#2b1809] transition-all"
                          title="Facebook"
                        >
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {config?.socialLinks?.youtube && (
                        <a 
                          href={config.socialLinks.youtube} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#3a220e] flex items-center justify-center text-[#c0a060] hover:bg-[#c0a060] hover:text-[#2b1809] transition-all"
                          title="Youtube"
                        >
                          <Youtube className="w-4 h-4" />
                        </a>
                      )}
                      {config?.socialLinks?.instagram && (
                        <a 
                          href={config.socialLinks.instagram} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#3a220e] flex items-center justify-center text-[#c0a060] hover:bg-[#c0a060] hover:text-[#2b1809] transition-all"
                          title="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Copyright section */}
          <div className="border-t border-neutral-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
            <p>&copy; {new Date().getFullYear()} GRIP. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-neutral-400 transition-colors">Điều khoản sử dụng</Link>
              <Link href="/terms" className="hover:text-neutral-400 transition-colors">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
