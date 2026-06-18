# Contract: Admin Store Settings API

Mục tiêu của contract này là mô tả API surface mong muốn cho `Store Settings` theo spec `005-admin-store-settings`.

Contract này dùng để:

- audit surface hiện tại
- viết API tests trước implementation
- tránh tiếp tục mở rộng `settingsMap` kiểu key-value rời rạc

---

## Desired Read Model

### `GET /v1/admin/store-settings`

Returns:

```json
{
  "config": {
    "brand": {
      "shopName": "Grip.vn",
      "shopDescription": "Premium architectural hardware",
      "shopLogo": "https://cdn.example.com/logo.webp",
      "themeColor": "amber"
    },
    "contact": {
      "stickyBarAddress": "Hanoi, Vietnam",
      "stickyBarHotline": "+84 903 117 742",
      "contactEmail": "contact@grip.vn"
    },
    "homepage": {
      "blocks": [
        { "key": "hero", "enabled": true, "order": 1 },
        { "key": "categories", "enabled": true, "order": 2 },
        { "key": "latest_news", "enabled": true, "order": 3 }
      ],
      "newsCount": 6
    },
    "footer": {
      "columns": [],
      "copyright": "Copyright 2026 Grip.vn",
      "socialLinks": {
        "facebook": "https://facebook.com/grip",
        "zalo": "https://zalo.me/...",
        "youtube": "https://youtube.com/...",
        "instagram": "https://instagram.com/..."
      }
    },
    "floatingSupport": [
      { "key": "zalo", "enabled": true, "target": "https://zalo.me/..." },
      { "key": "messenger", "enabled": false, "target": null },
      { "key": "hotline", "enabled": true, "target": "+84 903 117 742" },
      { "key": "scroll_to_top", "enabled": true, "target": null }
    ],
    "visibility": {
      "noIndexEnabled": false,
      "wishlistEnabled": true,
      "checkinEnabled": true,
      "checkinReward": 10,
      "refundReclaimCards": true
    },
    "registry": {
      "enabled": true,
      "joined": false,
      "hideNav": true
    }
  },
  "stats": {
    "today": { "count": 0, "revenue": 0 },
    "week": { "count": 0, "revenue": 0 },
    "month": { "count": 0, "revenue": 0 },
    "total": { "count": 0, "revenue": 0 }
  },
  "visitorCount": 0
}
```

---

## Desired Write Model

### `PUT /v1/admin/store-settings/brand`

```json
{
  "shopName": "Grip.vn",
  "shopDescription": "Premium architectural hardware",
  "shopLogo": "https://cdn.example.com/logo.webp",
  "themeColor": "amber"
}
```

### `PUT /v1/admin/store-settings/contact`

```json
{
  "stickyBarAddress": "Hanoi, Vietnam",
  "stickyBarHotline": "+84 903 117 742",
  "contactEmail": "contact@grip.vn"
}
```

### `PUT /v1/admin/store-settings/homepage`

```json
{
  "blocks": [
    { "key": "hero", "enabled": true, "order": 1 },
    { "key": "categories", "enabled": true, "order": 2 }
  ],
  "newsCount": 6
}
```

### `PUT /v1/admin/store-settings/footer`

```json
{
  "columns": [
    {
      "id": "products",
      "title": "Sản phẩm",
      "links": [
        { "label": "Tay nắm tủ", "url": "/products" }
      ]
    }
  ],
  "copyright": "Copyright 2026 Grip.vn",
  "socialLinks": {
    "facebook": "https://facebook.com/grip",
    "zalo": "https://zalo.me/..."
  }
}
```

### `PUT /v1/admin/store-settings/floating-support`

```json
{
  "actions": [
    { "key": "zalo", "enabled": true, "target": "https://zalo.me/..." },
    { "key": "hotline", "enabled": true, "target": "+84 903 117 742" },
    { "key": "scroll_to_top", "enabled": true, "target": null }
  ]
}
```

### `PUT /v1/admin/store-settings/visibility`

```json
{
  "noIndexEnabled": false,
  "wishlistEnabled": true,
  "checkinEnabled": true,
  "checkinReward": 10,
  "refundReclaimCards": true
}
```

### `PUT /v1/admin/store-settings/registry`

```json
{
  "joined": true,
  "hideNav": false
}
```

---

## Validation Rules

- `shopName`: required, trimmed, non-empty
- `shopLogo`: nullable, must be valid asset URL if present
- `stickyBarHotline`: nullable, phone format validation
- `contactEmail`: nullable, email format validation
- `blocks[].key`: unique, must belong to allowed block registry
- `newsCount`: integer `>= 0`
- `footer.columns[].title`: required if column exists
- `footer.columns[].links[].label`: required
- `footer.columns[].links[].url`: required
- `socialLinks.*`: valid absolute URL if present
- `floatingSupport.actions[].key`: enum of allowed values
- `scroll_to_top.target`: must be `null`
- `zalo|messenger.target`: required absolute URL when `enabled = true`
- `hotline.target`: required phone value when `enabled = true`
- `checkinReward`: integer `>= 0`

---

## Audit Note

Repo hiện tại chưa expose contract này. Surface hiện có đang dựa trên:

- `GET /api/admin/dashboard`
- `PATCH /api/admin/settings/:key`

Điều đó đủ cho key-value persistence tối thiểu, nhưng không đủ cho structured section save theo spec này.

Frontend implementation về sau có thể proxy contract này qua `/api/admin/store-settings...`, nhưng source-of-truth cho API tests là backend path `/v1/...`.
