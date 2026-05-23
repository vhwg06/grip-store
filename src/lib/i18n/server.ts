import { cookies, headers } from "next/headers"
import en from '@/locales/en.json'
import vi from '@/locales/vi.json'
import { detectLocaleFromAcceptLanguage, isLocale, type Locale } from "./shared"

type Translations = typeof en

const translations: Record<Locale, Translations> = { en, vi }

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  }, text)
}

export async function detectServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('ldc-locale')?.value
  if (isLocale(cookieLocale)) return cookieLocale

  const headerList = await headers()
  return detectLocaleFromAcceptLanguage(headerList.get('accept-language'))
}

export async function getServerI18n() {
  const locale = await detectServerLocale()
  const t = (key: string, params?: Record<string, string | number>): string => {
    const text = getNestedValue(translations[locale], key)
    return interpolate(text, params)
  }
  return { locale, t }
}
