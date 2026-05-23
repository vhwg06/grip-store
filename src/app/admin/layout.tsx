"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
    const { user, isAdmin, loading } = useAuth()
    const [registryEnabled, setRegistryEnabled] = useState(false)
    const [shouldPrompt, setShouldPrompt] = useState(false)

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace("/")
        }
    }, [isAdmin, loading, router])

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

    if (loading || !isAdmin) {
        return <AdminLayoutFallback />
    }

    return (
        <div className="flex min-h-screen flex-col">
            <UpdateNotification currentVersion={APP_VERSION} />
            <RegistryPrompt shouldPrompt={shouldPrompt} registryEnabled={registryEnabled} />
            <div className="flex flex-1 flex-col md:flex-row">
                <AdminSidebar username={user?.username || user?.email || "admin"} />
                <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
