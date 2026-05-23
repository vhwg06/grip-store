"use client"

import { useAuth } from "@/application/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

export function SignInButton() {
    const { t } = useI18n()
    const { loginWithLinuxDO, user } = useAuth()

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
                loginWithLinuxDO(callbackUrl)
            }}
        >
            {t('common.login')}
        </Button>
    )
}
