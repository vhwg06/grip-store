import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNavWrapper } from "@/components/mobile-nav-wrapper";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "LDC Virtual Goods Shop",
  description: "High-quality virtual goods, instant delivery",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LDC Virtual Goods Shop",
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
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <Providers themeColor={null} initialLocale="en">
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1 pb-16 md:pb-0">{children}</div>
            <SiteFooter />
            <MobileNavWrapper />
          </div>
        </Providers>
      </body>
    </html>
  );
}
