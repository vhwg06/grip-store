"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, FileText, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Trang chủ", icon: Home, active: pathname === "/" },
    { href: "/products", label: "Sản phẩm", icon: Package, active: pathname.startsWith("/products") },
    { href: "/articles", label: "Tin tức", icon: FileText, active: pathname.startsWith("/articles") },
    { href: "/contact", label: "Liên hệ", icon: Phone, active: pathname === "/contact" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-neutral-200 safe-area-pb">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-colors",
              item.active ? "text-primary" : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
