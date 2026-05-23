"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/application/hooks/useAuth"
import { useProfile } from "@/application/hooks/useProfile"
import { ProfileContent } from "@/components/profile-content"

export default function ProfilePage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const { profile, isLoading } = useProfile()

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login?callbackUrl=/profile')
        }
    }, [loading, router, user])

    if (loading || isLoading || !profile) {
        return (
            <div className="container py-8 max-w-2xl space-y-4">
                <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-32 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-40 rounded-xl bg-muted/40 animate-pulse" />
            </div>
        )
    }

    return <ProfileContent {...profile} />
}
