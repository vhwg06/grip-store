"use client"

import { NotificationsContent } from "@/components/admin/notifications-content"
import { useAdminNotificationSettings } from "@/application/hooks/useAdmin"

export default function NotificationsPage() {
    const { data, error, isLoading } = useAdminNotificationSettings()

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-red-50/20 border border-red-200 rounded-xl p-6" data-testid="error-boundary">
                <p className="text-red-600 font-semibold">Failed to load notification settings</p>
                <p className="text-sm text-red-500 mt-1">Please try again later or check your backend connection.</p>
            </div>
        )
    }

    if (isLoading || !data) {
        return <div className="h-96 w-full rounded-xl bg-muted/40 animate-pulse" />
    }

    return <NotificationsContent settings={data.settings} />
}

