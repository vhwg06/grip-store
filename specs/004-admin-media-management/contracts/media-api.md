# Media API Contract

Frontend calls use `/api/...`; `apiFetch` maps these paths to the Go backend `/v1/...` routes.

## List Media Assets

`GET /api/admin/media?page=1&pageSize=24&q=&type=image`

Expected success response may be either:

```json
{
  "items": [
    {
      "id": "media_123",
      "file_name": "banner.png",
      "mime_type": "image/png",
      "size_bytes": 1024,
      "url": "https://cdn.example.com/banner.png",
      "created_at": "2026-06-16T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 24
}
```

or wrapped in `data`.

## Create Presigned Upload URL

`GET /api/admin/media/presigned?fileName=banner.png&contentType=image/png`

Expected response:

```json
{
  "upload_url": "https://r2.example.com/upload",
  "public_url": "https://cdn.example.com/banner.png",
  "id": "media_123"
}
```

## Register Uploaded Media

`POST /api/media`

Request:

```json
{
  "id": "media_123",
  "file_name": "banner.png",
  "mime_type": "image/png",
  "size_bytes": 1024,
  "url": "https://cdn.example.com/banner.png"
}
```

Expected response: registered media asset or action result.

## Delete Media Asset

`DELETE /api/admin/media/{id}`

Expected response:

```json
{
  "success": true
}
```

Backend may return 409 or another error response if the asset is still referenced by banners, articles, or products.
