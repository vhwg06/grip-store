"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/application/hooks/useCart";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const { cart } = useCart();

  return (
    <nav className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto h-[72px] flex items-center justify-between max-w-[1190px] px-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-2xl tracking-tight text-primary">
          GRIP
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <Link href="/products" className="hover:text-primary transition-colors">Sản Phẩm</Link>
          <Link href="/articles" className="hover:text-primary transition-colors">Tin Tức</Link>
          <Link href="/about" className="hover:text-primary transition-colors">Về Chúng Tôi</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Liên Hệ</Link>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-64 pl-9 rounded-full bg-muted border-none h-9"
            />
          </div>
          
          <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cart.totalQuantity > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                {cart.totalQuantity}
              </span>
            )}
          </Link>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
