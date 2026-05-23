"use client"

import { AdminSettingsContent } from "@/components/admin/settings-content"
import { useAdminDashboard } from "@/application/hooks/useAdmin"
import { APP_VERSION } from "@/lib/version"

export default function AdminSettingsPage() {
    const { data, isLoading } = useAdminDashboard()

    if (isLoading || !data) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-24 w-full rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-24 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    const settingsMap = data.settingsMap
    const shopName = settingsMap['shop_name'] || null
    const shopDescription = settingsMap['shop_description'] || null
    const shopLogo = settingsMap['shop_logo'] || null
    const shopFooter = settingsMap['shop_footer'] || null
    const themeColor = settingsMap['theme_color'] || null
    const lowStockThreshold = Number.parseInt(settingsMap['low_stock_threshold'] || '5', 10) || 5
    const checkinReward = Number.parseInt(settingsMap['checkin_reward'] || '10', 10) || 10

    return (
        <AdminSettingsContent
            stats={data.stats}
            shopName={shopName}
            shopDescription={shopDescription}
            shopLogo={shopLogo}
            shopFooter={shopFooter}
            themeColor={themeColor}
            visitorCount={data.visitorCount}
            lowStockThreshold={lowStockThreshold}
            checkinReward={checkinReward}
            checkinEnabled={settingsMap['checkin_enabled'] !== 'false'}
            wishlistEnabled={settingsMap['wishlist_enabled'] === 'true'}
            noIndexEnabled={settingsMap['noindex_enabled'] === 'true'}
            registryOptIn={settingsMap['registry_opt_in'] === 'true'}
            refundReclaimCards={settingsMap['refund_reclaim_cards'] !== 'false'}
            registryHideNav={settingsMap['registry_hide_nav'] === 'true'}
            registryEnabled={Boolean(data.registryEnabled)}
            currentVersion={APP_VERSION}
            floatingButtonEnabled={settingsMap['floating_button_enabled'] === 'true'}
            floatingButtonUrl={settingsMap['floating_button_url'] || ''}
            socialLinks={settingsMap['social_links'] || ''}
            homepageBlocks={settingsMap['homepage_blocks'] || ''}
        />
    )
}
