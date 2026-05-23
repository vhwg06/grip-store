"use client"

import { useAuth } from "@/application/hooks/useAuth"
import { usePublicSettings } from "@/application/hooks/useCatalog"
import { MobileNav } from "./mobile-nav"

export function MobileNavWrapper() {
    const { user, isAdmin } = useAuth()
    const { settings } = usePublicSettings()
    const showNav = Boolean((settings as any)?.registryEnabled ? ((settings as any)?.registryOptIn || !(settings as any)?.registryHideNav) : true)

    return <MobileNav isLoggedIn={!!user} isAdmin={isAdmin} showNav={showNav} />
}
