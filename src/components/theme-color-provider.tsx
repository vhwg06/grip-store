'use client'

import { useEffect } from 'react'

// OKLCH hue values for each theme color
const THEME_HUES: Record<string, number> = {
    purple: 270,  // Default
    indigo: 255,
    blue: 240,
    cyan: 200,
    teal: 170,
    green: 150,
    lime: 120,
    amber: 85,
    orange: 45,
    red: 25,
    rose: 345,
    pink: 330,
    black: 0,
}
const THEME_CHROMA: Record<string, number> = {
    black: 0,
}
const THEME_PRIMARY_L: Record<string, number> = {
    black: 0.2,
}
const THEME_PRIMARY_DARK_L: Record<string, number> = {
    black: 0.8,
}

interface ThemeColorProviderProps {
    color: string | null
    children: React.ReactNode
}

export function ThemeColorProvider({ color, children }: ThemeColorProviderProps) {
    useEffect(() => {
        // If color is not specified or set to the default 'purple', resolve it to the brand 'orange'
        const resolvedColor = (!color || color === 'purple') ? 'orange' : color
        const hue = THEME_HUES[resolvedColor] || 45
        const chroma = THEME_CHROMA[resolvedColor] ?? 1
        const primaryL = THEME_PRIMARY_L[resolvedColor] ?? 0.45
        const primaryDarkL = THEME_PRIMARY_DARK_L[resolvedColor] ?? 0.7
        const root = document.documentElement

        root.style.setProperty('--theme-hue', String(hue))
        root.style.setProperty('--theme-chroma', String(chroma))
        root.style.setProperty('--theme-primary-l', String(primaryL))
        root.style.setProperty('--theme-primary-dark-l', String(primaryDarkL))
    }, [color])

    return <>{children}</>
}
