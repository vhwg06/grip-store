"use client"

import React, { useEffect, useRef, useState } from "react"
import { UploadCloud, FileImage, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { getPresignedUrl, uploadToR2, registerMediaMetadata } from "@/adapters/api/media.api"
import { toast } from "sonner"

interface MediaUploaderProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
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
  label = "Hình ảnh"
}: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploads, setUploads] = useState<UploadingState[]>([])
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([])
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

        // Cập nhật giá trị ra Form chính
        if (multiple) {
          onChange([...currentImages, presigned.public_url])
        } else {
          onChange(presigned.public_url)
        }
        setLocalPreviews((prev) => {
          const index = prev.findIndex((item) => item.fileName === file.name)
          if (index < 0) return prev
          const removed = prev[index]
          if (removed) {
            URL.revokeObjectURL(removed.url)
            objectUrlsRef.current.delete(removed.url)
          }
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

  const handleRemoveImage = (urlToRemove: string) => {
    if (multiple) {
      onChange(currentImages.filter(url => url !== urlToRemove))
    } else {
      onChange("")
    }
    setLocalPreviews((prev) => {
      const retained: LocalPreview[] = []
      for (const item of prev) {
        if (item.url === urlToRemove) {
          URL.revokeObjectURL(item.url)
          objectUrlsRef.current.delete(item.url)
          continue
        }
        retained.push(item)
      }
      return retained
    })
  }

  const previewItems = currentImages.length > 0
    ? currentImages.map((url, index) => ({ key: `remote-${index}`, url }))
    : localPreviews.map((item) => ({ key: item.id, url: item.url }))

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{label}</span>
        {multiple && (
          <span className="text-xs text-neutral-500">
            {currentImages.length}/{maxFiles} ảnh
          </span>
        )}
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
          Hỗ trợ định dạng PNG, JPG, WEBP lên đến 5MB
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
    </div>
  )
}
