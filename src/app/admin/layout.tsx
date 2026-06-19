"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { UpdateNotification } from "@/components/admin/update-notification"
import { RegistryPrompt } from "@/components/admin/registry-prompt"
import { APP_VERSION } from "@/lib/version"
import { useAuth } from "@/application/hooks/useAuth"
import { getRegistryStatus } from "@/adapters/api/admin.api"

function AdminLayoutFallback() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="h-16 border-b border-border/40 bg-background/70" />
            <div className="flex flex-1 flex-col md:flex-row">
                <div className="hidden md:block w-64 border-r border-border/40 bg-muted/10" />
                <main className="flex-1 p-6 md:p-12">
                    <div className="space-y-4">
                        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                        <div className="h-24 w-full rounded-xl bg-muted/40 animate-pulse" />
                        <div className="h-24 w-full rounded-xl bg-muted/40 animate-pulse" />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAdmin, loading } = useAuth()
    const [registryEnabled, setRegistryEnabled] = useState(false)
    const [shouldPrompt, setShouldPrompt] = useState(false)
    const [isE2E, setIsE2E] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && window.navigator.webdriver) {
            setIsE2E(true)
        }
    }, [])

    const isNonAdminAllowedRoute = pathname === "/admin/profile" || pathname === "/admin/orders"

    useEffect(() => {
        if (!loading && !isAdmin && !isNonAdminAllowedRoute) {
            router.replace("/")
        }
    }, [isAdmin, isNonAdminAllowedRoute, loading, router])

    useEffect(() => {
        if (!isAdmin) return
        let active = true
        void getRegistryStatus()
            .then((result) => {
                if (!active) return
                setRegistryEnabled(Boolean(result.registryEnabled))
                setShouldPrompt(Boolean(result.shouldPrompt))
            })
            .catch(() => {
                if (!active) return
                setRegistryEnabled(false)
                setShouldPrompt(false)
            })
        return () => {
            active = false
        }
    }, [isAdmin])

    if (loading) {
        return <AdminLayoutFallback />
    }

    if (!isAdmin && isNonAdminAllowedRoute) {
        return <div className="min-h-screen">{children}</div>
    }

    if (!isAdmin) return <AdminLayoutFallback />

    return (
        <div className="flex min-h-screen flex-col bg-[#fafaf8]">
            <UpdateNotification currentVersion={APP_VERSION} />
            <RegistryPrompt shouldPrompt={shouldPrompt} registryEnabled={registryEnabled} />
            <div className="flex flex-1 flex-col md:flex-row">
                <AdminSidebar username={user?.username || user?.email || "admin"} />
                <main className={`flex-1 pt-0 pb-12 pl-[49px] pr-[79px] overflow-y-auto bg-[#fafaf8] ${isE2E ? "scrollbar-none" : ""}`}>
                    {children}
                </main>
            </div>
        </div>
    )
}
