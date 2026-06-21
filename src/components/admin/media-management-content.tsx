"use client"

import {
  deleteAdminMedia,
  getPresignedUrl,
  registerMediaMetadata,
  uploadToR2,
  type MediaAsset,
} from "@/adapters/api/media.api"
import { useAdminMedia } from "@/application/hooks/useAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ImageIcon, RefreshCw, Search, Trash2, UploadCloud } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"

type MediaFilter = "all" | "used" | "recent" | "large"

function formatBytes(bytes: number) {
  if (!bytes) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminMediaManagementContent() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<MediaFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const params = useMemo(() => ({ page: 1, pageSize: 24, q: query, type: "image" as const }), [query])
  const { data, isLoading, mutate } = useAdminMedia(params)
  const assets = data?.items ?? []

  const filteredAssets = useMemo(() => {
    const next = [...assets]
    if (activeFilter === "used") return next.filter((asset) => asset.usedBy.length > 0)
    if (activeFilter === "large") return next.filter((asset) => asset.sizeBytes >= 1024 * 1024)
    if (activeFilter === "recent") {
      return next.sort((a, b) => {
        const left = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const right = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return right - left
      })
    }
    return next
  }, [activeFilter, assets])

  const selectedAsset = useMemo(
    () => filteredAssets.find((asset) => asset.id === selectedId) ?? filteredAssets[0] ?? null,
    [filteredAssets, selectedId],
  )

  const inUseCount = assets.filter((asset) => asset.usedBy.length > 0).length
  const totalBytes = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0)

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("Copied public URL")
    } catch {
      toast.error("Could not copy URL")
    }
  }

  const handleDelete = async (asset: MediaAsset) => {
    if (asset.usedBy.length > 0) return
    if (!window.confirm(`Delete ${asset.fileName}?`)) return

    setDeletingId(asset.id)
    try {
      await deleteAdminMedia(asset.id)
      toast.success("Media deleted")
      await mutate()
      setSelectedId(null)
    } catch (error: any) {
      toast.error(error?.message || "Could not delete media")
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh vượt quá giới hạn 5MB")
      return
    }
    setUploading(true)
    try {
      const presigned = await getPresignedUrl(file.name, file.type)
      await uploadToR2(presigned.upload_url, file)
      await registerMediaMetadata({
        id: presigned.id,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        url: presigned.public_url,
      })
      toast.success("Upload complete")
      await mutate()
      setSelectedId(presigned.id)
    } catch (error: any) {
      toast.error(error?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="text-[13px] font-medium text-[#786f61]">Admin / CMS / Media</div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#211e18]">Media Management</h1>
          <p className="max-w-[720px] text-sm text-[#71685a]">
            Central library for upload, reuse, and protection across banners, articles,
            products, and settings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => mutate()}
            className="h-[42px] rounded-lg border-[#e2ddd3] bg-white px-5 text-sm font-medium text-[#3a352b]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-[42px] rounded-lg bg-[#99782b] px-5 text-sm font-semibold text-white hover:bg-[#99782b]/90"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload image"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            data-testid="media-file-input"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              void handleUpload(file)
              event.currentTarget.value = ""
            }}
          />
        </div>
      </div>

      <div className="rounded-lg bg-[#fbfaf7] px-6 py-4 text-sm font-medium text-[#4c4437]">
        {assets.length} assets | {inUseCount} in use | {formatBytes(totalBytes)} stored | Delete guard on for referenced media
      </div>

      <div className="grid gap-6 xl:grid-cols-[744px_320px]">
        <section
          data-testid="admin-media-library"
          className="rounded-lg border border-[#e7e1d7] bg-white p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#211e18]">Media library</h2>
            <span className="text-xs font-medium text-[#786f61]">{assets.length} assets</span>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9184]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search filename or URL..."
              className="h-10 rounded-lg border-[#e7e1d7] bg-[#fbfaf7] pl-10 text-sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["used", "In use"],
              ["recent", "Recent"],
              ["large", "Large"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value as MediaFilter)}
                className={`h-[30px] rounded-[7px] px-4 text-xs font-semibold ${
                  activeFilter === value
                    ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                    : "border border-[#e7e1d7] bg-white text-[#71685a] hover:bg-[#faf6ee]"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[142px] animate-pulse rounded-lg bg-[#f3f1ec]" />
                ))
              : filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      data-testid="media-asset-card"
                      onClick={() => setSelectedId(asset.id)}
                      className={`overflow-hidden rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-[#99782b] shadow-[0_0_0_1px_#99782b]"
                          : "border-[#e7e1d7] hover:border-[#d8ccb2]"
                      }`}
                    >
                      <div className="relative h-[82px] w-full bg-[#f3f1ec]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" />
                        {asset.usedBy.length > 0 ? (
                          <span className="absolute right-4 top-3 rounded-full bg-[#fff7e5] px-3 py-1 text-[11px] font-semibold text-[#7b5d14]">
                            Used
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1 px-3 py-3">
                        <div className="truncate text-xs font-semibold text-[#211e18]">{asset.fileName}</div>
                        <div className="text-[11px] text-[#786f61]">
                          {asset.mimeType} · {formatBytes(asset.sizeBytes)}
                        </div>
                      </div>
                    </button>
                  )
                })}
          </div>

          {!isLoading && filteredAssets.length === 0 ? (
            <div className="mt-6 flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-[#e7e1d7] bg-[#fbfaf7] text-center text-sm text-[#8a806f]">
              <ImageIcon className="mb-2 h-7 w-7" />
              No assets match the current filter.
            </div>
          ) : null}
        </section>

        <aside className="rounded-lg border border-[#e7e1d7] bg-white p-6">
          <h2 className="text-base font-semibold text-[#211e18]">Asset details</h2>

          {selectedAsset ? (
            <div className="mt-5 space-y-4">
              <div className="h-40 overflow-hidden rounded-lg bg-[#f3f1ec]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedAsset.url} alt={selectedAsset.fileName} className="h-full w-full object-cover" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#211e18]">{selectedAsset.fileName}</div>
                <div className="whitespace-pre-line text-xs leading-5 text-[#71685a]">
                  {selectedAsset.mimeType}
                  {"\n"}
                  {formatBytes(selectedAsset.sizeBytes)}
                  {"\n"}
                  Uploaded {selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleDateString("en-US") : "recently"}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => handleCopy(selectedAsset.url)}
                className="h-9 w-full rounded-lg bg-[#99782b] text-xs font-semibold text-white hover:bg-[#99782b]/90"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy public URL
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={selectedAsset.usedBy.length > 0 || deletingId === selectedAsset.id}
                onClick={() => void handleDelete(selectedAsset)}
                className="h-9 w-full rounded-lg border-[#e2ddd3] bg-[#f3f1ec] text-xs font-semibold text-[#8a8276]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {selectedAsset.usedBy.length > 0 ? "Delete blocked" : deletingId === selectedAsset.id ? "Deleting..." : "Delete asset"}
              </Button>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-[#50483d]">Used by</div>
                {selectedAsset.usedBy.length > 0 ? (
                  selectedAsset.usedBy.map((usage) => (
                    <div key={usage} className="rounded-[7px] bg-[#fbfaf7] px-3 py-2 text-xs font-medium text-[#4c4437]">
                      {usage}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[7px] bg-[#fbfaf7] px-3 py-2 text-xs font-medium text-[#8a806f]">
                    Not referenced yet
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-[#e7e1d7] bg-[#fbfaf7] px-4 py-8 text-center text-sm text-[#8a806f]">
              Select an asset to inspect reuse, URL copy, and delete state.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
