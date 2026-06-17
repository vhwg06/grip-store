'use client'

import type { ReactNode } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Package, CreditCard, Megaphone, Star, Download, Tags, RotateCcw, Users, Settings, QrCode, Bell, Menu, MessageSquare, Images, Image as BannersIcon } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { getPendingRefundRequestCount } from "@/adapters/api/admin.api"
import { useAdminUserMessageUnreadCount } from "@/application/hooks/useNotifications"

interface NavLinkProps {
    href: string
    icon: ReactNode
    label: ReactNode
    badge?: ReactNode
    closeOnNavigate?: boolean
    testId?: string
}

function NavLink({ href, icon, label, badge, closeOnNavigate, testId }: NavLinkProps) {
    const content = (
        <span className="flex w-full items-center justify-between">
            <span className="flex items-center">
                {icon}
                {label}
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
        <Button variant="ghost" asChild className="justify-start">
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
    const { count: unreadMessages, refresh: refreshUnreadMessages } = useAdminUserMessageUnreadCount()

    useEffect(() => {
        let active = true
        const refresh = async () => {
            try {
                const res = await getPendingRefundRequestCount()
                if (active && res?.success) {
                    setPendingRefunds(res.count || 0)
                }
                void refreshUnreadMessages()
            } catch {
                // ignore
            }
        }
        refresh()
        return () => {
            active = false
        }
    }, [pathname, refreshUnreadMessages])

    useEffect(() => {
        const handler = () => {
            void (async () => {
                try {
                    const res = await getPendingRefundRequestCount()
                    if (res?.success) {
                        setPendingRefunds(res.count || 0)
                    }
                    void refreshUnreadMessages()
                } catch {
                    // ignore
                }
            })()
        }
        if (typeof window !== "undefined") {
            window.addEventListener("grip-store:refunds-updated", handler)
            window.addEventListener("grip-store:user-messages-updated", handler)
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("grip-store:refunds-updated", handler)
                window.removeEventListener("grip-store:user-messages-updated", handler)
            }
        }
    }, [refreshUnreadMessages])

    const refundBadge = pendingRefunds > 0 ? (
        <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {pendingRefunds > 99 ? "99+" : pendingRefunds}
        </span>
    ) : null

    const messageBadge = unreadMessages > 0 ? (
        <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadMessages > 99 ? "99+" : unreadMessages}
        </span>
    ) : null

    return (
        <>
            {showTitle && (
                <div className="flex items-center gap-2 font-bold text-xl px-2 mb-6">
                    <span>{t('common.adminTitle')}</span>
                </div>
            )}
            <nav data-testid={withTestIds ? "admin-nav" : undefined} className="flex flex-col gap-2">
                <NavLink href="/admin/settings" testId={withTestIds ? "admin-nav-settings" : undefined} icon={<Settings className="mr-2 h-4 w-4" />} label={t('common.storeSettings')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/products" testId={withTestIds ? "admin-nav-products" : undefined} icon={<Package className="mr-2 h-4 w-4" />} label={t('common.productManagement')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/banners" testId={withTestIds ? "admin-nav-banners" : undefined} icon={<BannersIcon className="mr-2 h-4 w-4" />} label={t('common.bannerManagement')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/media" testId={withTestIds ? "admin-nav-media" : undefined} icon={<Images className="mr-2 h-4 w-4" />} label="Media" closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/orders" testId={withTestIds ? "admin-nav-orders" : undefined} icon={<CreditCard className="mr-2 h-4 w-4" />} label={t('common.ordersRefunds')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/refunds" testId={withTestIds ? "admin-nav-refunds" : undefined} icon={<RotateCcw className="mr-2 h-4 w-4" />} label={t('common.refundRequests')} badge={refundBadge} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/messages" testId={withTestIds ? "admin-nav-messages" : undefined} icon={<MessageSquare className="mr-2 h-4 w-4" />} label={t('common.adminMessages')} badge={messageBadge} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/categories" testId={withTestIds ? "admin-nav-categories" : undefined} icon={<Tags className="mr-2 h-4 w-4" />} label={t('common.categoriesManage')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/users" testId={withTestIds ? "admin-nav-users" : undefined} icon={<Users className="mr-2 h-4 w-4" />} label={t('common.customers')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/reviews" testId={withTestIds ? "admin-nav-reviews" : undefined} icon={<Star className="mr-2 h-4 w-4" />} label={t('common.reviews')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/announcement" testId={withTestIds ? "admin-nav-announcement" : undefined} icon={<Megaphone className="mr-2 h-4 w-4" />} label={t('announcement.title')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/data" testId={withTestIds ? "admin-nav-data" : undefined} icon={<Download className="mr-2 h-4 w-4" />} label={t('common.dataExport')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/collect" testId={withTestIds ? "admin-nav-collect" : undefined} icon={<QrCode className="mr-2 h-4 w-4" />} label={t('payment.adminMenu')} closeOnNavigate={closeOnNavigate} />
                <NavLink href="/admin/notifications" testId={withTestIds ? "admin-nav-notifications" : undefined} icon={<Bell className="mr-2 h-4 w-4" />} label={t('admin.settings.notifications.title')} closeOnNavigate={closeOnNavigate} />
            </nav>
            {/* Removed footer logout block to avoid duplicate exit entry */}
        </>
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
                    <span className="font-bold">{t('common.adminTitle')}</span>
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
                    <Link data-testid={isMobileView ? "admin-nav-settings" : undefined} href="/admin/settings" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">{t('common.storeSettings')}</Link>
                    <Link data-testid={isMobileView ? "admin-nav-products" : undefined} href="/admin/products" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">{t('common.productManagement')}</Link>
                    <Link data-testid={isMobileView ? "admin-nav-banners" : undefined} href="/admin/banners" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">{t('common.bannerManagement')}</Link>
                    <Link data-testid={isMobileView ? "admin-nav-media" : undefined} href="/admin/media" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">Media</Link>
                    <Link data-testid={isMobileView ? "admin-nav-orders" : undefined} href="/admin/orders" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">{t('common.ordersRefunds')}</Link>
                    <Link data-testid={isMobileView ? "admin-nav-users" : undefined} href="/admin/users" className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap">{t('common.customers')}</Link>
                </nav>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-muted/40 border-r md:min-h-screen p-6 gap-4">
                <SidebarContent username={username} t={t} withTestIds={isMobileView !== true} />
            </aside>
        </>
    )
}
