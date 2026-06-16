"use client"

import React, { useEffect, useRef, useState } from "react"
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Images } from "lucide-react"
import { getPresignedUrl, uploadToR2, registerMediaMetadata } from "@/adapters/api/media.api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MediaLibrary } from "@/components/admin/media-library"

interface MediaUploaderProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  maxSizeMB?: number;
  enableLibrary?: boolean;
}

interface UploadingState {
  fileName: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg?: string;
}

interface LocalPreview {
  id: string;
  fileName: string;
  url: string;
}

export default function MediaUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  label = "Hình ảnh",
  maxSizeMB = 5,
  enableLibrary = true,
}: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploads, setUploads] = useState<UploadingState[]>([])
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([])
  const [localBlobMap, setLocalBlobMap] = useState<Record<string, string>>({})
  const [libraryOpen, setLibraryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current.clear()
    }
  }, [])

  // Chuẩn hóa danh sách ảnh hiện tại
  const currentImages = Array.isArray(value)
    ? value
    : value
      ? [value]
      : []

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesUpload(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFilesUpload(Array.from(e.target.files))
    }
  }

  const handleFilesUpload = async (files: File[]) => {
    // Lọc chỉ nhận ảnh hợp lệ
    const imageFiles = files.filter(f => f.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      toast.error("Vui lòng chỉ chọn các tệp hình ảnh hợp lệ (.jpg, .png, .webp)!")
      return
    }

    const maxBytes = maxSizeMB * 1024 * 1024
    const oversized = imageFiles.find((file) => file.size > maxBytes)
    if (oversized) {
      toast.error(`Ảnh "${oversized.name}" vượt quá giới hạn ${maxSizeMB}MB!`)
      return
    }

    // Kiểm tra giới hạn số lượng file
    if (multiple && currentImages.length + imageFiles.length > maxFiles) {
      toast.error(`Bạn chỉ được tải lên tối đa ${maxFiles} hình ảnh!`)
      return
    }

    const filesToUpload = multiple ? imageFiles : [imageFiles[0]]
    const createdPreviews = filesToUpload.map((file) => {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.add(url)
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        url,
      } satisfies LocalPreview
    })

    setLocalPreviews((prev) => {
      if (!multiple) return createdPreviews.slice(0, 1)
      const merged = [...prev, ...createdPreviews]
      return merged.slice(0, maxFiles)
    })

    const newUploads = filesToUpload.map(f => ({
      fileName: f.name,
      progress: 0,
      status: "uploading" as const
    }))

    setUploads(prev => [...prev, ...newUploads])

    let nextImages = [...currentImages]
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      try {
        // Bước 1: Xin Presigned URL từ backend
        const presigned = await getPresignedUrl(file.name, file.type)

        // Bước 2: Tải file trực tiếp lên Cloudflare R2
        await uploadToR2(presigned.upload_url, file, (percent) => {
          setUploads(prev =>
            prev.map(item =>
              item.fileName === file.name ? { ...item, progress: percent } : item
            )
          )
        })

        // Bước 3: Đăng ký metadata với backend
        await registerMediaMetadata({
          id: presigned.id,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          url: presigned.public_url
        })

        // Cập nhật trạng thái thành công
        setUploads(prev =>
          prev.map(item =>
            item.fileName === file.name ? { ...item, status: "success" as const } : item
          )
        )

        // Lưu vết ánh xạ từ URL remote sang URL local blob để hiển thị preview không bị gián đoạn
        const localPreview = createdPreviews.find(p => p.fileName === file.name)
        if (localPreview) {
          setLocalBlobMap(prev => ({
            ...prev,
            [presigned.public_url]: localPreview.url
          }))
        }

        // Cập nhật giá trị ra Form chính
        if (multiple) {
          nextImages = [...nextImages, presigned.public_url].slice(0, maxFiles)
          onChange(nextImages)
        } else {
          nextImages = [presigned.public_url]
          onChange(presigned.public_url)
        }
        setLocalPreviews((prev) => {
          const index = prev.findIndex((item) => item.fileName === file.name)
          if (index < 0) return prev
          // Không gọi URL.revokeObjectURL ở đây để localBlobMap vẫn truy cập được ảnh blob
          return [...prev.slice(0, index), ...prev.slice(index + 1)]
        })

        toast.success(`Tải lên ảnh "${file.name}" thành công!`)
      } catch (err: any) {
        console.error("Upload error:", err)
        setUploads(prev =>
          prev.map(item =>
            item.fileName === file.name
              ? { ...item, status: "error" as const, errorMsg: err.message || "Lỗi tải tệp" }
              : item
          )
        )
        toast.error(`Tải lên ảnh "${file.name}" thất bại!`)
      }
    }

    // Tự động dọn dẹp danh sách tiến trình sau 3 giây
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status === "uploading"))
    }, 3000)
  }

  const handleSelectFromLibrary = (url: string) => {
    if (multiple) {
      if (currentImages.includes(url)) {
        setLibraryOpen(false)
        return
      }
      if (currentImages.length >= maxFiles) {
        toast.error(`Bạn chỉ được chọn tối đa ${maxFiles} hình ảnh!`)
        return
      }
      onChange([...currentImages, url])
    } else {
      onChange(url)
    }
    setLibraryOpen(false)
  }

  const handleRemoveImage = (urlToRemove: string) => {
    if (multiple) {
      onChange(currentImages.filter(url => url !== urlToRemove))
    } else {
      onChange("")
    }
    
    // Thu hồi blob URL tương ứng nếu có
    const localUrl = localBlobMap[urlToRemove] || urlToRemove
    if (localUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localUrl)
      objectUrlsRef.current.delete(localUrl)
    }

    setLocalPreviews((prev) => {
      const retained: LocalPreview[] = []
      for (const item of prev) {
        if (item.url === localUrl) {
          URL.revokeObjectURL(item.url)
          objectUrlsRef.current.delete(item.url)
          continue
        }
        retained.push(item)
      }
      return retained
    })

    setLocalBlobMap((prev) => {
      const next = { ...prev }
      delete next[urlToRemove]
      return next
    })
  }

  const previewItems = (() => {
    const getDisplayUrl = (url: string) => {
      return localBlobMap[url] || url
    }

    if (!multiple) {
      if (localPreviews.length > 0) {
        return [{ key: localPreviews[0].id, url: localPreviews[0].url }]
      }
      if (currentImages.length > 0) {
        return [{ key: `remote-0`, url: getDisplayUrl(currentImages[0]) }]
      }
      return []
    } else {
      const items = currentImages.map((url, index) => ({ key: `remote-${index}`, url: getDisplayUrl(url) }))
      localPreviews.forEach((item) => {
        const isUploaded = currentImages.some(url => localBlobMap[url] === item.url)
        if (!isUploaded) {
          items.push({ key: item.id, url: item.url })
        }
      })
      return items
    }
  })()

  return (
    <div className="space-y-3 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{label}</span>
        <div className="flex items-center gap-2">
          {multiple && (
            <span className="text-xs text-neutral-500">
              {currentImages.length}/{maxFiles} ảnh
            </span>
          )}
          {enableLibrary && (
            <Button type="button" variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
              <Images className="mr-2 h-4 w-4" />
              Chọn từ thư viện
            </Button>
          )}
        </div>
      </div>

      {/* Vùng Dropzone kéo thả */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[140px] ${
          dragActive
            ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="media-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
          data-testid="media-file-input"
        />

        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-500 mb-2 transition-transform duration-300 group-hover:scale-110">
          <UploadCloud className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Kéo thả ảnh hoặc nhấp để chọn tệp
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Hỗ trợ định dạng PNG, JPG, WEBP lên đến {maxSizeMB}MB
        </p>
      </div>

      {/* Hiển thị Tiến độ Upload */}
      {uploads.length > 0 && (
        <div data-testid="media-upload-progress" className="space-y-2 mt-2 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
          {uploads.map((upload, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="truncate max-w-[200px] text-neutral-600 dark:text-neutral-400">{upload.fileName}</span>
                <span className="flex items-center gap-1">
                  {upload.status === "uploading" && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-primary">{upload.progress}%</span>
                    </>
                  )}
                  {upload.status === "success" && (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Hoàn thành</span>
                    </>
                  )}
                  {upload.status === "error" && (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span className="text-rose-500">Thất bại</span>
                    </>
                  )}
                </span>
              </div>
              
              {/* Progress bar line */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    upload.status === "error"
                      ? "bg-rose-500"
                      : upload.status === "success"
                        ? "bg-emerald-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị thư viện Preview các ảnh đã upload */}
      {previewItems.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
          {previewItems.map(({ key, url }, index) => (
            <div
              key={key}
              data-testid="media-preview-card"
              className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 group shadow-sm bg-neutral-50"
            >
              <img
                src={url}
                alt={`${label} preview ${index}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                data-testid="media-preview-image"
              />
              <button
                type="button"
                data-testid="media-remove-btn"
                onClick={() => handleRemoveImage(url)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-600 text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md backdrop-blur-xs scale-90 hover:scale-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {enableLibrary && (
        <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>Chọn media</DialogTitle>
              <DialogDescription>
                Chọn ảnh đã tải lên R2 để dùng lại cho trường này.
              </DialogDescription>
            </DialogHeader>
            <MediaLibrary selectable onSelect={handleSelectFromLibrary} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
