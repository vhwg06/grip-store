"use client"

import Link from "next/link"
import { useAuth } from "@/application/hooks/useAuth"
import { useWishlist } from "@/application/hooks/useWishlist"
import { useI18n } from "@/lib/i18n/context"
import { WishlistSection } from "@/components/wishlist-section"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
    const { t } = useI18n()
    const { user, isAdmin } = useAuth()
    const { items, enabled, isLoading } = useWishlist(30)

    return (
        <main className="container py-8 md:py-12 space-y-6">
            <div className="flex items-center justify-end">
                <Link href="/">
                    <Button variant="outline" size="sm">{t('common.back')}</Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t('common.loading')}
                </div>
            ) : enabled ? (
                <WishlistSection
                    initialItems={items}
                    isLoggedIn={!!user?.id}
                    isAdmin={isAdmin}
                />
            ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t('wishlist.disabled')}
                </div>
            )}
        </main>
    )
}
