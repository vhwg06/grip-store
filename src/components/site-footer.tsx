"use client"

import { FooterContent } from "./footer-content"
import { APP_VERSION } from "@/lib/version"
import { usePublicSettings } from "@/application/hooks/useCatalog"

export function SiteFooter() {
    const { settings } = usePublicSettings()
    return <FooterContent customFooter={settings?.shopFooter ?? null} version={APP_VERSION} />
}
