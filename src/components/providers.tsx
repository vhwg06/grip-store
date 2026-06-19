'use client'

import { AuthProvider } from '@/application/context/AuthContext'
import { I18nProvider } from '@/lib/i18n/context'
import { Toaster } from 'sonner'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeColorProvider } from './theme-color-provider'
import { CartProvider } from '@/application/context/CartContext'
import type { Locale } from '@/lib/i18n/shared'

import { usePublicSettings } from '@/application/hooks/useCatalog'

interface ProvidersProps {
    children: React.ReactNode
    themeColor?: string | null
    initialLocale?: Locale
}

function RobotsMeta() {
    const { settings } = usePublicSettings()
    const noIndex = settings?.noindexEnabled || (settings as any)?.noindex_enabled === 'true' || (settings as any)?.noindex_enabled === true
    if (!noIndex) return null
    return <meta name="robots" content="noindex" />
}

export function Providers({ children, themeColor, initialLocale = 'en' }: ProvidersProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <ThemeColorProvider color={themeColor || null}>
                <I18nProvider initialLocale={initialLocale}>
                    <AuthProvider>
                        <CartProvider>
                            {children}
                            <Toaster position="top-center" richColors />
                            <RobotsMeta />
                        </CartProvider>
                    </AuthProvider>
                </I18nProvider>
            </ThemeColorProvider>
        </NextThemesProvider>
    )
}
