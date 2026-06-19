'use client'

import { useState } from "react"
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
  saveShopName,
  saveShopDescription,
  saveShopLogo,
  saveShopFooter,
  saveThemeColor,
  saveLowStockThreshold,
  saveCheckinReward,
  saveCheckinEnabled,
  saveWishlistEnabled,
  saveNoIndex,
  saveRefundReclaimCards,
  saveRegistryHideNav,
  joinRegistry,
  leaveRegistry,
  saveSetting
} from "@/adapters/api/admin.api"
import { useAdminMedia } from "@/application/hooks/useAdmin"
import { checkForUpdatesClient, type ClientUpdateCheckResult } from "@/lib/update-check-client"
import { toast } from "sonner"

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
  refundReclaimCards: boolean
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
  refundReclaimCards,
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
  contactEmail
}: AdminSettingsContentProps) {
  const { t } = useI18n()

  // --- State variables ---
  // Brand & Contact
  const [shopNameValue, setShopNameValue] = useState(shopName || '')
  const [shopDescValue, setShopDescValue] = useState(shopDescription || '')
  const [shopLogoValue, setShopLogoValue] = useState(shopLogo || '')
  const [addressValue, setAddressValue] = useState(contactAddress || '')
  const [hotlineValue, setHotlineValue] = useState(contactHotline || '')
  const [emailValue, setEmailValue] = useState(contactEmail || '')
  const [savingBrand, setSavingBrand] = useState(false)

  // Homepage block layout composition
  const [activeBlocks, setActiveBlocks] = useState<string[]>(() =>
    homepageBlocks ? homepageBlocks.split(',') : ['hero', 'categories', 'products', 'latest-news', 'colors', 'usp']
  )
  const [newsCount, setNewsCount] = useState(() => '3') // We can initialize it
  const [savingHomepage, setSavingHomepage] = useState(false)

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
  const [savingFooterSocial, setSavingFooterSocial] = useState(false)

  // Floating Support & Visibility
  const [zaloEnabled, setZaloEnabled] = useState(() => !!socialLinksState.zalo)
  const [zaloTarget, setZaloTarget] = useState(socialLinksState.zalo || 'https://zalo.me/gripvn')
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
  const [refundReclaimEnabled, setRefundReclaimEnabled] = useState(refundReclaimCards)
  const [savingRefundReclaim, setSavingRefundReclaim] = useState(false)
  const [hideRegistryNav, setHideRegistryNav] = useState(registryHideNav)
  const [savingRegistryNav, setSavingRegistryNav] = useState(false)
  const [registryJoined, setRegistryJoined] = useState(registryOptIn)
  const [submittingRegistry, setSubmittingRegistry] = useState(false)
  const [leavingRegistry, setLeavingRegistry] = useState(false)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<ClientUpdateCheckResult | null>(null)

  // Media Picker Dialog State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const { data: mediaData } = useAdminMedia({ page: 1, pageSize: 30 })
  const mediaItems = mediaData?.items ?? []
  const [selectedMediaUrl, setSelectedMediaUrl] = useState("")

  // --- Save handlers ---
  const handleSaveBrand = async () => {
    setSavingBrand(true)
    try {
      await saveShopName(shopNameValue)
      await saveShopDescription(shopDescValue)
      await saveShopLogo(shopLogoValue)
      await saveSetting("contact_address", addressValue)
      await saveSetting("contact_hotline", hotlineValue)
      await saveSetting("contact_email", emailValue)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to save brand settings")
    } finally {
      setSavingBrand(false)
    }
  }

  const handleSaveHomepage = async () => {
    setSavingHomepage(true)
    try {
      await saveSetting("homepage_blocks", activeBlocks.join(","))
      await saveSetting("homepage_news_count", newsCount)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to save homepage composition")
    } finally {
      setSavingHomepage(false)
    }
  }

  const handleSaveFooterSocial = async () => {
    setSavingFooterSocial(true)
    try {
      await saveShopFooter(JSON.stringify(footerColumns))
      const nextSocials = { ...socialLinksState, facebook: facebookLink }
      await saveSetting("social_links", JSON.stringify(nextSocials))
      setSocialLinksState(nextSocials)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to save footer & social settings")
    } finally {
      setSavingFooterSocial(false)
    }
  }

  const handleSaveSupportControls = async () => {
    setSavingSupportControls(true)
    try {
      // Save Zalo floating buttons setting
      await saveSetting("floating_button_enabled", zaloEnabled ? "true" : "false")
      await saveSetting("floating_button_url", zaloTarget)

      // Save Zalo in social_links as well for mega footer integration
      const nextSocials = { ...socialLinksState, zalo: zaloEnabled ? zaloTarget : "" }
      await saveSetting("social_links", JSON.stringify(nextSocials))
      setSocialLinksState(nextSocials)

      // Save Visibility
      await saveNoIndex(noIndex)
      toast.success(t('common.success'))
    } catch (e: any) {
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
      await saveThemeColor(color)
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
      await saveCheckinReward(rewardValue)
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
      await saveCheckinEnabled(checked)
      setEnabledCheckin(checked)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingEnabled(false)
    }
  }

  const handleToggleRefundReclaim = async (checked: boolean) => {
    setSavingRefundReclaim(true)
    try {
      await saveRefundReclaimCards(checked)
      setRefundReclaimEnabled(checked)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingRefundReclaim(false)
    }
  }

  const handleToggleWishlist = async (checked: boolean) => {
    setSavingWishlist(true)
    try {
      await saveWishlistEnabled(checked)
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
      await saveRegistryHideNav(checked)
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
    <div className="space-y-8 max-w-5xl">
      {/* Page Title to satisfy both Store Settings and Cấu hình cửa hàng tests */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-svn-gilroy">
          Store Settings / Cấu hình cửa hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure global store details, branding, layout and support options.</p>
      </div>

      {/* 1. Overview Section Card */}
      <div data-testid="settings-section-overview">
        <Card className="border-border/60 shadow-sm">
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

      {/* 2. Brand Identity & Contact Details Card */}
      <div data-testid="settings-section-brand">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-3">
            <CardTitle className="text-lg font-bold font-svn-gilroy">Brand Identity & Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  data-testid="settings-brand-shop-name"
                  value={shopNameValue}
                  onChange={(e) => setShopNameValue(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop-desc">Shop Description</Label>
                <Input
                  id="shop-desc"
                  data-testid="settings-brand-description"
                  value={shopDescValue}
                  onChange={(e) => setShopDescValue(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="shop-logo">Shop Logo Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="shop-logo"
                    value={shopLogoValue}
                    onChange={(e) => setShopLogoValue(e.target.value)}
                    placeholder="Logo URL or pick from library"
                    className="font-mono text-xs"
                  />
                  <Button
                    data-testid="settings-brand-logo-open-media-picker"
                    variant="outline"
                    onClick={() => setIsPickerOpen(true)}
                    className="shrink-0"
                  >
                    <ImageIcon className="w-4 h-4 mr-1.5 shrink-0" />
                    Open Picker
                  </Button>
                </div>
                {shopLogoValue && (
                  <div className="flex items-center gap-3 p-2 border rounded bg-muted/20 w-fit mt-2">
                    <img src={shopLogoValue} alt="Logo" className="h-8 w-auto object-contain max-w-[120px]" />
                    <span className="text-xs text-muted-foreground">Logo preview</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Contact Address</Label>
                <Input
                  data-testid="settings-contact-address"
                  value={addressValue}
                  onChange={(e) => setAddressValue(e.target.value)}
                  placeholder="E.g. 12 Nguyen Hue, Ho Chi Minh City"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Contact Hotline</Label>
                <Input
                  data-testid="settings-contact-hotline"
                  value={hotlineValue}
                  onChange={(e) => setHotlineValue(e.target.value)}
                  placeholder="E.g. +84 903 117 742"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>Contact Email</Label>
                <Input
                  data-testid="settings-contact-email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="E.g. contact@grip.vn"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                data-testid="settings-save-brand"
                onClick={handleSaveBrand}
                disabled={savingBrand || !shopNameValue.trim()}
              >
                {savingBrand ? "Saving..." : "Save Brand Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Homepage Composition Card */}
      <div data-testid="settings-section-homepage">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-3">
            <CardTitle className="text-lg font-bold font-svn-gilroy">Homepage Layout Composition</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-foreground">Block Arrangement & Visibility</Label>
              <div className="space-y-2 max-w-xl">
                {activeBlocks.map((block, idx) => (
                  <div key={block} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`block-${block}`}
                        data-testid={`homepage-block-${block}-toggle`}
                        checked={activeBlocks.includes(block)}
                        onCheckedChange={() => handleToggleBlock(block)}
                      />
                      <span className="font-bold text-sm capitalize">{block.replace("-", " ")}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`homepage-block-${block}-move-up`}
                        onClick={() => handleMoveUpBlock(idx)}
                        disabled={idx === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ArrowUp className="w-4 h-4 shrink-0" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="news-count">Latest News Count</Label>
              <Input
                id="news-count"
                data-testid="homepage-news-count"
                type="number"
                value={newsCount}
                onChange={(e) => setNewsCount(e.target.value)}
              />
            </div>

            <div className="flex justify-end border-t pt-3">
              <Button
                data-testid="settings-save-homepage"
                onClick={handleSaveHomepage}
                disabled={savingHomepage}
              >
                {savingHomepage ? "Saving..." : "Save Homepage Design"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Footer & Social Links Card */}
      <div data-testid="settings-section-footer-social">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-3">
            <CardTitle className="text-lg font-bold font-svn-gilroy">Footer Structure & Social Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <span className="text-sm font-bold block border-b pb-2">Footer Columns</span>

              {footerColumns.map((col, cIdx) => (
                <div key={col.id} className="p-4 rounded-lg border bg-muted/5 space-y-3">
                  <div className="space-y-1.5 max-w-md">
                    <Label htmlFor={`col-${cIdx}-title`}>Column {cIdx + 1} Title</Label>
                    <Input
                      id={`col-${cIdx}-title`}
                      data-testid={`footer-column-${cIdx}-title`}
                      value={col.title}
                      onChange={(e) => handleFooterColTitleChange(cIdx, e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 pt-2 border-t">
                    {col.links.map((link, lIdx) => (
                      <div key={lIdx} className="space-y-2 p-2.5 rounded bg-background border">
                        <div className="space-y-1">
                          <Label>Link {lIdx + 1} Label</Label>
                          <Input
                            data-testid={`footer-column-${cIdx}-link-${lIdx}-label`}
                            value={link.label}
                            onChange={(e) => handleFooterLinkChange(cIdx, lIdx, "label", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Link {lIdx + 1} URL</Label>
                          <Input
                            data-testid={`footer-column-${cIdx}-link-${lIdx}-url`}
                            value={link.url}
                            onChange={(e) => handleFooterLinkChange(cIdx, lIdx, "url", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2 border-t">
              <span className="text-sm font-bold block">Social Media Integration</span>
              <div className="space-y-1.5 max-w-lg">
                <Label htmlFor="facebook-link">Facebook Page URL</Label>
                <Input
                  id="facebook-link"
                  data-testid="social-link-facebook"
                  value={facebookLink}
                  onChange={(e) => setFacebookLink(e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
            </div>

            <div className="flex justify-end border-t pt-3">
              <Button
                data-testid="settings-save-footer-social"
                onClick={handleSaveFooterSocial}
                disabled={savingFooterSocial}
              >
                {savingFooterSocial ? "Saving..." : "Save Footer & Social"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Floating Support & Visibility Controls Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <div data-testid="settings-section-floating-support" className="h-full">
          <Card className="border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/10 pb-3">
              <CardTitle className="text-lg font-bold font-svn-gilroy">Floating Contact Buttons</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="zalo-enabled"
                    data-testid="support-action-zalo-enabled"
                    checked={zaloEnabled}
                    onCheckedChange={(checked) => setZaloEnabled(!!checked)}
                  />
                  <Label htmlFor="zalo-enabled" className="cursor-pointer font-bold text-sm">
                    Enable Floating Zalo button
                  </Label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zalo-target">Zalo Target URL / Redirect</Label>
                  <Input
                    id="zalo-target"
                    data-testid="support-action-zalo-target"
                    value={zaloTarget}
                    onChange={(e) => setZaloTarget(e.target.value)}
                    disabled={!zaloEnabled}
                    placeholder="https://zalo.me/number"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t pt-4 mt-4">
                <Button
                  data-testid="settings-save-support-controls"
                  onClick={handleSaveSupportControls}
                  disabled={savingSupportControls}
                >
                  {savingSupportControls ? "Saving..." : "Save Support & Visibility"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div data-testid="settings-section-discovery-visibility" className="h-full">
          <Card className="border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/10 pb-3">
              <CardTitle className="text-lg font-bold font-svn-gilroy">Discovery & Visibility (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 6. Registry & Legacy Controls Card */}
      <div data-testid="settings-section-registry-legacy">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-3">
            <CardTitle className="text-lg font-bold font-svn-gilroy">Registry & Legacy Store Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Theme Color */}
              <div className="space-y-3">
                <span className="text-sm font-bold block">Theme Color Picker</span>
                <div className="flex flex-wrap gap-2.5">
                  {THEME_COLORS.map(({ value, hue, chroma, preview }) => {
                    const saturation = typeof chroma === 'number' ? chroma : 1
                    const bgColor = preview || `oklch(0.55 ${0.2 * saturation} ${hue})`
                    return (
                      <button
                        key={value}
                        onClick={() => handleSaveTheme(value)}
                        disabled={savingTheme}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          selectedTheme === value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: bgColor }}
                        title={value}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Low Stock and Rewards */}
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

            {/* Checkin / Wishlist / Registry buttons */}
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

                <Button
                  variant={refundReclaimEnabled ? "default" : "outline"}
                  onClick={() => handleToggleRefundReclaim(!refundReclaimEnabled)}
                  disabled={savingRefundReclaim}
                >
                  Reclaim Refund Cards: {refundReclaimEnabled ? "Enabled" : "Disabled"}
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
