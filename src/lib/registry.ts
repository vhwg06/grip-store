export const REGISTRY_APP_ID = "ldc-shop"

const DEFAULT_REGISTRY_URL = "https://ldcnavi.chatgptuk.workers.dev"

export function getRegistryBaseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_REGISTRY_URL || DEFAULT_REGISTRY_URL
    return raw.replace(/\/+$/, "")
}

export function isRegistryEnabled(): boolean {
    return !!getRegistryBaseUrl()
}

export function normalizeOrigin(input: string): string {
    const url = new URL(input)
    if (url.protocol !== "https:") {
        throw new Error("Only https URLs are allowed")
    }
    return url.origin
}

export interface RegistryShop {
    name: string
    url: string
    logo?: string | null
    description?: string | null
    updated_at?: number
}

export async function fetchRegistryShops() {
    const baseUrl = getRegistryBaseUrl()
    if (!baseUrl) {
        return { items: [] as RegistryShop[], error: "registry_not_configured" }
    }

    const res = await fetch(`${baseUrl}/shops?limit=300`)

    if (!res.ok) {
        return { items: [] as RegistryShop[], error: `registry_error_${res.status}` }
    }

    const data = await res.json()
    return { items: (data?.items || []) as RegistryShop[], error: null }
}
