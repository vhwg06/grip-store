"use client"

import { NotificationsContent } from "@/components/admin/notifications-content"
import { useAdminNotificationSettings } from "@/application/hooks/useAdmin"

export default function NotificationsPage() {
    const { data, isLoading } = useAdminNotificationSettings()

    if (isLoading || !data) {
        return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />
    }

    return <NotificationsContent settings={data.settings} />
}
