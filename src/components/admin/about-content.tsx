"use client"

import { saveAdminAboutPage } from "@/adapters/api/admin.api"
import { useAdminAboutPage, useAdminMedia } from "@/application/hooks/useAdmin"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function AdminAboutContent() {
  const { data: aboutPage, mutate, isLoading } = useAdminAboutPage()
  const { data: mediaData } = useAdminMedia({ page: 1, pageSize: 12, type: "image" })
  const mediaItems = mediaData?.items ?? []

  const [body, setBody] = useState("")
  const [gallery, setGallery] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBody(aboutPage?.body ?? "")
    setGallery(aboutPage?.gallery ?? [])
  }, [aboutPage?.body, aboutPage?.gallery])

  const addGalleryItem = (url: string) => {
    setGallery((current) => (current.includes(url) ? current : [...current, url]))
  }

  const removeGalleryItem = (url: string) => {
    setGallery((current) => current.filter((item) => item !== url))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveAdminAboutPage({
        title: aboutPage?.title || "About Grip",
        slug: "about",
        body,
        gallery,
        templateKey: "about-us",
        status: "published",
      })
      toast.success("About page updated")
      await mutate()
    } catch (error: any) {
      toast.error(error?.message || "Could not save about page")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="h-[680px] rounded-xl bg-[#f3f1ec]" />
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#211e18]">About-Us Content</h1>
          <p className="max-w-[720px] text-sm text-[#71685a]">
            Edit company introduction and gallery content here. Banner ownership stays in Banner Management.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-[42px] rounded-lg bg-[#99782b] px-5 text-sm font-semibold text-white hover:bg-[#99782b]/90"
        >
          {saving ? "Saving..." : "Save page"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[506px_526px]">
        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#211e18]">Company introduction</h2>
          <div className="mt-5 rounded-lg border border-[#e7e1d7] bg-[#fbfaf7] px-5 py-3 text-xs font-semibold text-[#4c4437]">
            B I H2 H3 List Link Image from Media Quote
          </div>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-4 min-h-[360px] resize-none rounded-lg border-[#e7e1d7] text-sm leading-6 text-[#3a352b]"
          />
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#211e18]">Gallery order</h2>
              <span className="inline-flex h-9 items-center rounded-lg bg-[#99782b] px-4 text-xs font-semibold text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add media
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="relative h-[110px] w-[146px] overflow-hidden rounded-lg bg-[#f3f1ec]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`About gallery ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(image)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 text-sm font-medium text-[#71685a]">
              Drag to reorder. Remove only detaches from About page.
            </div>

            <div className="mt-6 rounded-lg bg-[#fffdf8] px-5 py-4 text-sm font-semibold text-[#3a2f18]">
              If the gallery is empty, hide the public gallery section completely.
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {mediaItems.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => addGalleryItem(asset.url)}
                  className="overflow-hidden rounded-lg border border-[#e7e1d7] bg-white text-left transition-colors hover:border-[#99782b]"
                >
                  <div className="h-24 bg-[#f3f1ec]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" />
                  </div>
                  <div className="px-3 py-2 text-[11px] font-semibold text-[#211e18]">{asset.fileName}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#e7e1d7] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#211e18]">Public preview</h2>
            <div className="mt-5 flex gap-4">
              <div className="flex h-[120px] w-[210px] items-center rounded-lg bg-[#99782b] px-5 text-sm font-semibold leading-6 text-white">
                Fallback About header uses banner manager when no active banner.
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(0, 4).map((image, index) => (
                  <div key={`${image}-${index}`} className="h-[92px] w-[92px] overflow-hidden rounded-lg bg-[#f3f1ec]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
