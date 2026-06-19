"use client"

import { deleteBanner, saveBanner } from "@/adapters/api/admin.api"
import { useAdminBanners } from "@/application/hooks/useAdmin"
import MediaUploader from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminBanner } from "@/domain/admin"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type BannerPageKey = "homepage" | "news" | "about-us" | "products"

type BannerEditor = {
  id?: number
  title: string
  subtitle: string
  image: string
  mobileImage: string
  ctaText: string
  ctaLink: string
  targetPage: BannerPageKey
  sortOrder: number
  isActive: boolean
}

const EMPTY_BANNER: BannerEditor = {
  title: "",
  subtitle: "",
  image: "",
  mobileImage: "",
  ctaText: "",
  ctaLink: "",
  targetPage: "homepage",
  sortOrder: 1,
  isActive: true,
}

function toEditorState(banner?: AdminBanner | null): BannerEditor {
  if (!banner) return EMPTY_BANNER
  return {
    id: banner.id,
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    image: banner.image,
    mobileImage: banner.mobileImage ?? "",
    ctaText: banner.ctaText ?? "",
    ctaLink: banner.ctaLink ?? "",
    targetPage: (banner.targetPage as BannerPageKey) || "homepage",
    sortOrder: banner.sortOrder || 0,
    isActive: banner.isActive,
  }
}

export function AdminBannersContent() {
  const { data: banners = [], mutate, isLoading } = useAdminBanners()
  const [activePage, setActivePage] = useState<BannerPageKey>("homepage")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editor, setEditor] = useState<BannerEditor>(EMPTY_BANNER)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filteredBanners = useMemo(() => {
    return banners
      .filter((banner) => (banner.targetPage || "homepage") === activePage)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [activePage, banners])

  const selectedBanner = useMemo(
    () => filteredBanners.find((banner) => banner.id === selectedId) ?? filteredBanners[0] ?? null,
    [filteredBanners, selectedId],
  )

  useEffect(() => {
    setEditor(toEditorState(selectedBanner))
    setSelectedId(selectedBanner?.id ?? null)
  }, [selectedBanner?.id])

  const handleField = <K extends keyof BannerEditor>(field: K, value: BannerEditor[K]) => {
    setEditor((current) => ({ ...current, [field]: value }))
  }

  const handleCreateNew = () => {
    setSelectedId(null)
    setEditor({
      ...EMPTY_BANNER,
      targetPage: activePage,
      sortOrder: filteredBanners.length + 1,
    })
  }

  const handleSave = async () => {
    if (!editor.image.trim()) {
      toast.error("Desktop image is required")
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      if (editor.id) formData.set("id", String(editor.id))
      formData.set("title", editor.title)
      formData.set("subtitle", editor.subtitle)
      formData.set("image", editor.image)
      formData.set("mobileImage", editor.mobileImage)
      formData.set("ctaText", editor.ctaText)
      formData.set("ctaLink", editor.ctaLink)
      formData.set("sortOrder", String(editor.sortOrder))
      formData.set("isActive", String(editor.isActive))
      formData.set("page", editor.targetPage)

      await saveBanner(formData)
      toast.success(editor.id ? "Banner updated" : "Banner created")
      await mutate()
    } catch (error: any) {
      toast.error(error?.message || "Could not save banner")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editor.id) return
    if (!window.confirm("Delete this banner?")) return
    setDeleting(true)
    try {
      await deleteBanner(editor.id)
      toast.success("Banner deleted")
      await mutate()
      handleCreateNew()
    } catch (error: any) {
      toast.error(error?.message || "Could not delete banner")
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="h-[680px] rounded-xl bg-[#f3f1ec]" />
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#211e18]">Banner Management</h1>
          <p className="max-w-[680px] text-sm text-[#71685a]">
            Choose the active banner set per page, preview it, and keep fallback behavior explicit.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleCreateNew}
          className="h-[42px] rounded-lg bg-[#99782b] px-5 text-sm font-semibold text-white hover:bg-[#99782b]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create banner
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-[#e7e1d7] bg-white p-2">
        {[
          ["homepage", "Homepage"],
          ["news", "News"],
          ["about-us", "About-Us"],
          ["products", "Products"],
        ].map(([value, label]) => (
          <Button
            key={value}
            type="button"
            onClick={() => {
              setActivePage(value as BannerPageKey)
              setSelectedId(null)
            }}
            className={`h-8 rounded-[7px] px-4 text-xs font-semibold ${
              activePage === value
                ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                : "bg-white text-[#71685a] hover:bg-[#f6f1e8]"
            }`}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[316px_436px_256px]">
        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Banner list</h2>
          <div className="mt-5 space-y-4">
            {filteredBanners.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#e7e1d7] bg-[#fbfaf7] px-4 py-10 text-center text-sm text-[#8a806f]">
                No banners for this page yet.
              </div>
            ) : (
              filteredBanners.map((banner) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setSelectedId(banner.id)}
                  className={`flex w-full gap-4 rounded-lg border p-4 text-left transition-all ${
                    selectedBanner?.id === banner.id
                      ? "border-[#99782b] bg-[#fbfaf7] shadow-[0_0_0_1px_#99782b]"
                      : "border-[#e7e1d7] bg-white hover:border-[#d8ccb2]"
                  }`}
                >
                  <div className="h-[54px] w-24 overflow-hidden rounded-md bg-[#f3f1ec]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.image} alt={banner.title || "Banner"} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[13px] font-semibold text-[#211e18]">
                      {banner.title || "Untitled banner"}
                    </div>
                    <div className="text-[13px] text-[#71685a]">
                      Sort {banner.sortOrder} · {banner.isActive ? "Active" : "Hidden"}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Public preview</h2>
          <div className="mt-5 overflow-hidden rounded-lg bg-[#b7a06a]">
            {editor.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editor.image} alt={editor.title || "Preview"} className="h-[218px] w-full object-cover" />
            ) : (
              <div className="flex h-[218px] items-center justify-center text-sm font-semibold text-white/90">
                Banner preview
              </div>
            )}
          </div>
          <p className="mt-5 text-sm text-[#71685a]">
            {activePage === "homepage"
              ? "Homepage preview. One slide: hide arrows and stop autoplay."
              : "Sub-page banners render against the shared page shell and keep title overlay readable."}
          </p>
          <div className="mt-8 rounded-lg bg-[#fffdf8] px-5 py-4">
            <div className="text-sm font-semibold text-[#3a2f18]">Fallback rules</div>
            <div className="mt-2 text-sm text-[#3a2f18]">
              Homepage hides the hero when empty. Sub-pages use the header fallback color.
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Banner details</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Target page</label>
              <select
                value={editor.targetPage}
                onChange={(event) => handleField("targetPage", event.target.value as BannerPageKey)}
                className="h-10 w-full rounded-lg border border-[#e7e1d7] bg-white px-3 text-sm text-[#211e18]"
              >
                <option value="homepage">Homepage</option>
                <option value="news">News</option>
                <option value="about-us">About-Us</option>
                <option value="products">Products</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Desktop image</label>
              <MediaUploader label="Desktop image" value={editor.image} onChange={(value) => handleField("image", String(value))} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Mobile image</label>
              <MediaUploader label="Mobile image" value={editor.mobileImage} onChange={(value) => handleField("mobileImage", String(value))} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Alt title</label>
              <Input value={editor.title} onChange={(event) => handleField("title", event.target.value)} className="h-10 border-[#e7e1d7]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Subtitle</label>
              <Input value={editor.subtitle} onChange={(event) => handleField("subtitle", event.target.value)} className="h-10 border-[#e7e1d7]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Sort order</label>
                <Input
                  type="number"
                  value={String(editor.sortOrder)}
                  onChange={(event) => handleField("sortOrder", Number(event.target.value) || 0)}
                  className="h-10 border-[#e7e1d7]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">Active</label>
                <button
                  type="button"
                  onClick={() => handleField("isActive", !editor.isActive)}
                  className={`flex h-10 w-full items-center justify-center rounded-lg border text-sm font-semibold ${
                    editor.isActive
                      ? "border-[#cfe5d3] bg-[#ecf7ed] text-[#2f6c3b]"
                      : "border-[#e2ddd3] bg-white text-[#71685a]"
                  }`}
                >
                  {editor.isActive ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">CTA text</label>
              <Input value={editor.ctaText} onChange={(event) => handleField("ctaText", event.target.value)} className="h-10 border-[#e7e1d7]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">CTA link</label>
              <Input value={editor.ctaLink} onChange={(event) => handleField("ctaLink", event.target.value)} className="h-10 border-[#e7e1d7]" />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {editor.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-10 rounded-lg border-[#ffccc7] bg-[#fff1f0] text-sm font-semibold text-[#a33b2b]"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete banner"}
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-10 rounded-lg bg-[#99782b] text-sm font-semibold text-white hover:bg-[#99782b]/90"
              >
                {saving ? "Saving..." : "Save banner"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
