"use client";

import Link from "next/link";
import { useSiteConfig } from "@/application/hooks/useSiteConfig";

export function MegaFooter() {
  const { config } = useSiteConfig();

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8 text-sm mt-auto">
      <div className="container mx-auto max-w-[1190px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">GRIP</h3>
            <p className="mb-4 text-neutral-400 font-semibold">TỔNG KHO TAY NẮM VIỆT NAM</p>
            <p className="mb-2">{config?.contactAddress || "Hà Nội, Việt Nam"}</p>
            <p className="mb-2">Hotline: {config?.contactHotline || "1900 xxxx"}</p>
            <p>Email: {config?.contactEmail || "contact@grip.vn"}</p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Sản Phẩm</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-white transition-colors">Tay nắm tủ</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Tay nắm cửa</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Phụ kiện mộc</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Chính sách</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kết Nối</h4>
            <div className="flex gap-4">
              {config?.socialLinks?.facebook && (
                <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a>
              )}
              {config?.socialLinks?.zalo && (
                <a href={config.socialLinks.zalo} target="_blank" rel="noreferrer" className="hover:text-white">Zalo</a>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} GRIP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
