"use client"

import { useMemo, useState } from "react"
import { Copy, ImageIcon, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
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

interface MediaLibraryProps {
  selectable?: boolean;
  onSelect?: (url: string, asset: MediaAsset) => void;
}

function formatBytes(bytes: number) {
  if (!bytes) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibrary({ selectable = false, onSelect }: MediaLibraryProps) {
  const [query, setQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedPreview, setUploadedPreview] = useState("")
  const params = useMemo(() => ({ page: 1, pageSize: 48, q: query, type: "image" as const }), [query])
  const { data, isLoading, error, mutate } = useAdminMedia(params)
  const assets = data?.items ?? []

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Đã sao chép URL")
    } catch {
      toast.error("Không thể sao chép URL")
    }
  }

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm(`Xóa ảnh "${asset.fileName}"?`)) return
    setDeletingId(asset.id)
    try {
      await deleteAdminMedia(asset.id)
      toast.success("Đã xóa media")
      mutate()
    } catch (e: any) {
      toast.error(e?.message || "Không thể xóa media")
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
    setProgress(0)
    try {
      const presigned = await getPresignedUrl(file.name, file.type)
      await uploadToR2(presigned.upload_url, file, setProgress)
      await registerMediaMetadata({
        id: presigned.id,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        url: presigned.public_url,
      })
      setUploadedPreview(presigned.public_url)
      toast.success("Đã tải ảnh lên R2")
      mutate()
      if (selectable) {
        onSelect?.(presigned.public_url, {
          id: presigned.id,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          url: presigned.public_url,
          createdAt: null,
        })
      }
    } catch (e: any) {
      toast.error(e?.message || "Không thể tải ảnh lên")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div data-testid="admin-media-library" className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,360px)_1fr]">
        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-3 text-base font-semibold">Tải ảnh lên R2</h2>
          <label data-testid="media-dropzone" className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center hover:bg-muted/40">
            {uploading ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm font-medium">Đang tải {progress}%</span>
              </>
            ) : (
              <>
                <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Chọn ảnh để tải lên</span>
                <span className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP tối đa 5MB</span>
              </>
            )}
            <input
              data-testid="media-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                void handleUpload(file)
                event.currentTarget.value = ""
              }}
            />
          </label>
          {uploadedPreview && (
            <div className="mt-3 overflow-hidden rounded-md border bg-muted">
              <img data-testid="media-preview-image" src={uploadedPreview} alt="Uploaded preview" className="h-40 w-full object-cover" />
            </div>
          )}
        </div>
        <div className="rounded-md border bg-card p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Thư viện media</h2>
              <p className="text-sm text-muted-foreground">Chọn lại ảnh đã upload cho banner, bài viết và sản phẩm.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
          <Input
            data-testid="media-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên file..."
            className="mb-4"
          />

          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Không tải được danh sách media. Kiểm tra backend `/api/admin/media`.
            </div>
          )}

          {!isLoading && !error && assets.length === 0 && (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
              <ImageIcon className="mb-2 h-8 w-8" />
              Chưa có media nào.
            </div>
          )}

          {!isLoading && !error && assets.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <div key={asset.id} data-testid="media-asset-card" className="overflow-hidden rounded-md border bg-background">
                  <div className="relative aspect-video bg-muted">
                    <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-3">
                    <div>
                      <p className="truncate text-sm font-medium" title={asset.fileName}>{asset.fileName}</p>
                      <p className="text-xs text-muted-foreground">{asset.mimeType} · {formatBytes(asset.sizeBytes)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectable && (
                        <Button
                          data-testid="media-select-btn"
                          type="button"
                          size="sm"
                          onClick={() => onSelect?.(asset.url, asset)}
                        >
                          Chọn ảnh
                        </Button>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(asset.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        URL
                      </Button>
                      <Button
                        data-testid="media-delete-btn"
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === asset.id}
                        onClick={() => handleDelete(asset)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
