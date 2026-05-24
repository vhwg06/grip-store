"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";

export function Navbar() {
  return (
    <nav className="bg-[#2b1809] sticky top-0 z-40 w-full border-b border-[#9c702a]/10">
      <div className="container mx-auto h-[72px] flex items-center justify-between max-w-[1440px] px-4 md:px-[125px]">
        
        <div className="flex items-center h-[56px] w-full justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center w-[102px] h-[52px] relative">
            <Image src="/logo.svg" alt="BKT Logo" fill className="object-contain" />
          </Link>

          {/* Links */}
          <div className="hidden lg:flex items-center h-full ml-6">
            <Link href="/about" className="flex items-center justify-center w-[133px] h-full border border-white/0 hover:border-white bg-transparent hover:bg-white/20 transition-all text-white font-bold text-[16px] uppercase">
              GIỚI THIỆU
            </Link>
            <Link href="/products" className="flex items-center justify-center w-[133px] h-full border border-white/0 hover:border-white bg-transparent hover:bg-white/20 transition-all text-white font-bold text-[16px] uppercase">
              SẢN PHẨM
            </Link>
            <Link href="/articles" className="flex items-center justify-center w-[133px] h-full border border-white/0 hover:border-white bg-transparent hover:bg-white/20 transition-all text-white font-bold text-[16px] uppercase">
              TIN TỨC
            </Link>
            <Link href="/contact" className="flex items-center justify-center w-[133px] h-full border border-white/0 hover:border-white bg-transparent hover:bg-white/20 transition-all text-white font-bold text-[16px] uppercase">
              LIÊN HỆ
            </Link>
          </div>

          <div className="flex-1" />

          {/* Search, Heart, Cart */}
          <div className="flex items-center h-full">
            <div className="flex items-center p-2 gap-3 mr-2">
              <button className="w-[40px] h-[40px] flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
                <Search className="w-6 h-6" />
              </button>
              <button className="w-[40px] h-[40px] flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            <CartDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
}
