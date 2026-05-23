# Migration Plan: Pure Client App → REST API Architecture

## Mục tiêu
Chuyển Next.js từ **full-stack monolith** (server actions + drizzle DB) sang **pure client app** chỉ gọi REST API:

1. **Deliverable 1** – API Spec document cho backend team
2. **Deliverable 2** – Refactor frontend: xóa toàn bộ `'use server'`, thay bằng REST adapter layer
3. **Deliverable 3** – Thêm components mới

---

## Critical Decisions

> [!IMPORTANT]
> **Auth Strategy thay đổi hoàn toàn**: Hiện tại dùng `next-auth` với OAuth (LinuxDO + GitHub). Sau migration:
> - Backend nhận OAuth callback, issue **JWT access token + refresh token**
> - Frontend lưu tokens, attach Bearer header
> - Khi 401: tự động gọi refresh → retry → logout nếu fail
> - `next-auth` sẽ bị **xóa hoàn toàn** khỏi frontend

> [!IMPORTANT]
> **Next.js chỉ còn là SPA/SSG**: Không còn `'use server'`, không còn `next/cache`, không còn Drizzle. Tất cả data fetch bằng `fetch()` thuần hoặc SWR/React Query từ client.

> [!WARNING]
> **Breaking**: Các route `/api/auth/*` (next-auth handlers) sẽ bị xóa. OAuth redirect bây giờ do backend xử lý.

---

## Folder Structure Sau Migration

```
src/
├── domain/                     # Entity types, value objects (pure TS, no deps)
│   ├── auth.ts
│   ├── catalog.ts
│   ├── checkout.ts
│   ├── orders.ts
│   ├── profile.ts
│   ├── wishlist.ts
│   ├── notifications.ts
│   └── admin.ts
│
├── application/                # Use-case layer
│   ├── ports/                  # Interfaces (contracts)
│   │   ├── IAuthPort.ts
│   │   ├── ICatalogPort.ts
│   │   ├── ICheckoutPort.ts
│   │   ├── IOrdersPort.ts
│   │   ├── IProfilePort.ts
│   │   ├── IWishlistPort.ts
│   │   ├── INotificationsPort.ts
│   │   └── IAdminPort.ts
│   └── hooks/                  # React hooks wrapping ports (useCatalog, useAuth...)
│
├── adapters/
│   └── api/
│       ├── http-client.ts      # Base fetch, Bearer attach, 401 refresh retry
│       ├── token-store.ts      # Token storage (memory + cookie)
│       ├── auth.api.ts
│       ├── catalog.api.ts
│       ├── checkout.api.ts
│       ├── orders.api.ts
│       ├── profile.api.ts
│       ├── wishlist.api.ts
│       ├── notifications.api.ts
│       └── admin.api.ts
│
├── components/                 # Ít thay đổi – chỉ swap import
├── app/                        # Pages – chuyển sang Client Components
│
# XÓA HOÀN TOÀN:
# src/actions/       → DELETE
# src/lib/db/        → DELETE
# src/lib/auth.ts    → DELETE (next-auth)
# src/lib/email.ts   → DELETE
# src/lib/notifications.ts → DELETE
# src/lib/order-processing.ts → DELETE
# src/lib/epay.ts    → backend concern
# src/lib/card-api.ts → backend concern
```

---

## Deliverable 1: Backend API Spec

### DB Schema Summary (extracted từ `src/lib/db/schema.ts`)

| Entity | Table | Key Fields |
|--------|-------|------------|
| Product | `products` | id, name, price, compareAtPrice, category, image, isHot, isActive, isShared, purchaseLimit, purchaseWarning, visibilityLevel, stockCount, lockedCount, soldCount, rating, reviewCount |
| Card (Stock) | `cards` | id, productId, cardKey, isUsed, reservedOrderId, reservedAt, expiresAt, usedAt |
| Order | `orders` | orderId, productId, productName, amount, email, status(pending/paid/delivered/failed/refunded/cancelled), tradeNo, cardKey, cardIds, paidAt, deliveredAt, userId, username, pointsUsed, quantity, currentPaymentId |
| User | `login_users` | userId, username, email, points, isBlocked, desktopNotificationsEnabled, lastCheckinAt, consecutiveDays |
| Category | `categories` | id, name, icon, sortOrder |
| Review | `reviews` | id, productId, orderId, userId, username, rating(1-5), comment |
| RefundRequest | `refund_requests` | id, orderId, userId, reason, status(pending/approved/rejected/processed), adminNote |
| Notification | `user_notifications` | id, userId, type, titleKey, contentKey, data(JSON), isRead |
| AdminMessage | `admin_messages` | id, targetType(all/username/userId), targetValue, title, body, sender |
| Broadcast | `broadcast_messages` | id, title, body, sender |
| WishlistItem | `wishlist_items` | id, title, description, userId, username |
| WishlistVote | `wishlist_votes` | id, itemId, userId |

### Business Rules cần encode vào backend

**Checkout / Stock Logic:**
- `RESERVATION_TTL_MS` = 5 phút: card được reserve khi order tạo, auto-expire nếu chưa thanh toán
- `INFINITE_STOCK`: shared product có nhiều buyer dùng cùng 1 card key, không lock
- Stock = available (unused, không reserved hoặc reservation expired) cho normal product
- Shared product stock: `unusedCount > 0 ? INFINITE_STOCK : 0`
- Purchase limit check: tính cả paid + delivered orders của cùng userId hoặc email

**Points Logic:**
- 1 point = 1 đơn vị tiền tệ
- `pointsToUse = min(userPoints, ceil(finalAmount))`
- Zero-price (finalAmount ≤ 0): order delivered ngay, không qua payment gateway
- Points hoàn lại khi refund: `pointsUsed` trả lại vào account

**Auth / Visibility:**
- `visibilityLevel`: -1=public, 0=logged-in, 1=trust_level≥1, 2=trust_level≥2, 3=trust_level≥3
- Admin check: username trong `ADMIN_USERNAMES` env var
- OAuth providers: LinuxDO (`connect.linux.do`) + GitHub; userId format: LinuxDO→numeric string, GitHub→`github:{id}`

**Order Status Flow:**
```
pending → paid → delivered
       ↘ cancelled (user cancel hoặc admin)
       ↘ refunded (sau refund)
       ↘ failed
```

---

### Module 1: Auth API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/oauth/linuxdo` | Public | Redirect to LinuxDO OAuth |
| GET | `/api/auth/oauth/github` | Public | Redirect to GitHub OAuth |
| GET | `/api/auth/callback/linuxdo` | Public | OAuth callback LinuxDO |
| GET | `/api/auth/callback/github` | Public | OAuth callback GitHub |
| POST | `/api/auth/refresh` | RefreshToken | Rotate access token |
| POST | `/api/auth/logout` | Bearer | Invalidate tokens |
| GET | `/api/auth/me` | Bearer | Current user info |

**`GET /api/auth/me` Response:**
```typescript
{
  id: string
  username: string
  email: string | null
  avatar_url: string | null
  trustLevel: number
  isAdmin: boolean
  points: number
  desktopNotificationsEnabled: boolean
}
```

**Token Response (callback success):**
```typescript
{
  access_token: string   // JWT, short-lived (e.g. 15min)
  refresh_token: string  // long-lived (e.g. 30 days)
  expires_in: number     // seconds
  user: { id, username, email, avatar_url, trustLevel, isAdmin }
}
```

---

### Module 2: Catalog API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/catalog/products` | Optional | Active products list |
| GET | `/api/catalog/products/:id` | Optional | Product detail |
| GET | `/api/catalog/search?q=&category=&page=` | Optional | Search |
| GET | `/api/catalog/categories` | Public | Categories list |
| GET | `/api/catalog/settings` | Public | Public settings |
| GET | `/api/catalog/announcement` | Public | Announcement text |

**`GET /api/catalog/products` Query Params:**
```
category?: string
page?: number (default 1)
limit?: number (default 20)
```

**Product DTO:**
```typescript
{
  id: string
  name: string
  description: string | null
  price: string              // "12.50"
  compareAtPrice: string | null
  image: string | null
  category: string | null
  isHot: boolean
  isShared: boolean
  purchaseLimit: number | null
  purchaseWarning: string | null
  visibilityLevel: number
  stock: number              // -1 = INFINITE_STOCK (shared)
  sold: number
  rating: number             // 0.0 - 5.0
  reviewCount: number
}
```

**`GET /api/catalog/settings` Response:**
```typescript
{
  shopName: string
  shopDescription: string | null
  shopLogo: string | null
  shopFooter: string | null
  themeColor: string
  noindexEnabled: boolean
  wishlistEnabled: boolean
  checkinEnabled: boolean
  checkinReward: number
  lowStockThreshold: number
}
```

---

### Module 3: Checkout / Payment API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/checkout/orders` | Optional | Tạo order |
| GET | `/api/checkout/orders/:id/payment-params` | Bearer | Retry payment params |
| GET | `/api/checkout/orders/:id/status` | Optional+Cookie | Check payment status |
| POST | `/api/checkout/orders/:id/cancel` | Bearer | User cancel pending order |
| POST | `/api/checkout/notify` | PaymentGW | Webhook từ epay |
| GET | `/api/checkout/callback/:id` | Public | Post-payment redirect handler |

**`POST /api/checkout/orders` Request:**
```typescript
{
  productId: string
  quantity: number           // default 1
  email?: string             // delivery email
  usePoints?: boolean        // default false
}
```

**`POST /api/checkout/orders` Response (giữ shape hiện tại):**
```typescript
// Cần thanh toán:
{ success: true, url: string, params: Record<string, any> }

// Zero-price (points hoặc free):
{ success: true, url: string, isZeroPrice: true }

// Error:
{ success: false, error: 'buy.outOfStock' | 'buy.invalidQuantity' | 'buy.limitExceeded' | 'buy.userBlocked' | 'buy.productNotFound' | 'buy.stockLocked' | 'buy.quantityTooLarge' }
```

---

### Module 4: Orders API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/orders?page=&limit=` | Bearer | My orders |
| GET | `/api/orders/:id` | Bearer+Cookie | Order detail |
| POST | `/api/orders/:id/cancel` | Bearer | Cancel pending |
| GET | `/api/orders/:id/status` | Bearer+Cookie | Check status |
| POST | `/api/orders/:id/refund-request` | Bearer | Submit refund request |

**Order Detail DTO:**
```typescript
{
  orderId: string
  productId: string
  productName: string
  amount: string
  email: string | null
  status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded' | 'failed'
  cardKey: string | null      // only for delivered
  quantity: number
  pointsUsed: number
  paidAt: number | null       // ms timestamp
  deliveredAt: number | null
  createdAt: number
  canRefund: boolean
  canCancel: boolean
  refundRequest: { status: string, reason: string | null } | null
}
```

---

### Module 5: Profile / Points API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile` | Bearer | User profile + points |
| PATCH | `/api/profile/email` | Bearer | Update delivery email |
| PATCH | `/api/profile/notifications` | Bearer | Toggle desktop notifications |
| GET | `/api/profile/points` | Bearer | Points balance |
| POST | `/api/profile/checkin` | Bearer | Daily check-in |
| GET | `/api/profile/checkin/status` | Bearer | Check-in status today |

**Check-in Response:**
```typescript
// Success:
{ success: true, points: number, consecutiveDays: number }
// Already done:
{ success: false, error: 'Already checked in today' }
// Disabled:
{ success: false, error: 'Check-in is currently disabled' }
```

---

### Module 6: Wishlist / Reviews API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wishlist?limit=` | Optional | List items with vote counts |
| POST | `/api/wishlist` | Bearer | Submit item |
| POST | `/api/wishlist/:id/vote` | Bearer | Toggle vote |
| DELETE | `/api/wishlist/:id` | AdminBearer | Delete item |
| GET | `/api/products/:id/reviews?page=` | Public | Product reviews |
| POST | `/api/products/:id/reviews` | Bearer | Submit review |

**Wishlist Item DTO:**
```typescript
{
  id: number
  title: string
  description: string | null
  username: string | null
  createdAt: number
  votes: number
  voted: boolean  // for current user
}
```

**Submit Review Request:**
```typescript
{ orderId: string, rating: number, comment?: string }
```

**Submit Review Errors:** `'review.authRequired' | 'review.invalidRating' | 'review.orderNotFound' | 'review.invalidOrder' | 'review.notOwner' | 'review.orderNotDelivered' | 'review.alreadyReviewed'`

---

### Module 7: Notifications API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications?limit=` | Bearer | My notifications (direct + broadcast) |
| GET | `/api/notifications/unread-count` | Bearer | Unread count |
| POST | `/api/notifications/:id/read` | Bearer | Mark one read |
| POST | `/api/notifications/read-all` | Bearer | Mark all read |
| POST | `/api/notifications/clear` | Bearer | Clear all |
| GET | `/api/messages?page=` | Bearer | My messages from admin |
| POST | `/api/messages/:id/read` | Bearer | Mark message read |

**Notification DTO:**
```typescript
{
  id: number
  type: 'order_delivered' | 'refund_approved' | 'refund_rejected' | 'admin_message' | 'broadcast'
  titleKey: string       // i18n key
  contentKey: string     // i18n key
  data: string | null    // JSON: { params: {}, href: string }
  isRead: boolean
  createdAt: number
}
```

---

### Module 8: Admin API

#### 8a. Products & Cards
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/products?page=&search=` | All products (incl inactive) |
| POST | `/api/admin/products` | Create/update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| PATCH | `/api/admin/products/:id/status` | Toggle active |
| PATCH | `/api/admin/products/:id/order` | Reorder |
| GET | `/api/admin/products/:id/cards?page=` | Cards list |
| POST | `/api/admin/products/:id/cards` | Add cards (bulk) |
| DELETE | `/api/admin/cards/:id` | Delete single card |
| POST | `/api/admin/cards/bulk-delete` | Delete multiple cards |
| GET | `/api/admin/products/:id/card-api` | Get card API config |
| PUT | `/api/admin/products/:id/card-api` | Save card API config |
| POST | `/api/admin/products/:id/card-api/pull` | Pull one card from API |

**Product save request:**
```typescript
{
  id?: string              // if editing
  slug?: string            // for new product
  name: string
  description?: string
  price: string
  compareAtPrice?: string
  category?: string
  image?: string
  purchaseLimit?: number
  purchaseWarning?: string
  isHot?: boolean
  isShared?: boolean
  visibilityLevel: -1 | 0 | 1 | 2 | 3
}
```

#### 8b. Orders & Refunds
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/orders?page=&status=&search=` | Orders list |
| GET | `/api/admin/orders/:id` | Order detail (includes cardKey) |
| POST | `/api/admin/orders/:id/mark-paid` | Mark paid |
| POST | `/api/admin/orders/:id/deliver` | Mark delivered |
| POST | `/api/admin/orders/:id/cancel` | Cancel |
| DELETE | `/api/admin/orders/:id` | Delete |
| POST | `/api/admin/orders/bulk-delete` | Bulk delete |
| PATCH | `/api/admin/orders/:id/email` | Update email |
| POST | `/api/admin/orders/:id/refund` | Mark refunded |
| POST | `/api/admin/orders/:id/proxy-refund` | Proxy refund to gateway |
| GET | `/api/admin/orders/:id/verify-refund` | Verify refund status |
| GET | `/api/admin/refunds?page=` | Refund requests |
| POST | `/api/admin/refunds/:id/approve` | Approve refund |
| POST | `/api/admin/refunds/:id/reject` | Reject refund |
| GET | `/api/admin/refunds/pending-count` | Pending count |

#### 8c. Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users?page=&search=` | Users list |
| PATCH | `/api/admin/users/:id/block` | Block/unblock user |
| PATCH | `/api/admin/users/:id/points` | Adjust points |

#### 8d. Settings
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/settings` | All settings |
| PUT | `/api/admin/settings` | Batch update `{ key: value, ... }` |
| POST | `/api/admin/settings/test-notification` | Test Telegram/Bark |
| POST | `/api/admin/settings/test-email` | Test email |

**Settings keys:** `shop_name`, `shop_description`, `shop_logo`, `shop_footer`, `theme_color`, `noindex_enabled`, `wishlist_enabled`, `checkin_enabled`, `checkin_reward`, `low_stock_threshold`, `refund_reclaim_cards`, `telegram_*`, `bark_*`, `resend_*`, `registry_*`

#### 8e. Messages & Data
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/messages?page=` | Admin message history |
| POST | `/api/admin/messages` | Send message |
| DELETE | `/api/admin/messages/:id` | Delete message |
| POST | `/api/admin/messages/clear` | Clear all |
| GET | `/api/admin/reviews?page=` | All reviews |
| DELETE | `/api/admin/reviews/:id` | Delete review |
| GET | `/api/admin/categories` | Categories |
| POST | `/api/admin/categories` | Create/update |
| DELETE | `/api/admin/categories/:id` | Delete |
| GET | `/api/admin/stats` | Dashboard stats |
| POST | `/api/admin/data/import` | Import SQL dump |
| POST | `/api/admin/data/repair` | Repair timestamps |
| GET | `/api/admin/update-check` | Check for updates |

**`POST /api/admin/messages` Request:**
```typescript
{
  targetType: 'all' | 'username' | 'userId'
  targetValue?: string
  title: string
  body: string
}
```

---

## Deliverable 2: Frontend Refactor

### Phase 1 – Infrastructure (M0)

#### [NEW] `src/adapters/api/token-store.ts`
```typescript
// In-memory + httpOnly cookie fallback
export function getAccessToken(): string | null
export function setTokens(access: string, refresh: string, expiresIn: number): void
export function clearTokens(): void
export function getRefreshToken(): string | null
```

#### [NEW] `src/adapters/api/http-client.ts`
```typescript
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T>
// - Attach Authorization: Bearer {accessToken}
// - On 401: call /api/auth/refresh once, retry
// - On refresh fail: clearTokens(), redirect to /login
// - Normalize errors to { success: false, error: string }
```

#### [MODIFY] `src/app/layout.tsx`
- Xóa `SessionProvider` từ next-auth
- Thêm `AuthProvider` tự viết (React context giữ user state)

#### [DELETE] `src/app/api/auth/` – next-auth handlers
#### [DELETE] `src/lib/auth.ts` – next-auth config

---

### Phase 2 – Auth Adapter (M1)

#### [NEW] `src/domain/auth.ts`
```typescript
export interface User {
  id: string; username: string; email: string | null
  avatarUrl: string | null; trustLevel: number; isAdmin: boolean; points: number
}
export interface AuthTokens { accessToken: string; refreshToken: string; expiresAt: number }
export interface AuthSession { user: User; tokens: AuthTokens }
```

#### [NEW] `src/adapters/api/auth.api.ts`
```typescript
export async function loginWithLinuxDO(): Promise<void>   // redirect
export async function loginWithGitHub(): Promise<void>    // redirect
export async function logout(): Promise<void>
export async function refreshToken(): Promise<AuthTokens | null>
export async function getMe(): Promise<User | null>
```

#### [NEW] `src/application/hooks/useAuth.ts`
```typescript
export function useAuth(): { user: User | null; isAdmin: boolean; loading: boolean; logout(): void }
```

#### [MODIFY] `src/components/signin-button.tsx`
#### [MODIFY] `src/components/signout-button.tsx`

---

### Phase 3-9 – Feature Adapters (M2-M8)

Mỗi module tạo:
1. `src/domain/{module}.ts` – types
2. `src/adapters/api/{module}.api.ts` – REST calls
3. `src/application/hooks/use{Module}.ts` – React hooks
4. Modify relevant pages/components

**Key: Tất cả pages chuyển sang Client Components** (`'use client'`), fetch data với hooks.

### Pages cần chuyển sang Client

| Page | Current | After |
|------|---------|-------|
| `app/page.tsx` | Server Component | Client Component → `useCatalog()` |
| `app/search/page.tsx` | Server Component | Client Component → `useSearch()` |
| `app/buy/[id]/page.tsx` | Server Component | Client Component → `useProduct()` |
| `app/order/[id]/page.tsx` | Server Component | Client Component → `useOrder()` |
| `app/orders/page.tsx` | Server Component | Client Component → `useOrders()` |
| `app/profile/page.tsx` | Server Component | Client Component → `useProfile()` |
| `app/wishlist/page.tsx` | Server Component | Client Component → `useWishlist()` |
| `app/admin/**` | Server Components | Client Components → admin hooks |
| `app/paying/page.tsx` | Server Component | Client Component |
| `app/callback/[id]/page.tsx` | Server Component | Client Component |

### Files cần XÓA

```bash
# Actions (toàn bộ src/actions/ folder)
src/actions/admin.ts, admin-messages.ts, admin-orders.ts, admin-users.ts
src/actions/buy.ts, checkout.ts, data.ts, order.ts, payment.ts
src/actions/points.ts, profile.ts, refund.ts, refund-requests.ts
src/actions/registry.ts, reviews.ts, settings.ts
src/actions/update-check.ts, user-messages.ts, user-notifications.ts, wishlist.ts

# DB Layer
src/lib/db/          (index.ts, queries.ts, schema.ts, migrations/)
drizzle.config.ts

# Backend-only libs
src/lib/auth.ts      (next-auth config)
src/lib/email.ts
src/lib/notifications.ts
src/lib/order-processing.ts
src/lib/epay.ts
src/lib/card-api.ts
src/lib/crypto.ts    (backend generates signatures)
```

### Packages cần xóa khỏi package.json

```bash
drizzle-orm, drizzle-kit, better-sqlite3, @auth/core, next-auth
```

### Packages mới thêm

```bash
# Data fetching
swr hoặc @tanstack/react-query

# Auth token storage
js-cookie (lightweight cookie access)
```

---

## Deliverable 3: New Components

Dựa trên phân tích codebase, các components cần thêm:

### 3a. Shared / Foundation
| Component | Mô tả |
|-----------|-------|
| `src/components/api-error-boundary.tsx` | Error boundary wrap API calls, hiển thị user-friendly message |
| `src/components/loading-skeleton.tsx` | Skeleton placeholders cho tất cả card types |
| `src/components/infinite-scroll.tsx` | Wrapper cho pagination → infinite scroll |
| `src/components/empty-state.tsx` | Empty state với icon + message |
| `src/components/toast-provider.tsx` | Global toast notifications |

### 3b. Auth Components
| Component | Mô tả |
|-----------|-------|
| `src/components/auth-guard.tsx` | HOC redirect to login nếu not authenticated |
| `src/components/user-avatar.tsx` | Avatar + username display, reusable |
| `src/components/login-modal.tsx` | Popup login prompt (thay vì redirect) |

### 3c. Catalog Components
| Component | Mô tả |
|-----------|-------|
| `src/components/product-card.tsx` | Card sản phẩm standalone (extract từ home-content) |
| `src/components/product-grid.tsx` | Grid layout cho product cards |
| `src/components/category-filter.tsx` | Horizontal scrollable category pills |
| `src/components/search-bar.tsx` | Debounced search input |
| `src/components/stock-badge.tsx` | Badge hiển thị tồn kho (In Stock / Low Stock / OOS) |
| `src/components/price-display.tsx` | Price với compareAtPrice strikethrough |

### 3d. Checkout Components
| Component | Mô tả |
|-----------|-------|
| `src/components/quantity-selector.tsx` | +/- selector với validation |
| `src/components/points-toggle.tsx` | Toggle sử dụng điểm + hiển thị balance |
| `src/components/payment-status-poller.tsx` | Auto-poll payment status với countdown |

### 3e. Order Components
| Component | Mô tả |
|-----------|-------|
| `src/components/order-status-badge.tsx` | Color-coded status badge |
| `src/components/order-card.tsx` | Card đơn hàng trong list |
| `src/components/card-key-display.tsx` | Masked display + reveal + copy button |
| `src/components/refund-request-form.tsx` | Form yêu cầu hoàn tiền |

### 3f. Profile Components
| Component | Mô tả |
|-----------|-------|
| `src/components/points-history.tsx` | Lịch sử điểm |
| `src/components/checkin-streak.tsx` | Streak calendar / badge |
| `src/components/notification-item.tsx` | Single notification item (render i18n key + data) |

### 3g. Admin Components
| Component | Mô tả |
|-----------|-------|
| `src/components/admin/data-table.tsx` | Reusable sortable/filterable table |
| `src/components/admin/stats-card.tsx` | Revenue/order stats card |
| `src/components/admin/confirm-dialog.tsx` | Confirmation modal trước destructive action |
| `src/components/admin/order-row.tsx` | Expandable order row |

---

## Thứ tự Triển khai

```
Week 1: M0 (http-client, token-store) + M1 (Auth adapter, login flow)
Week 2: M2 (Catalog) – home page, search, product detail live
Week 3: M3 (Checkout/Payment) + M4 (Orders)
Week 4: M5 (Profile/Points) + M6 (Wishlist/Reviews)
Week 5: M7 (Notifications) + M8 (Admin)
Week 6: New Components + cleanup + verification
```

---

## Verification Plan

### Import Guard (CI)
```bash
# Không được còn import từ backend-only modules:
grep -rn "from.*@/lib/db" src/
grep -rn "from.*drizzle-orm" src/
grep -rn "from.*better-sqlite3" src/
grep -rn "from.*next-auth" src/
grep -rn "use server" src/

# Tất cả phải trả về 0 kết quả
```

### Build Check
```bash
npm run lint && npm run build
```

### Smoke Tests
- [ ] Catalog: load trang chủ, filter category, search, product detail
- [ ] Auth: login LinuxDO, session persist sau reload, logout
- [ ] Checkout: buy thường, buy bằng điểm, zero-price, out-of-stock
- [ ] Orders: xem list, xem detail + cardKey, cancel, check status
- [ ] Profile: update email, check-in, xem điểm
- [ ] Wishlist: submit, vote toggle
- [ ] Notifications: xem unread badge, mark read
- [ ] Admin: CRUD product, add cards, mark order delivered, approve refund
