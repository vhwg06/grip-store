'use client'

import { useState } from "react"
import { useSWRConfig } from "swr"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, ArrowUp } from "lucide-react"
import {
  saveBrandSettings,
  saveContactSettings,
  saveHomepageSettings,
  saveFooterSettings,
  saveFloatingSupportSettings,
} from "@/adapters/api/admin.api"
import { useAdminMedia } from "@/application/hooks/useAdmin"
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
  shopName: string | null
  shopDescription: string | null
  shopLogo: string | null
  shopFooter: string | null
  themeColor: string | null
  socialLinks: string
  homepageBlocks: string
  contactAddress: string | null
  contactHotline: string | null
  contactEmail: string | null
  contactMapsUrl: string | null
}

export function AdminSettingsContent({
  shopName,
  shopDescription,
  shopLogo,
  shopFooter,
  themeColor,
  socialLinks,
  homepageBlocks,
  contactAddress,
  contactHotline,
  contactEmail,
  contactMapsUrl,
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

  // Floating support
  const [zaloEnabled, setZaloEnabled] = useState(() => !!socialLinksState.zalo)
  const [zaloTarget, setZaloTarget] = useState(socialLinksState.zalo || 'https://zalo.me/gripvn')
  const [messengerEnabled, setMessengerEnabled] = useState(() => !!socialLinksState.messenger)
  const [messengerTarget, setMessengerTarget] = useState(socialLinksState.messenger || '')
  const [hotlineCallEnabled, setHotlineCallEnabled] = useState(() => !!socialLinksState.hotlineCall)
  const [hotlineCallTarget, setHotlineCallTarget] = useState(socialLinksState.hotlineCall || '')
  const [scrollToTopEnabled, setScrollToTopEnabled] = useState(() => socialLinksState.scrollToTop === 'true')
  const [savingSupportControls, setSavingSupportControls] = useState(false)

  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Media Picker Dialog State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const { data: mediaData } = useAdminMedia({ page: 1, pageSize: 30 })
  const mediaItems = mediaData?.items ?? []
  const [selectedMediaUrl, setSelectedMediaUrl] = useState("")

  // --- Save handlers ---
  const handleSaveBrand = async () => {
    setSavingBrand(true)
    try {
      await saveBrandSettings({
        shopName: shopNameValue,
        shopDescription: shopDescValue,
        shopLogo: shopLogoValue,
        themeColor: themeColor || "amber"
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

      const nextSocials = { 
        ...socialLinksState, 
        zalo: zaloEnabled ? zaloTarget : "",
        messenger: messengerEnabled ? messengerTarget : "",
        hotlineCall: hotlineCallEnabled ? hotlineCallTarget : "",
        scrollToTop: scrollToTopEnabled ? "true" : "false"
      }
      setSocialLinksState(nextSocials)
      await Promise.all([mutate("catalog-settings"), mutate("site-config")])
      setStatusMessage("Support settings saved.")
      toast.success(t('common.success'))
    } catch (e: any) {
      setStatusMessage(null)
      toast.error(e.message || "Failed to save support controls")
    } finally {
      setSavingSupportControls(false)
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
          Storefront configuration for brand, contact, homepage layout, footer, and support channels.
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

      <div className="w-[1056px] h-[52px] bg-white border border-[#e7e1d7] rounded-lg flex items-center px-6 text-sm text-[#787774] font-medium mt-[36px]">
        Brand identity | Homepage composition | Footer & support save groups
      </div>

      <div className="flex items-start gap-6 mt-[34px]">
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
              </div>
            </CardContent>
            <div className="flex justify-between items-center px-6 pb-6 mt-auto">
              <div className="w-[368px] h-10 px-4 py-2 bg-[#fbfaf7] border border-[#e7e1d7] rounded-lg text-xs text-[#71685a] font-medium leading-tight flex items-center">
                Logo and identity changes publish through the shared storefront header and footer.
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
        <div data-testid="settings-section-contact" className="w-[336px]">
          <Card className="w-[336px] h-[580px] border-[#e7e1d7] bg-white rounded-lg shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#211e18]">Contact details</CardTitle>
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
