"use client"

import { AdminSettingsContent } from "@/components/admin/settings-content"
import { useAdminDashboard } from "@/application/hooks/useAdmin"

export default function AdminSettingsPage() {
    const { data, isLoading } = useAdminDashboard()

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-24 w-full rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-24 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    const settingsMap = data?.settingsMap ?? {}
    const shopName = settingsMap['shop_name'] || null
    const shopDescription = settingsMap['shop_description'] || null
    const shopLogo = settingsMap['shop_logo'] || null
    const shopFooter = settingsMap['shop_footer'] || null
    const themeColor = settingsMap['theme_color'] || null

    const contactAddress = settingsMap['contact_address'] || null
    const contactHotline = settingsMap['contact_hotline'] || null
    const contactEmail = settingsMap['contact_email'] || null
    const contactMapsUrl = settingsMap['contact_maps_url'] || null

    return (
        <AdminSettingsContent
            shopName={shopName}
            shopDescription={shopDescription}
            shopLogo={shopLogo}
            shopFooter={shopFooter}
            themeColor={themeColor}
            socialLinks={settingsMap['social_links'] || ''}
            homepageBlocks={settingsMap['homepage_blocks'] || ''}
            contactAddress={contactAddress}
            contactHotline={contactHotline}
            contactEmail={contactEmail}
            contactMapsUrl={contactMapsUrl}
        />
    )
}
