import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StickyBar } from "@/components/layout/sticky-bar";
import { Navbar } from "@/components/layout/navbar";
import { MegaFooter } from "@/components/layout/mega-footer";
import { FloatingButtons } from "@/components/layout/floating-buttons";
import { MobileNavWrapper } from "@/components/mobile-nav-wrapper";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GRIP - Tổng Kho Tay Nắm Việt Nam",
  description: "Cung cấp tay nắm tủ, cửa và phụ kiện cao cấp",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GRIP",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `var __name = function(fn, name) { return Object.defineProperty(fn, "name", { value: name, configurable: true }); };`,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", inter.variable)}>
        <Providers themeColor={null} initialLocale="en">
          <StickyBar />
          <Navbar />
          <div className="flex-1 pb-16 md:pb-0">{children}</div>
          <MegaFooter />
          <FloatingButtons />
          <MobileNavWrapper />
        </Providers>
      </body>
    </html>
  );
}
