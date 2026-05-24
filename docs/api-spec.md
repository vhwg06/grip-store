# Grip Store REST API Specification

This document defines the backend contract required by the frontend migration in [docs/migration/plan.md](/workspaces/grip-store/docs/migration/plan.md:1). It reflects the current domain behavior extracted from `src/actions/*`, `src/lib/db/queries.ts`, and `src/lib/db/schema.ts`.

## Conventions

- Base path: `/api`
- Authentication:
  - Public: no authentication
  - Optional: accepts anonymous access and may tailor response for authenticated users
  - Bearer: `Authorization: Bearer {access_token}`
  - RefreshToken: refresh token in Bearer header or body for token rotation
- Content type: `application/json` unless noted otherwise
- Money values are serialized as strings to preserve precision
- Timestamps are Unix milliseconds unless otherwise noted

## Auth

### `POST /api/auth/refresh`
- Auth: RefreshToken
- Request:
```json
{
  "refresh_token": "string"
}
```
- Response:
```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "expires_in": 900,
  "user": {
    "id": "123",
    "username": "alice",
    "email": "alice@example.com",
    "avatar_url": "https://cdn.example.com/avatar.png",
    "trustLevel": 3,
    "isAdmin": false,
    "points": 42,
    "desktopNotificationsEnabled": true
  }
}
```

### `POST /api/auth/logout`
- Auth: Bearer
- Behavior: invalidates access/refresh tokens
- Response:
```json
{
  "success": true
}
```

### `GET /api/auth/me`
- Auth: Bearer
- Response:
```json
{
  "id": "123",
  "username": "alice",
  "email": "alice@example.com",
  "avatar_url": "https://cdn.example.com/avatar.png",
  "trustLevel": 3,
  "isAdmin": false,
  "points": 42,
  "desktopNotificationsEnabled": true
}
```

## Catalog

### `GET /api/catalog/products`
- Auth: Optional
- Query:
  - `category?`
  - `page?` default `1`
  - `limit?` default `20`
  - `q?`
  - `sort?` (`default`, `price_asc`, `price_desc`, `sales`, `rating`)
- Response:
```json
{
  "items": [
    {
      "id": "discord-nitro",
      "name": "Discord Nitro",
      "description": "Markdown supported",
      "price": "12.50",
      "compareAtPrice": "15.00",
      "image": "https://cdn.example.com/products/nitro.png",
      "category": "Subscriptions",
      "isHot": true,
      "isShared": false,
      "purchaseLimit": 1,
      "purchaseWarning": "One per account",
      "visibilityLevel": 1,
      "stock": 12,
      "sold": 104,
      "rating": 4.8,
      "reviewCount": 16
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### `GET /api/catalog/products/:id`
- Auth: Optional
- Response: single product DTO matching the shape above plus any product-specific purchase metadata required on the buy page

### `GET /api/catalog/products/:id/buy-meta`
- Auth: Optional
- Behavior: lazy metadata for the buy page after the product shell loads.
- Response:
```json
{
  "reviews": [],
  "averageRating": 0,
  "reviewCount": 0,
  "canReview": false,
  "reviewOrderId": null,
  "emailConfigured": false
}
```

### `GET /api/catalog/search`
- Auth: Optional
- Query:
  - `q`
  - `category?`
  - `page?`
  - `limit?`
- Response: same as `GET /api/catalog/products`

### `GET /api/catalog/categories`
- Auth: Public
- Response:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Subscriptions",
      "icon": "sparkles",
      "sortOrder": 0
    }
  ]
}
```

### `GET /api/catalog/settings`
- Auth: Public
- Response:
```json
{
  "shopName": "LDC Virtual Goods Shop",
  "shopDescription": "High-quality virtual goods, instant delivery",
  "shopLogo": null,
  "shopFooter": null,
  "themeColor": "purple",
  "noindexEnabled": false,
  "wishlistEnabled": true,
  "checkinEnabled": true,
  "checkinReward": 1,
  "lowStockThreshold": 3
}
```

### `GET /api/catalog/announcement`
- Auth: Public
- Response:
```json
{
  "content": "Markdown announcement",
  "updatedAt": 1716400000000
}
```

## Checkout and Payments

### `POST /api/checkout/orders`
- Auth: Optional
- Request:
```json
{
  "productId": "discord-nitro",
  "quantity": 1,
  "email": "alice@example.com",
  "usePoints": true
}
```
- Response:
```json
{
  "orderId": "LDC-20260523-0001",
  "status": "pending",
  "amount": "11.50",
  "pointsUsed": 1,
  "paymentUrl": "https://gateway.example.com/pay",
  "paymentParams": {
    "tradeNo": "GW123"
  }
}
```

### `POST /api/checkout/payment-orders`
- Auth: Optional
- Behavior: creates a generic direct payment order, used by `/pay` links.
- Request:
```json
{
  "amount": "12.50",
  "payee": "admin"
}
```
- Response:
```json
{
  "orderId": "LDC-20260523-0002",
  "status": "pending",
  "amount": "12.50",
  "paymentUrl": "https://gateway.example.com/pay",
  "paymentParams": {
    "tradeNo": "GW124"
  }
}
```

### `GET /api/checkout/orders/:id/payment-params`
- Auth: Bearer
- Response: latest payment parameters for retrying a pending payment

### `GET /api/checkout/orders/:id/status`
- Auth: Optional
- Response:
```json
{
  "orderId": "LDC-20260523-0001",
  "status": "pending",
  "paidAt": null,
  "deliveredAt": null
}
```

### `POST /api/checkout/orders/:id/cancel`
- Auth: Bearer
- Behavior: cancels pending order, unlocks reserved stock, reclaims points if applicable

### `POST /api/checkout/notify`
- Auth: Payment gateway signature
- Behavior: webhook endpoint used by payment provider

### `GET /api/checkout/callback/:id`
- Auth: Public
- Behavior: backend redirect target after payment completes

## Orders

### `GET /api/orders`
- Auth: Bearer
- Query:
  - `page?`
  - `status?`
- Response: paginated list of user orders with status, amount, quantity, points used, and delivery metadata

### `GET /api/orders/:id`
- Auth: Bearer
- Response: full order detail including delivered card keys, payment info, and review/refund eligibility

### `GET /api/orders/:id/status`
- Auth: Bearer
- Response:
```json
{
  "success": true,
  "status": "paid"
}
```

### `POST /api/orders/:id/cancel`
- Auth: Bearer
- Behavior: alias for checkout cancellation from order detail page

### `POST /api/orders/:id/refund-request`
- Auth: Bearer
- Request:
```json
{
  "reason": "Card does not work"
}
```

## Profile and Points

### `GET /api/profile`
- Auth: Bearer
- Response:
```json
{
  "user": {
    "id": "123",
    "name": "alice",
    "username": "alice",
    "avatar": "https://cdn.example.com/avatar.png",
    "email": "alice@example.com",
    "trustLevel": 3
  },
  "points": 42,
  "checkinEnabled": true,
  "orderStats": {
    "total": 5,
    "pending": 1,
    "delivered": 4
  },
  "notifications": [],
  "desktopNotificationsEnabled": false
}
```

### `PATCH /api/profile/email`
- Auth: Bearer
- Request:
```json
{
  "email": "alice@example.com"
}
```

### `PATCH /api/profile/notifications`
- Auth: Bearer
- Request:
```json
{
  "enabled": true
}
```

### `GET /api/profile/points`
- Auth: Bearer
- Response:
```json
{
  "points": 42
}
```

### `POST /api/profile/checkin`
- Auth: Bearer
- Response:
```json
{
  "success": true,
  "points": 1,
  "checkedIn": true
}
```

### `GET /api/profile/checkin/status`
- Auth: Bearer
- Response:
```json
{
  "checkedIn": false,
  "consecutiveDays": 5,
  "lastCheckinAt": 1716400000000
}
```

## Wishlist and Reviews

### Wishlist
- `GET /api/wishlist`
- `POST /api/wishlist`
- `POST /api/wishlist/:id/vote`
- `DELETE /api/wishlist/:id`

### Reviews
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews`
- `DELETE /api/admin/reviews/:id`

Review create request:
```json
{
  "productId": "discord-nitro",
  "orderId": "LDC-20260523-0001",
  "rating": 5,
  "comment": "Fast delivery"
}
```

## Notifications and Messaging

### User Notifications
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`
- `POST /api/notifications/clear`

### Messages
- `POST /api/messages/user`
- `GET /api/admin/messages`
- `POST /api/admin/messages`
- `DELETE /api/admin/messages/:id`
- `GET /api/admin/user-messages/unread-count`
- `POST /api/admin/user-messages/:id/read`
- `DELETE /api/admin/user-messages/:id`
- `POST /api/admin/user-messages/clear`

## Admin

All admin endpoints require Bearer auth and `isAdmin=true`.

### Products
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/:id/toggle`
- `POST /api/admin/products/reorder`

### Cards
- `GET /api/admin/cards`
- `POST /api/admin/cards/import`
- `DELETE /api/admin/cards/:id`
- `POST /api/admin/cards/pull`

### Orders and Refunds
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `DELETE /api/admin/orders/:id`
- `GET /api/admin/refund-requests`
- `POST /api/admin/refund-requests/:id/approve`
- `POST /api/admin/refund-requests/:id/reject`

### Users and Settings
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `DELETE /api/admin/categories/:id`

### Notifications and Maintenance
- `POST /api/admin/notifications/test`
- `POST /api/admin/notifications/broadcast`
- `POST /api/admin/data/import`
- `POST /api/admin/data/repair`
