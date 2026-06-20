'use client'

import type { ReactNode } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { 
  Package, 
  CreditCard, 
  Star, 
  Tags, 
  Users, 
  Settings, 
  QrCode, 
  Bell, 
  Menu, 
  Images, 
  Image as BannersIcon,
  FileText,
  FolderTree,
  Info,
  User
} from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { getPendingRefundRequestCount } from "@/adapters/api/admin.api"

interface NavLinkProps {
  href: string
  icon: ReactNode
  label: ReactNode
  badge?: ReactNode
  closeOnNavigate?: boolean
  testId?: string
  isActive?: boolean
}

function NavLink({ href, icon, label, badge, closeOnNavigate, testId, isActive }: NavLinkProps) {
  const content = (
    <span className="flex w-full items-center justify-between relative pl-3.5">
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-[2px] bg-[#99782b]" />
      )}
      <span className="flex items-center">
        {icon}
        <span className={isActive ? "font-semibold text-[#2d2617]" : "font-medium text-[#50483d]"}>
          {label}
        </span>
      </span>
      {badge}
    </span>
  )
  const linkProps = testId ? { "data-testid": testId } : {};
  const link = closeOnNavigate ? (
    <SheetClose asChild>
      <Link {...linkProps} href={href} className="flex w-full items-center justify-between">{content}</Link>
    </SheetClose>
  ) : (
    <Link {...linkProps} href={href} className="flex w-full items-center justify-between">{content}</Link>
  )
  return (
    <Button 
      variant="ghost" 
      asChild 
      className={`justify-start w-full py-2 h-9 text-sm transition-colors ${
        isActive 
          ? "bg-[#e9dfc8] hover:bg-[#e9dfc8] text-[#2d2617]" 
          : "text-[#50483d] hover:bg-[#e9dfc8]/30 hover:text-[#2d2617]"
      }`}
    >
      {link}
    </Button>
  )
}

interface SidebarContentProps {
  closeOnNavigate?: boolean
  showTitle?: boolean
  username?: string
  t: (key: string) => string
  withTestIds?: boolean
}

function SidebarContent({ closeOnNavigate = false, showTitle = true, username, t, withTestIds = false }: SidebarContentProps) {
  const pathname = usePathname()
  const [pendingRefunds, setPendingRefunds] = useState(0)

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const res = await getPendingRefundRequestCount()
        if (active && res?.success) {
          setPendingRefunds(res.count || 0)
        }
      } catch {
        // ignore
      }
    }
    refresh()
    return () => {
      active = false
    }
  }, [pathname])

  useEffect(() => {
    const handler = () => {
      void (async () => {
        try {
          const res = await getPendingRefundRequestCount()
          if (res?.success) {
            setPendingRefunds(res.count || 0)
          }
        } catch {
          // ignore
        }
      })()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("grip-store:refunds-updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("grip-store:refunds-updated", handler)
      }
    }
  }, [])

  const refundBadge = pendingRefunds > 0 ? (
    <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
      {pendingRefunds > 99 ? "99+" : pendingRefunds}
    </span>
  ) : null

  const isSettingsActive = pathname === "/admin/settings" || pathname === "/admin"
  const isProductsActive = pathname === "/admin/products"
  
  return (
    <div className="flex flex-col h-full w-full">
      {showTitle && (
        <div className="flex flex-col gap-0.5 px-2 mb-6">
          <span data-testid="admin-sidebar-brand-title" className="font-bold text-[22px] text-[#25221b] tracking-tight leading-none mb-1">GRIP Admin</span>
          <span data-testid="admin-sidebar-brand-subtitle" className="text-xs text-[#786f61]">Admin operations</span>
        </div>
      )}
      <nav data-testid={withTestIds ? "admin-nav" : undefined} className="flex flex-col gap-1 w-full">
        {/* CMS Section */}
        <div data-testid="admin-sidebar-section-cms" className="text-[11px] font-semibold text-[#9a9184] uppercase tracking-wider px-2 py-1">
          CMS
        </div>
        <div className="flex flex-col gap-1 mb-[20px]">
          <NavLink href="/admin/settings" testId={withTestIds ? "admin-nav-settings" : undefined} icon={<Settings className="mr-2 h-4 w-4 shrink-0" />} label="Store Settings" closeOnNavigate={closeOnNavigate} isActive={isSettingsActive} />
          <NavLink href="/admin/banners" testId={withTestIds ? "admin-nav-banners" : undefined} icon={<BannersIcon className="mr-2 h-4 w-4 shrink-0" />} label="Banners" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/banners"} />
          <NavLink href="/admin/articles" testId={withTestIds ? "admin-nav-articles" : undefined} icon={<FileText className="mr-2 h-4 w-4 shrink-0" />} label="Articles" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/articles" || pathname.startsWith("/admin/article/")} />
          <NavLink href="/admin/product-content" testId={withTestIds ? "admin-nav-product-content" : undefined} icon={<FolderTree className="mr-2 h-4 w-4 shrink-0" />} label="Product Content" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/product-content"} />
          <NavLink href="/admin/about" testId={withTestIds ? "admin-nav-about" : undefined} icon={<Info className="mr-2 h-4 w-4 shrink-0" />} label="About-Us" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/about"} />
          <NavLink href="/admin/media" testId={withTestIds ? "admin-nav-media" : undefined} icon={<Images className="mr-2 h-4 w-4 shrink-0" />} label="Media Library" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/media"} />
        </div>

        {/* COMMERCE Section */}
        <div data-testid="admin-sidebar-section-commerce" className="text-[11px] font-semibold text-[#9a9184] uppercase tracking-wider px-2 py-1">
          COMMERCE
        </div>
        <div className="flex flex-col gap-1">
          <NavLink href="/admin/products" testId={withTestIds ? "admin-nav-products" : undefined} icon={<Package className="mr-2 h-4 w-4 shrink-0" />} label="Products" closeOnNavigate={closeOnNavigate} isActive={isProductsActive} />
          <NavLink href="/admin/orders" testId={withTestIds ? "admin-nav-orders" : undefined} icon={<CreditCard className="mr-2 h-4 w-4 shrink-0" />} label="Orders & Refunds" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/orders" || pathname.startsWith("/admin/orders/")} />
          <NavLink href="/admin/users" testId={withTestIds ? "admin-nav-users" : undefined} icon={<Users className="mr-2 h-4 w-4 shrink-0" />} label="Users" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/users"} />
          <NavLink href="/admin/reviews" testId={withTestIds ? "admin-nav-reviews" : undefined} icon={<Star className="mr-2 h-4 w-4 shrink-0" />} label="Reviews" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/reviews"} />
          <NavLink href="/admin/notifications" testId={withTestIds ? "admin-nav-notifications" : undefined} icon={<Bell className="mr-2 h-4 w-4 shrink-0" />} label="Notifications" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/notifications"} />
          <NavLink href="/admin/collect" testId={withTestIds ? "admin-nav-collect" : undefined} icon={<QrCode className="mr-2 h-4 w-4 shrink-0" />} label="Collect" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/collect"} />
          <NavLink href="/admin/categories" testId={withTestIds ? "admin-nav-categories" : undefined} icon={<Tags className="mr-2 h-4 w-4 shrink-0" />} label="Categories" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/categories"} />
          <NavLink href="/admin/profile" testId={withTestIds ? "admin-nav-profile" : undefined} icon={<User className="mr-2 h-4 w-4 shrink-0" />} label="Profile" closeOnNavigate={closeOnNavigate} isActive={pathname === "/admin/profile"} />
        </div>
      </nav>
    </div>
  )
}

export function AdminSidebar({ username }: { username: string }) {
  const { t } = useI18n()
  const [isMobileView, setIsMobileView] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(max-width: 767px)")
    const apply = () => setIsMobileView(mql.matches)
    apply()
    mql.addEventListener("change", apply)
    return () => mql.removeEventListener("change", apply)
  }, [])

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-bold">GRIP Admin</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                {t('common.menu')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-4/5 max-w-sm">
              <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-6">
                <SidebarContent closeOnNavigate showTitle={false} username={username} t={t} withTestIds={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <nav data-testid={isMobileView ? "admin-nav" : undefined} className="flex items-center gap-2 overflow-x-auto px-4 pb-3">
          <Link data-testid={isMobileView ? "admin-nav-settings" : undefined} href="/admin/settings" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Store Settings</Link>
          <Link data-testid={isMobileView ? "admin-nav-products" : undefined} href="/admin/products" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Products</Link>
          <Link data-testid={isMobileView ? "admin-nav-banners" : undefined} href="/admin/banners" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Banners</Link>
          <Link data-testid={isMobileView ? "admin-nav-media" : undefined} href="/admin/media" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Media Library</Link>
          <Link data-testid={isMobileView ? "admin-nav-orders" : undefined} href="/admin/orders" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Orders & Refunds</Link>
          <Link data-testid={isMobileView ? "admin-nav-users" : undefined} href="/admin/users" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Users</Link>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-[#f3f1ec] border-r border-[#e7e1d7] md:min-h-screen pt-[31px] px-6 pb-6 gap-4">
        <SidebarContent username={username} t={t} withTestIds={isMobileView !== true} />
      </aside>
    </>
  )
}
