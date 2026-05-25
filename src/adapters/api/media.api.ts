"use client"

import { apiFetch } from "@/adapters/api/http-client"

export interface PresignedResponse {
  upload_url: string;
  public_url: string;
  id: string;
}

export interface RegisterMediaPayload {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
}

/**
 * Lấy Presigned URL tải lên trực tiếp Cloudflare R2 từ Go Backend
 */
export async function getPresignedUrl(fileName: string, contentType: string): Promise<PresignedResponse> {
  const params = new URLSearchParams({
    fileName,
    contentType,
  })
  
  const res = await apiFetch<{ data?: PresignedResponse } | PresignedResponse>(
    `/api/admin/media/presigned?${params.toString()}`
  )
  
  return (res as any).data !== undefined ? (res as any).data : (res as PresignedResponse)
}

/**
 * Tải file trực tiếp lên Cloudflare R2 bằng XMLHttpRequest để theo dõi % tiến độ thực tế
 */
export async function uploadToR2(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", uploadUrl, true)
    xhr.setRequestHeader("Content-Type", file.type)

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`R2 upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error("R2 upload connection error"))
    }

    xhr.send(file)
  })
}

/**
 * Đăng ký thông tin metadata hình ảnh đã upload thành công vào PostgreSQL thông qua Go Backend
 */
export async function registerMediaMetadata(payload: RegisterMediaPayload): Promise<any> {
  return apiFetch<any>("/api/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}
