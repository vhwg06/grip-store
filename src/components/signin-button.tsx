"use client"

import { useAuth } from "@/application/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"

export function SignInButton() {
    const { t } = useI18n()
    const { user } = useAuth()
    const router = useRouter()

    if (user) {
        return null
    }

    return (
        <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
                const callbackUrl = typeof window === "undefined"
                    ? "/"
                    : `${window.location.pathname}${window.location.search}`
                router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
            }}
        >
            {t('common.login')}
        </Button>
    )
}
