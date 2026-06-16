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

export interface MediaAsset {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string | null;
}

export interface MediaListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: "image";
}

export interface MediaListResult {
  items: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return
    search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ""
}

function normalizeMediaAsset(raw: any): MediaAsset {
  return {
    id: String(raw?.id ?? raw?.media_id ?? raw?.key ?? raw?.url ?? ""),
    fileName: String(raw?.fileName ?? raw?.file_name ?? raw?.name ?? "media"),
    mimeType: String(raw?.mimeType ?? raw?.mime_type ?? raw?.content_type ?? "image/*"),
    sizeBytes: Number(raw?.sizeBytes ?? raw?.size_bytes ?? raw?.size ?? 0),
    url: String(raw?.url ?? raw?.publicUrl ?? raw?.public_url ?? ""),
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
  }
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

export async function getAdminMedia(params: MediaListParams = {}): Promise<MediaListResult> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 24
  const payload = await apiFetch<any>(`/api/admin/media${qs({
    page,
    pageSize,
    q: params.q,
    type: params.type ?? "image",
  })}`)
  // Backend returns { data: [...items], meta: { limit, offset, total } }
  const meta = payload?.meta
  const rawData = payload?.data ?? payload
  const rawItems = Array.isArray(rawData)
    ? rawData
    : (Array.isArray(rawData?.items)
      ? rawData.items
      : (Array.isArray(rawData?.media) ? rawData.media : []))
  const items = rawItems.map(normalizeMediaAsset).filter((item: MediaAsset) => item.id && item.url)

  return {
    items,
    total: Number(meta?.total ?? rawData?.total ?? payload?.total ?? items.length),
    page: Number(meta ? Math.floor((meta.offset ?? 0) / Math.max(meta.limit ?? pageSize, 1)) + 1 : (rawData?.page ?? page)),
    pageSize: Number(meta?.limit ?? rawData?.pageSize ?? rawData?.page_size ?? pageSize),
  }
}

export async function deleteAdminMedia(id: string) {
  return apiFetch<any>(`/api/admin/media/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}
