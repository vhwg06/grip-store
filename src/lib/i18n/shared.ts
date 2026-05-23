export type Locale = "en" | "vi";

export function isLocale(value: unknown): value is Locale {
    return value === "en" || value === "vi";
}

export function detectLocaleFromAcceptLanguage(headerValue?: string | null): Locale {
    const normalized = (headerValue || "").toLowerCase();
    return normalized.includes("vi") ? "vi" : "en";
}
