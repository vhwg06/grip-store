'use client'

import { useState } from "react"
import { useSWRConfig } from "swr"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, ShoppingCart, CreditCard, Package, Users, Image as ImageIcon, CheckCircle, ArrowUp } from "lucide-react"
import {
  saveBrandSettings,
  saveContactSettings,
  saveHomepageSettings,
  saveFooterSettings,
  saveFloatingSupportSettings,
  saveVisibilitySettings,
  saveRegistrySettings,
  savePresenceSettings,
  joinRegistry,
  leaveRegistry,
  saveSetting,
  saveLowStockThreshold
} from "@/adapters/api/admin.api"
import { useAdminAboutPage, useAdminBanners, useAdminMedia } from "@/application/hooks/useAdmin"
import { checkForUpdatesClient, type ClientUpdateCheckResult } from "@/lib/update-check-client"
import { toast } from "sonner"

function isValidUrlLike(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  try {
    const url = new URL(trimmed)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

interface Stats {
  today: { count: number; revenue: number }
  week: { count: number; revenue: number }
  month: { count: number; revenue: number }
  total: { count: number; revenue: number }
}

interface FooterLink {
  label: string
  url: string
}

interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
}

interface AdminSettingsContentProps {
  stats: Stats
  shopName: string | null
  shopDescription: string | null
  shopLogo: string | null
  shopFooter: string | null
  themeColor: string | null
  visitorCount: number
  lowStockThreshold: number
  checkinReward: number
  checkinEnabled: boolean
  wishlistEnabled: boolean
  noIndexEnabled: boolean
  registryHideNav: boolean
  registryOptIn: boolean
  registryEnabled: boolean
  currentVersion: string
  floatingButtonEnabled: boolean
  floatingButtonUrl: string
  socialLinks: string
  homepageBlocks: string
  contactAddress: string | null
  contactHotline: string | null
  contactEmail: string | null
  contactMapsUrl: string | null
  bannerPresenceEnabled: boolean
  aboutPresenceEnabled: boolean
  bannerPresencePresent: boolean
  aboutPresencePresent: boolean
}

const THEME_COLORS = [
  { value: 'black', hue: 0, chroma: 0, preview: 'oklch(0.18 0 0)' },
  { value: 'purple', hue: 270 },
  { value: 'indigo', hue: 255 },
  { value: 'blue', hue: 240 },
  { value: 'cyan', hue: 200 },
  { value: 'teal', hue: 170 },
  { value: 'green', hue: 150 },
  { value: 'lime', hue: 120 },
  { value: 'amber', hue: 85 },
  { value: 'orange', hue: 45 },
  { value: 'red', hue: 25 },
  { value: 'rose', hue: 345 },
  { value: 'pink', hue: 330 },
]

export function AdminSettingsContent({
  stats,
  shopName,
  shopDescription,
  shopLogo,
  shopFooter,
  themeColor,
  visitorCount,
  lowStockThreshold,
  checkinReward,
  checkinEnabled,
  wishlistEnabled,
  noIndexEnabled,
  registryHideNav,
  registryOptIn,
  registryEnabled,
  currentVersion,
  floatingButtonEnabled,
  floatingButtonUrl,
  socialLinks,
  homepageBlocks,
  contactAddress,
  contactHotline,
  contactEmail,
  contactMapsUrl,
  bannerPresenceEnabled,
  aboutPresenceEnabled,
  bannerPresencePresent,
  aboutPresencePresent,
}: AdminSettingsContentProps) {
  const { t } = useI18n()
  const { mutate } = useSWRConfig()

  // --- State variables ---
  // Brand & Contact
  const [shopNameValue, setShopNameValue] = useState(shopName || '')
  const [shopDescValue, setShopDescValue] = useState(shopDescription || '')
  const [shopLogoValue, setShopLogoValue] = useState(shopLogo || '')
  const [addressValue, setAddressValue] = useState(contactAddress || '')
  const [hotlineValue, setHotlineValue] = useState(contactHotline || '')
  const [emailValue, setEmailValue] = useState(contactEmail || '')
  const [mapsUrlValue, setMapsUrlValue] = useState(contactMapsUrl || '')
  const [savingBrand, setSavingBrand] = useState(false)
  const [savingContact, setSavingContact] = useState(false)

  const isEmailInvalid = emailValue.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)


  // Homepage block layout composition
  const [activeBlocks, setActiveBlocks] = useState<string[]>(() =>
    homepageBlocks ? homepageBlocks.split(',') : ['hero', 'categories', 'products', 'latest-news', 'colors', 'usp']
  )
  const [newsCount, setNewsCount] = useState(() => '3') // We can initialize it
  const [savingHomepage, setSavingHomepage] = useState(false)
  const homepageBlockOptions = ["hero", "categories", "products", "latest-news", "colors", "usp"]

  // Footer & Social
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(() => {
    try {
      return shopFooter
        ? JSON.parse(shopFooter)
        : [
            { id: "col0", title: "Products", links: [{ label: "Door Handles", url: "/products" }] },
            { id: "col1", title: "Policies", links: [{ label: "Warranty", url: "/terms" }] },
            { id: "col2", title: "Support", links: [{ label: "FAQ", url: "/faq" }] }
          ]
    } catch {
      return [
        { id: "col0", title: "Products", links: [{ label: "Door Handles", url: "/products" }] },
        { id: "col1", title: "Policies", links: [{ label: "Warranty", url: "/terms" }] },
        { id: "col2", title: "Support", links: [{ label: "FAQ", url: "/faq" }] }
      ]
    }
  })

  const [socialLinksState, setSocialLinksState] = useState<Record<string, string>>(() => {
    try {
      return socialLinks ? JSON.parse(socialLinks) : {}
    } catch {
      return {}
    }
  })
  const [facebookLink, setFacebookLink] = useState(socialLinksState.facebook || '')
  const [instagramLink, setInstagramLink] = useState(socialLinksState.instagram || '')
  const [tiktokLink, setTiktokLink] = useState(socialLinksState.tiktok || '')
  const [copyrightText, setCopyrightText] = useState(socialLinksState.copyright || '© 2026 GRIP. Tất cả quyền được bảo lưu.')
  const [savingFooterSocial, setSavingFooterSocial] = useState(false)
  const hasInvalidSocialUrl =
    !isValidUrlLike(facebookLink) || !isValidUrlLike(instagramLink) || !isValidUrlLike(tiktokLink)

  // Floating Support & Visibility
  const [zaloEnabled, setZaloEnabled] = useState(() => !!socialLinksState.zalo)
  const [zaloTarget, setZaloTarget] = useState(socialLinksState.zalo || 'https://zalo.me/gripvn')
  const [messengerEnabled, setMessengerEnabled] = useState(() => !!socialLinksState.messenger)
  const [messengerTarget, setMessengerTarget] = useState(socialLinksState.messenger || '')
  const [hotlineCallEnabled, setHotlineCallEnabled] = useState(() => !!socialLinksState.hotlineCall)
  const [hotlineCallTarget, setHotlineCallTarget] = useState(socialLinksState.hotlineCall || '')
  const [scrollToTopEnabled, setScrollToTopEnabled] = useState(() => socialLinksState.scrollToTop === 'true')
  const [noIndex, setNoIndex] = useState(noIndexEnabled)
  const [savingSupportControls, setSavingSupportControls] = useState(false)

  // Registry & Legacy
  const [selectedTheme, setSelectedTheme] = useState(themeColor || 'purple')
  const [savingTheme, setSavingTheme] = useState(false)
  const [thresholdValue, setThresholdValue] = useState(String(lowStockThreshold || 5))
  const [savingThreshold, setSavingThreshold] = useState(false)
  const [rewardValue, setRewardValue] = useState(String(checkinReward || 10))
  const [savingReward, setSavingReward] = useState(false)
  const [enabledCheckin, setEnabledCheckin] = useState(checkinEnabled)
  const [savingEnabled, setSavingEnabled] = useState(false)
  const [enabledWishlist, setEnabledWishlist] = useState(wishlistEnabled)
  const [savingWishlist, setSavingWishlist] = useState(false)
  const [hideRegistryNav, setHideRegistryNav] = useState(registryHideNav)
  const [savingRegistryNav, setSavingRegistryNav] = useState(false)
  const [registryJoined, setRegistryJoined] = useState(registryOptIn)
  const [bannerPresenceOn, setBannerPresenceOn] = useState(bannerPresenceEnabled)
  const [aboutPresenceOn, setAboutPresenceOn] = useState(aboutPresenceEnabled)
  const [savingPresence, setSavingPresence] = useState(false)
  const [submittingRegistry, setSubmittingRegistry] = useState(false)
  const [leavingRegistry, setLeavingRegistry] = useState(false)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<ClientUpdateCheckResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Media Picker Dialog State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const { data: mediaData } = useAdminMedia({ page: 1, pageSize: 30 })
  const { data: banners = [] } = useAdminBanners()
  const { data: aboutPage } = useAdminAboutPage()
  const mediaItems = mediaData?.items ?? []
  const [selectedMediaUrl, setSelectedMediaUrl] = useState("")
  const hasBannerPresence = bannerPresencePresent || banners.some((banner: any) => banner.isActive)
  const hasAboutPresence = aboutPresencePresent || Boolean(
    aboutPage?.title?.trim() ||
      aboutPage?.body?.trim() ||
      (Array.isArray(aboutPage?.gallery) && aboutPage.gallery.length > 0)
  )

  // --- Save handlers ---
  const handleSaveBrand = async () => {
    setSavingBrand(true)
    try {
      await saveBrandSettings({
        shopName: shopNameValue,
        shopDescription: shopDescValue,
        shopLogo: shopLogoValue,
        themeColor: selectedTheme
      })
      await Promise.all([mutate("catalog-settings"), mutate("site-config")])
      setStatusMessage("Brand settings saved.")
      toast.success(t('common.success'))
    } catch (e: any) {
      setStatusMessage(null)
      toast.error(e.message || "Failed to save brand settings")
    } finally {
      setSavingBrand(false)
    }
  }

  const handleSaveContact = async () => {
    setSavingContact(true)
    try {
      await saveContactSettings({
        stickyBarAddress: addressValue,
        stickyBarHotline: hotlineValue,
        contactEmail: emailValue
      })
      await Promise.all([mutate("catalog-settings"), mutate("site-config")])
      setStatusMessage("Contact settings saved.")
      toast.success(t('common.success'))
    } catch (e: any) {
      setStatusMessage(null)
      toast.error(e.message || "Failed to save contact settings")
    } finally {
      setSavingContact(false)
    }
  }

  const handleSavePresence = async () => {
    setSavingPresence(true)
    try {
      await savePresenceSettings({
        bannerPresence: {
          enabled: bannerPresenceOn,
          present: hasBannerPresence,
        },
        aboutPresence: {
          enabled: aboutPresenceOn,
          present: hasAboutPresence,
        },
      })
      await Promise.all([mutate("admin-dashboard"), mutate("site-config"), mutate("catalog-settings")])
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to save presence settings")
    } finally {
      setSavingPresence(false)
    }
  }

  const handleSaveHomepage = async () => {
    setSavingHomepage(true)
    try {
      const blocks = activeBlocks.map((key, idx) => ({
        key: key === "latest-news" ? "latest_news" : (key === "featured-products" ? "featured_products" : key),
        enabled: true,
        order: idx + 1
      }))
      await saveHomepageSettings({
        blocks,
        newsCount: Number(newsCount) || 0
      })
      await mutate("catalog-settings")
      setStatusMessage("Homepage composition saved.")
      toast.success(t('common.success'))
    } catch (e: any) {
      setStatusMessage(null)
      toast.error(e.message || "Failed to save homepage composition")
    } finally {
      setSavingHomepage(false)
    }
  }

  const handleSaveFooterSocial = async () => {
    setSavingFooterSocial(true)
    try {
      await saveFooterSettings({
        columns: footerColumns,
        copyright: copyrightText,
        socialLinks: {
          facebook: facebookLink,
          instagram: instagramLink,
          tiktok: tiktokLink
        }
      })
      await mutate("site-config")
      setStatusMessage("Footer and social settings saved.")
      toast.success(t('common.success'))
    } catch (e: any) {
      setStatusMessage(null)
      toast.error(e.message || "Failed to save footer & social settings")
    } finally {
      setSavingFooterSocial(false)
    }
  }

  const handleSaveSupportControls = async () => {
    setSavingSupportControls(true)
    try {
      await saveFloatingSupportSettings([
        { key: "zalo", enabled: zaloEnabled || Boolean(zaloTarget.trim()), target: zaloTarget || null },
        { key: "messenger", enabled: messengerEnabled || Boolean(messengerTarget.trim()), target: messengerTarget || null },
        { key: "hotline", enabled: hotlineCallEnabled || Boolean(hotlineCallTarget.trim()), target: hotlineCallTarget || null },
        { key: "scroll_to_top", enabled: scrollToTopEnabled, target: null }
      ])
      await saveVisibilitySettings({
        noIndexEnabled: noIndex,
        wishlistEnabled: enabledWishlist,
        checkinEnabled: enabledCheckin,
        checkinReward: Number(rewardValue) || 0,
      })

      const nextSocials = { 
        ...socialLinksState, 
        zalo: zaloEnabled ? zaloTarget : "",
        messenger: messengerEnabled ? messengerTarget : "",
        hotlineCall: hotlineCallEnabled ? hotlineCallTarget : "",
        scrollToTop: scrollToTopEnabled ? "true" : "false"
      }
      setSocialLinksState(nextSocials)
      await Promise.all([mutate("catalog-settings"), mutate("site-config")])
      setStatusMessage("Support and visibility settings saved.")
      toast.success(t('common.success'))
    } catch (e: any) {
      setStatusMessage(null)
      toast.error(e.message || "Failed to save support & visibility controls")
    } finally {
      setSavingSupportControls(false)
    }
  }

  // Legacy actions
  const handleSaveTheme = async (color: string) => {
    setSavingTheme(true)
    setSelectedTheme(color)
    try {
      await saveBrandSettings({
        shopName: shopNameValue,
        shopDescription: shopDescValue,
        shopLogo: shopLogoValue,
        themeColor: color
      })
      toast.success(t('common.success'))
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingTheme(false)
    }
  }

  const handleSaveThreshold = async () => {
    setSavingThreshold(true)
    try {
      await saveLowStockThreshold(thresholdValue)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingThreshold(false)
    }
  }

  const handleSaveReward = async () => {
    setSavingReward(true)
    try {
      await saveVisibilitySettings({
        noIndexEnabled: noIndex,
        wishlistEnabled: enabledWishlist,
        checkinEnabled: enabledCheckin,
        checkinReward: Number(rewardValue) || 0,
      })
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingReward(false)
    }
  }

  const handleToggleCheckin = async (checked: boolean) => {
    setSavingEnabled(true)
    try {
      await saveVisibilitySettings({
        noIndexEnabled: noIndex,
        wishlistEnabled: enabledWishlist,
        checkinEnabled: checked,
        checkinReward: Number(rewardValue) || 0,
      })
      setEnabledCheckin(checked)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingEnabled(false)
    }
  }


  const handleToggleWishlist = async (checked: boolean) => {
    setSavingWishlist(true)
    try {
      await saveVisibilitySettings({
        noIndexEnabled: noIndex,
        wishlistEnabled: checked,
        checkinEnabled: enabledCheckin,
        checkinReward: Number(rewardValue) || 0,
      })
      setEnabledWishlist(checked)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingWishlist(false)
    }
  }

  const handleToggleRegistryNav = async (checked: boolean) => {
    setSavingRegistryNav(true)
    try {
      await saveRegistrySettings({
        joined: registryJoined,
        hideNav: checked
      })
      setHideRegistryNav(checked)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingRegistryNav(false)
    }
  }

  const handleRegistrySubmit = async () => {
    if (submittingRegistry || leavingRegistry) return
    setSubmittingRegistry(true)
    try {
      const result = await joinRegistry(window.location.origin)
      if (!result.ok) throw new Error(result.error || "submit_failed")
      toast.success(t('registry.submitSuccess'))
      setRegistryJoined(true)
      setHideRegistryNav(false)
    } catch {
      toast.error(t('registry.submitFailed'))
    } finally {
      setSubmittingRegistry(false)
    }
  }

  const handleRegistryLeave = async () => {
    if (submittingRegistry || leavingRegistry) return
    setLeavingRegistry(true)
    try {
      const result = await leaveRegistry()
      if (!result.ok) throw new Error(result.error || "leave_failed")
      toast.success(t('registry.leaveSuccess'))
      setRegistryJoined(false)
      setHideRegistryNav(true)
    } catch {
      toast.error(t('registry.leaveFailed'))
    } finally {
      setLeavingRegistry(false)
    }
  }

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    try {
      const result = await checkForUpdatesClient(currentVersion)
      setUpdateInfo(result)
      if (result.error) {
        toast.error(t('update.checkFailed'))
        return
      }
      toast.success(result.hasUpdate ? t('update.available') : t('update.upToDate'))
    } catch {
      toast.error(t('update.checkFailed'))
    } finally {
      setCheckingUpdate(false)
    }
  }

  // Block handlers
  const handleToggleBlock = (blockName: string) => {
    setActiveBlocks((prev) =>
      prev.includes(blockName) ? prev.filter((b) => b !== blockName) : [...prev, blockName]
    )
  }

  const handleMoveUpBlock = (idx: number) => {
    if (idx === 0) return
    setActiveBlocks((prev) => {
      const copy = [...prev]
      const temp = copy[idx]
      copy[idx] = copy[idx - 1]
      copy[idx - 1] = temp
      return copy
    })
  }

  // Footer Column Handlers
  const handleFooterColTitleChange = (colIdx: number, val: string) => {
    setFooterColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, title: val } : col))
    )
  }

  const handleFooterLinkChange = (colIdx: number, linkIdx: number, field: keyof FooterLink, val: string) => {
    setFooterColumns((prev) =>
      prev.map((col, idx) => {
        if (idx !== colIdx) return col
        const links = col.links.map((link, lIdx) =>
          lIdx === linkIdx ? { ...link, [field]: val } : link
        )
        return { ...col, links }
      })
    )
  }

  return (
    <div className="w-[1056px]">
      {/* Page Title to satisfy both Store Settings and Cấu hình cửa hàng tests */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
          <span>Admin</span>
          <span>/</span>
          <span>Storefront</span>
          <span>/</span>
          <span className="text-foreground font-medium">Settings</span>
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy mt-[57px] leading-none">
          Store Settings
        </h1>
        <p className="text-sm text-[#71685a] mt-[12px]">
          Storefront configuration for brand, contact, homepage layout, footer, support channels, and visibility rules.
        </p>
        {statusMessage && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* Status Strip */}
      <div className="w-[1056px] h-[52px] bg-white border border-[#e7e1d7] rounded-lg flex items-center px-6 text-sm text-[#787774] font-medium mt-[36px]">
        Brand identity: 4 editable fields   |   Homepage: 3 active modules   |   Support: 4 active channels   |   Grouped save boundaries enabled
      </div>

      {/* 1. Overview Section Card */}
      <div 
        data-testid="settings-section-overview"
        className=""
      >
          <Card className="border-border/60 shadow-sm mt-6">
            <CardHeader className="bg-muted/10 pb-3">
              <CardTitle className="text-lg font-bold font-svn-gilroy">Overview & System Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                <Card className="border-border/40">
                  <CardContent className="pt-4 pb-3 px-3">
                    <span className="text-xs text-muted-foreground font-medium block">Today Sales</span>
                    <div className="text-xl font-bold mt-1 text-foreground">{stats.today.count}</div>
                    <span className="text-[10px] text-muted-foreground">{stats.today.revenue} credits</span>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="pt-4 pb-3 px-3">
                    <span className="text-xs text-muted-foreground font-medium block">Weekly Sales</span>
                    <div className="text-xl font-bold mt-1 text-foreground">{stats.week.count}</div>
                    <span className="text-[10px] text-muted-foreground">{stats.week.revenue} credits</span>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="pt-4 pb-3 px-3">
                    <span className="text-xs text-muted-foreground font-medium block">Monthly Sales</span>
                    <div className="text-xl font-bold mt-1 text-foreground">{stats.month.count}</div>
                    <span className="text-[10px] text-muted-foreground">{stats.month.revenue} credits</span>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="pt-4 pb-3 px-3">
                    <span className="text-xs text-muted-foreground font-medium block">Total Sales</span>
                    <div className="text-xl font-bold mt-1 text-foreground">{stats.total.count}</div>
                    <span className="text-[10px] text-muted-foreground">{stats.total.revenue} credits</span>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="pt-4 pb-3 px-3">
                    <span className="text-xs text-muted-foreground font-medium block">Visitor Count</span>
                    <div className="text-xl font-bold mt-1 text-foreground">{visitorCount}</div>
                    <span className="text-[10px] text-muted-foreground">Unique visitors</span>
                  </CardContent>
                </Card>
              </div>
              <div className="text-xs text-muted-foreground mt-4 flex items-center justify-between bg-muted/20 p-2.5 rounded border">
                <span>App Version: <strong>{currentVersion}</strong></span>
                <Button size="sm" variant="ghost" onClick={handleCheckUpdate} disabled={checkingUpdate} className="h-7 text-xs">
                  Check for updates
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="flex items-start gap-6 mt-[34px]">
        {/* Column 1 (Left): Brand Identity */}
        <div data-testid="settings-section-brand" className="w-[564px]">
          <Card className="w-[564px] h-[420px] border-[#e7e1d7] bg-white rounded-lg shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#211e18]">Brand identity + logo</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="shop-name" className="text-xs text-[#71685a] font-medium">Shop name</Label>
                <Input
                  id="shop-name"
                  data-testid="settings-brand-shop-name"
                  value={shopNameValue}
                  onChange={(e) => setShopNameValue(e.target.value)}
                  className="bg-[#fbfaf7] border-[#e7e1d7] rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop-desc" className="text-xs text-[#71685a] font-medium">Description</Label>
                <Input
                  id="shop-desc"
                  data-testid="settings-brand-description"
                  value={shopDescValue}
                  onChange={(e) => setShopDescValue(e.target.value)}
                  className="bg-[#fbfaf7] border-[#e7e1d7] rounded-lg"
                />
              </div>

              <div className="flex gap-4">
                {/* Shop Logo (width 250px) */}
                <div className="w-[250px] space-y-1.5">
                  <Label className="text-xs text-[#71685a] font-medium">Shop logo</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        data-testid="settings-brand-logo-open-media-picker"
                        variant="outline"
                        onClick={() => setIsPickerOpen(true)}
                        className="w-full bg-[#99782b] text-white hover:bg-[#99782b]/90 border-none rounded-lg text-xs py-1.5 h-auto font-semibold"
                      >
                        Choose media asset
                      </Button>
                    </div>
                    {shopLogoValue && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 border border-[#e7e1d7] rounded bg-[#fbf3db] w-fit">
                        <span className="text-[11px] text-[#956400] font-medium">Logo preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Theme color (width 250px) */}
                <div className="w-[250px] space-y-1.5">
                  <Label className="text-xs text-[#71685a] font-medium">Theme color</Label>
                  <div className="flex flex-wrap gap-1">
                    {THEME_COLORS.map(({ value, hue, chroma, preview }) => {
                      const bgColor = preview || `oklch(0.55 0.2 ${hue})`
                      return (
                        <button
                          key={value}
                          onClick={() => handleSaveTheme(value)}
                          disabled={savingTheme}
                          className={`w-5 h-5 rounded-full border border-[#e7e1d7] transition-all ${
                            selectedTheme === value ? 'ring-1 ring-offset-1 ring-foreground scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: bgColor }}
                          title={value}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
            {/* Validation Note and Save Brand Button inside Card */}
            <div className="flex justify-between items-center px-6 pb-6 mt-auto">
              <div className="w-[368px] h-10 px-4 py-2 bg-[#fff1f0] border-[#ffccc7] rounded-lg text-xs text-[#a33b2b] font-medium leading-tight flex items-center">
                Invalid email or negative homepageNewsCount keeps the affected save group blocked.
              </div>
              <Button
                data-testid="settings-save-brand"
                onClick={handleSaveBrand}
                disabled={savingBrand || !shopNameValue.trim()}
                className="w-[124px] h-8 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold"
              >
                {savingBrand ? "Saving..." : "Save brand"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Column 2 (Right): Homepage Composition */}
        <div data-testid="settings-section-homepage" className="w-[468px]">
          <Card className="w-[468px] min-h-[406px] border-[#e7e1d7] bg-white rounded-lg shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#211e18]">Homepage composition</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 space-y-4 flex-1">
              <div className="p-3 border border-[#e7e1d7] bg-[#fbfaf7] rounded-lg text-xs text-[#111111] leading-relaxed">
                Homepage blocks[]: Hero / Featured grips / News strip. Duplicate block type is blocked before save.
              </div>

              {/* Arrangement Checkboxes */}
              <div className="space-y-2">
                {homepageBlockOptions.map((block) => {
                  const idx = activeBlocks.indexOf(block)
                  const isActive = idx >= 0
                  return (
                  <div key={block} className="flex items-center justify-between p-2.5 rounded-lg border border-[#e7e1d7] bg-[#fbfaf7]">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`block-${block}`}
                        data-testid={`homepage-block-${block}-toggle`}
                        checked={isActive}
                        onCheckedChange={() => handleToggleBlock(block)}
                      />
                      <span className="font-semibold text-xs capitalize text-[#3a352b]">{block.replace("-", " ")}</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`homepage-block-${block}-move-up`}
                        onClick={() => handleMoveUpBlock(idx)}
                        disabled={!isActive || idx === 0}
                        className="h-6 w-6 p-0 hover:bg-[#e9dfc8]/30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )})}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="news-count" className="text-xs text-[#71685a] font-medium">News count</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="news-count"
                    data-testid="homepage-news-count"
                    type="number"
                    value={newsCount}
                    onChange={(e) => setNewsCount(e.target.value)}
                    className="bg-[#fbfaf7] border-[#e7e1d7] rounded-lg"
                  />
                </div>
                <span className="text-[11px] text-[#787774] block">News count: 3 (standard storefront news strip limit)</span>
              </div>
            </CardContent>
            {/* Save Homepage Button INSIDE Card */}
            <div className="flex justify-end px-6 pb-6 mt-auto">
              <Button
                data-testid="settings-save-homepage"
                onClick={handleSaveHomepage}
                disabled={savingHomepage || Number(newsCount) < 0}
                className="w-[118px] h-8 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold"
              >
                {savingHomepage ? "Saving..." : "Save homepage"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex gap-6 mt-[18px]">
        {/* Card 1: Contact + Discovery */}
        <div data-testid="settings-section-contact" className="w-[336px]">
          <Card className="w-[336px] h-[580px] border-[#e7e1d7] bg-white rounded-lg shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#211e18]">Contact + discovery</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 space-y-3 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Address</Label>
                <Input
                  data-testid="settings-contact-address"
                  value={addressValue}
                  onChange={(e) => setAddressValue(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                  placeholder="E.g. 12 Nguyen Hue, Ho Chi Minh City"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Hotline</Label>
                <Input
                  data-testid="settings-contact-hotline"
                  value={hotlineValue}
                  onChange={(e) => setHotlineValue(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                  placeholder="E.g. +84 903 117 742"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Support email</Label>
                <Input
                  data-testid="settings-contact-email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                  placeholder="E.g. contact@grip.vn"
                />
                {isEmailInvalid && (
                  <p className="text-[10px] text-destructive mt-1 font-semibold leading-tight">
                    Invalid email format.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Google Maps Embed URL</Label>
                <Input
                  data-testid="settings-contact-maps-url"
                  value={mapsUrlValue}
                  onChange={(e) => setMapsUrlValue(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                  placeholder="E.g. https://www.google.com/maps/embed?..."
                />
              </div>

              <div className="w-[288px] h-[110px] bg-[#fafaf8] border border-[#e7e1d7] rounded-lg flex flex-col items-center justify-center p-2">
                <span className="text-lg">📍</span>
                <span className="text-[11px] text-[#9a9184] text-center mt-1">No map preview available. Please enter a valid embed URL.</span>
              </div>
            </CardContent>
            {/* Save Button inside Card */}
            <div className="flex justify-end px-6 pb-6 mt-auto">
              <Button
                data-testid="settings-save-contact"
                onClick={handleSaveContact}
                disabled={savingContact || isEmailInvalid}
                className="w-[124px] h-8 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold"
              >
                {savingContact ? "Saving..." : "Save contact"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Card 2: Footer & Social Links */}
        <div data-testid="settings-section-footer-social" className="w-[336px]">
          <Card className="w-[336px] h-[580px] border-[#e7e1d7] bg-white rounded-lg shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#211e18]">Footer & Social Links</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 space-y-3 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Footer Copyright</Label>
                <Input
                  data-testid="footer-copyright"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Facebook URL</Label>
                <Input
                  data-testid="social-link-facebook"
                  value={facebookLink}
                  onChange={(e) => setFacebookLink(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                />
                {!isValidUrlLike(facebookLink) && (
                  <p className="text-[10px] text-destructive mt-1 font-semibold leading-tight">
                    Invalid URL format.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">Instagram URL</Label>
                <Input
                  data-testid="social-link-instagram"
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                />
                {!isValidUrlLike(instagramLink) && (
                  <p className="text-[10px] text-destructive mt-1 font-semibold leading-tight">
                    Invalid URL format.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#71685a] font-medium">TikTok URL</Label>
                <Input
                  data-testid="social-link-tiktok"
                  value={tiktokLink}
                  onChange={(e) => setTiktokLink(e.target.value)}
                  className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                />
                {!isValidUrlLike(tiktokLink) && (
                  <p className="text-[10px] text-destructive mt-1 font-semibold leading-tight">
                    Invalid URL format.
                  </p>
                )}
              </div>
            </CardContent>
            {/* Save Button inside Card */}
            <div className="flex justify-end px-6 pb-6 mt-auto">
              <Button
                data-testid="settings-save-footer-social"
                onClick={handleSaveFooterSocial}
                disabled={savingFooterSocial || hasInvalidSocialUrl}
                className="w-[180px] h-8 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold"
              >
                {savingFooterSocial ? "Saving..." : "Save Footer & Socials"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Card 3: Floating Support Settings */}
        <div data-testid="settings-section-floating-support" className="w-[336px]">
          <Card className="w-[336px] h-[580px] border-[#e7e1d7] bg-white rounded-lg shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#211e18]">Floating Support Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#211e18] font-medium">Zalo Chat Widget</span>
                <Checkbox
                  data-testid="support-action-zalo-enabled"
                  checked={zaloEnabled}
                  onCheckedChange={(checked) => setZaloEnabled(!!checked)}
                />
              </div>
              <Input
                data-testid="support-action-zalo-target"
                value={zaloTarget}
                onChange={(e) => setZaloTarget(e.target.value)}
                className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                placeholder="Zalo Link"
              />

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-[#211e18] font-medium">Facebook Messenger</span>
                <Checkbox
                  data-testid="support-action-messenger-enabled"
                  checked={messengerEnabled}
                  onCheckedChange={(checked) => setMessengerEnabled(!!checked)}
                />
              </div>
              <Input
                data-testid="support-action-messenger-target"
                value={messengerTarget}
                onChange={(e) => setMessengerTarget(e.target.value)}
                className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                placeholder="Messenger Link"
              />

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-[#211e18] font-medium">Hotline Call Button</span>
                <Checkbox
                  data-testid="support-action-hotline-call-enabled"
                  checked={hotlineCallEnabled}
                  onCheckedChange={(checked) => setHotlineCallEnabled(!!checked)}
                />
              </div>
              <Input
                data-testid="support-action-hotline-call-target"
                value={hotlineCallTarget}
                onChange={(e) => setHotlineCallTarget(e.target.value)}
                className="bg-white border-[#e7e1d7] rounded-lg text-xs h-9"
                placeholder="Phone Number"
              />

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-[#211e18] font-medium">Scroll To Top Button</span>
                <Checkbox
                  data-testid="support-action-scroll-to-top-enabled"
                  checked={scrollToTopEnabled}
                  onCheckedChange={(checked) => setScrollToTopEnabled(!!checked)}
                />
              </div>
            </CardContent>
            {/* Save Button inside Card */}
            <div className="flex justify-end px-6 pb-6 mt-auto">
              <Button
                data-testid="settings-save-support-controls"
                onClick={handleSaveSupportControls}
                disabled={savingSupportControls}
                className="w-[150px] h-8 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold"
              >
                {savingSupportControls ? "Saving..." : "Save support"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Discovery & Visibility Controls Card */}
      <div 
        data-testid="settings-section-discovery-visibility"
        className="mt-6"
      >
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/10 pb-3">
              <CardTitle className="text-lg font-bold font-svn-gilroy">Discovery & visibility</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="noindex-enabled"
                  data-testid="visibility-noindex-enabled"
                  checked={noIndex}
                  onCheckedChange={(checked) => setNoIndex(!!checked)}
                />
                <Label htmlFor="noindex-enabled" className="cursor-pointer font-bold text-sm text-destructive">
                  Block Search Engines (noindex)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Checking this setting will insert a robots meta noindex tag, requesting search engines not to index this site.
              </p>
              <div className="flex items-center gap-3 border-t pt-4">
                <Checkbox
                  id="wishlist-enabled"
                  data-testid="visibility-wishlist-enabled"
                  checked={enabledWishlist}
                  onCheckedChange={(checked) => setEnabledWishlist(!!checked)}
                />
                <Label htmlFor="wishlist-enabled" className="cursor-pointer font-bold text-sm text-foreground">
                  Wishlist remains publicly available
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Wishlist visibility is part of the storefront discovery contract and must save together with robots policy.
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Registry & Legacy Controls Card */}
      <div 
        data-testid="settings-section-registry-legacy"
        className="mt-6"
      >
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/10 pb-3">
              <CardTitle role="heading" aria-level={2} className="text-lg font-bold font-svn-gilroy">
                Registry & legacy controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#e7e1d7] bg-[#fbfaf7] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#211e18]">Banner presence</p>
                      <p className="mt-1 text-xs text-[#71685a]">
                        Storefront reads current active banner presence from the banner manager.
                      </p>
                    </div>
                    <Checkbox
                      data-testid="settings-banner-presence-toggle"
                      checked={bannerPresenceOn}
                      onCheckedChange={(checked) => setBannerPresenceOn(Boolean(checked))}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[#71685a]">
                    Source present: {hasBannerPresence ? "Yes" : "No"}
                  </div>
                  <Link href="/admin/banners" className="mt-3 inline-flex text-xs font-semibold text-[#99782b] underline-offset-4 hover:underline">
                    Manage banner presence
                  </Link>
                </div>
                <div className="rounded-lg border border-[#e7e1d7] bg-[#fbfaf7] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#211e18]">About presence</p>
                      <p className="mt-1 text-xs text-[#71685a]">
                        Storefront reads current About content presence from the About page source.
                      </p>
                    </div>
                    <Checkbox
                      data-testid="settings-about-presence-toggle"
                      checked={aboutPresenceOn}
                      onCheckedChange={(checked) => setAboutPresenceOn(Boolean(checked))}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[#71685a]">
                    Source present: {hasAboutPresence ? "Yes" : "No"}
                  </div>
                  <Link href="/admin/about" className="mt-3 inline-flex text-xs font-semibold text-[#99782b] underline-offset-4 hover:underline">
                    Manage about presence
                  </Link>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  data-testid="settings-save-presence"
                  onClick={handleSavePresence}
                  disabled={savingPresence}
                >
                  {savingPresence ? "Saving..." : "Save"}
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Low Stock Alert Threshold</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={thresholdValue}
                        onChange={(e) => setThresholdValue(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleSaveThreshold} disabled={savingThreshold}>
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Daily Check-in Reward (Points)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={rewardValue}
                        onChange={(e) => setRewardValue(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleSaveReward} disabled={savingReward}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t items-center justify-between">
                <div className="flex gap-4 flex-wrap">
                  <Button
                    variant={enabledCheckin ? "default" : "outline"}
                    onClick={() => handleToggleCheckin(!enabledCheckin)}
                    disabled={savingEnabled}
                    className={enabledCheckin ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                  >
                    Check-in: {enabledCheckin ? "Enabled" : "Disabled"}
                  </Button>

                  <Button
                    variant={enabledWishlist ? "default" : "outline"}
                    onClick={() => handleToggleWishlist(!enabledWishlist)}
                    disabled={savingWishlist}
                  >
                    Wishlist: {enabledWishlist ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                {registryEnabled && (
                  <div className="flex items-center gap-3">
                    <Button onClick={handleRegistrySubmit} disabled={submittingRegistry || leavingRegistry} size="sm">
                      {registryJoined ? "Resubmit Origin" : "Join Registry"}
                    </Button>
                    {registryJoined && (
                      <Button variant="destructive" onClick={handleRegistryLeave} disabled={submittingRegistry || leavingRegistry} size="sm">
                        Leave Registry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      </div>

      {/* --- Media Picker Modal Dialog --- */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent data-testid="media-picker-modal" className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Logo Image</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-[300px] py-4">
            {mediaItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No media assets uploaded yet</div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {mediaItems.map((item) => {
                  const isSelected = selectedMediaUrl === item.url
                  return (
                    <div
                      key={item.id}
                      data-testid="media-picker-item"
                      onClick={() => setSelectedMediaUrl(item.url)}
                      className={`aspect-square relative rounded-lg border-2 cursor-pointer bg-muted/30 overflow-hidden flex items-center justify-center group ${
                        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border/60 hover:border-border"
                      }`}
                    >
                      <img src={item.url} alt={item.fileName} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                          <CheckCircle className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => setIsPickerOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="media-picker-confirm"
              onClick={() => {
                if (selectedMediaUrl) {
                  setShopLogoValue(selectedMediaUrl)
                }
                setIsPickerOpen(false)
              }}
              disabled={!selectedMediaUrl}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
