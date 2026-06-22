"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, User } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "@/components/signin-button";
import { SignOutButton } from "@/components/signout-button";
import { HeaderUserMenuItems, HeaderUnreadBadge } from "@/components/header-client-parts";
import { useAuth } from "@/application/hooks/useAuth";
import { usePublicSettings } from "@/application/hooks/useCatalog";

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const { settings } = usePublicSettings();
  const shopName = settings?.shopName?.trim() || "GRIP Store";
  const shopLogo = settings?.shopLogo?.trim() || null;

  return (
    <nav className="bg-[#2b1809] sticky top-0 z-40 w-full border-b border-[#9c702a]/10">
      <div className="container mx-auto h-[72px] flex items-center justify-between max-w-[1440px] px-4 md:px-[125px]">
        
        <div className="flex items-center h-[56px] w-full justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="relative h-[52px] w-[102px] shrink-0">
              {shopLogo ? (
                <img
                  src={shopLogo}
                  alt={`${shopName} logo`}
                  data-testid="site-header-logo-image"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image src="/logo.svg" alt="BKT Logo" fill className="object-contain" />
              )}
            </div>
            <span
              data-testid="site-header-logo-text"
              className="hidden max-w-[220px] truncate text-sm font-semibold tracking-tight text-white md:inline"
            >
              {shopName}
            </span>
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

          {/* Search, Heart, Cart, User Profile */}
          <div className="flex items-center h-full gap-3">
            <div className="flex items-center p-2 gap-3 mr-2">
              <button className="w-[40px] h-[40px] flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
                <Search className="w-6 h-6" />
              </button>
              <button className="w-[40px] h-[40px] flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            <CartDrawer />

            <div className="flex items-center ml-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 overflow-visible rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200">
                      <HeaderUnreadBadge className="absolute -top-1 -right-1 z-10 pointer-events-none shadow-sm" />
                      <Avatar className="relative z-0 h-10 w-10" data-testid="user-avatar">
                        <AvatarImage src={user.avatar_url || ''} alt={user.username || user.email || ''} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username || user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <HeaderUserMenuItems isAdmin={isAdmin} showNav={false} />
                    <DropdownMenuSeparator />
                    <SignOutButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
