"use client"

import { useAuth } from "@/application/hooks/useAuth"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"

export function SignOutButton() {
    const { t } = useI18n()
    const { logout } = useAuth()
    const router = useRouter()

    return (
        <DropdownMenuItem
            data-testid="logout-btn"
            onClick={async () => {
                await logout()
                router.push("/")
            }}
            className="cursor-pointer"
        >
            {t('common.logout')}
        </DropdownMenuItem>
    )
}
