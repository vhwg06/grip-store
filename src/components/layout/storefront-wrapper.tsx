"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { StickyBar } from "@/components/layout/sticky-bar";
import { MegaFooter } from "@/components/layout/mega-footer";
import { FloatingButtons } from "@/components/layout/floating-buttons";
import { MobileNavWrapper } from "@/components/mobile-nav-wrapper";

export function StorefrontWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="flex-1 flex flex-col min-h-screen">{children}</div>;
  }

  return (
    <>
      <StickyBar />
      <Navbar />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <MegaFooter />
      <FloatingButtons />
      <MobileNavWrapper />
    </>
  );
}
