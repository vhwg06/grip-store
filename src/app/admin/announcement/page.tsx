"use client"

import useSWR from "swr"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { getAnnouncementConfig } from "@/adapters/api/admin.api"

export default function AnnouncementPage() {
    const { data, isLoading } = useSWR("admin-announcement", getAnnouncementConfig)

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-40 w-full rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-10 w-32 rounded-md bg-muted/40 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AnnouncementForm initialConfig={data ?? null} />
        </div>
    )
}
