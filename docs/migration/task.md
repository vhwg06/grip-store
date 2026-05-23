# Task Breakdown – 3 Deliverables

## Deliverable 1: Backend API Spec Document
- [x] Tạo `docs/api-spec.md` – full REST API spec cho backend team
  - [x] Auth endpoints (OAuth flow, JWT tokens, refresh, me)
  - [x] Catalog endpoints (products, categories, settings, search)
  - [x] Checkout endpoints (create order, retry params, status, notify webhook)
  - [x] Orders endpoints (list, detail, cancel, refund request)
  - [x] Profile endpoints (email, notifications, points, check-in)
  - [x] Wishlist + Reviews endpoints
  - [x] Notifications endpoints (direct + broadcast)
  - [x] Admin endpoints (products, cards, orders, refunds, users, settings, messages)
- [x] Tạo `docs/domain-rules.md` – business rules documentation
  - [x] Stock logic (RESERVATION_TTL, INFINITE_STOCK, shared product)
  - [x] Points logic (1:1 currency, zero-price flow, refund)
  - [x] Order status flow diagram
  - [x] Visibility level rules
  - [x] Purchase limit check logic
  - [x] Auth user ID conventions (LinuxDO numeric, GitHub `github:{id}` prefix)
- [x] Tạo `docs/db-schema.md` – extracted DB schema với column descriptions

---

## Deliverable 2: Frontend Refactor

### Phase 0 – Cleanup Setup
- [x] Xóa packages không dùng:
  ```bash
  npm uninstall drizzle-orm drizzle-kit better-sqlite3 next-auth @auth/core
  ```
- [x] Thêm packages mới:
  ```bash
  npm install swr js-cookie
  npm install -D @types/js-cookie
  ```
- [x] Tạo `.env.example` với `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Phase 1 – Base Infrastructure
- [x] **[NEW]** `src/adapters/api/token-store.ts`
  - [x] `getAccessToken()`, `setTokens()`, `clearTokens()`, `getRefreshToken()`
  - [x] Storage: memory primary, cookie fallback cho SSR hydration
- [x] **[NEW]** `src/adapters/api/http-client.ts`
  - [x] Base `apiFetch<T>(path, init)` với `NEXT_PUBLIC_API_URL` prefix
  - [x] Attach `Authorization: Bearer {token}` nếu có
  - [x] 401 → `POST /api/auth/refresh` → retry once
  - [x] Refresh fail → `clearTokens()` + redirect `/login`
  - [x] Error normalize: `{ success: false, error: string }`
- [x] **[MODIFY]** `src/app/layout.tsx`
  - [x] Xóa `SessionProvider` (next-auth)
  - [x] Thêm `AuthProvider` từ `src/application/context/AuthContext.tsx`
- [x] **[NEW]** `src/application/context/AuthContext.tsx`
  - [x] React context: `{ user, isAdmin, loading, login, logout, refresh }`
  - [x] `useEffect` → `GET /api/auth/me` on mount để hydrate state

### Phase 2 – Auth Module (M1)
- [x] **[NEW]** `src/domain/auth.ts` – User, AuthTokens, AuthSession types
- [x] **[NEW]** `src/adapters/api/auth.api.ts`
  - [x] `loginWithLinuxDO()` – redirect to backend OAuth
  - [x] `loginWithGitHub()` – redirect to backend OAuth
  - [x] `logout()` – `POST /api/auth/logout` + clearTokens
  - [x] `refreshToken()` – `POST /api/auth/refresh`
  - [x] `getMe()` – `GET /api/auth/me`
- [x] **[NEW]** `src/application/hooks/useAuth.ts`
- [x] **[MODIFY]** `src/components/signin-button.tsx` – dùng `loginWithLinuxDO()`
- [x] **[MODIFY]** `src/components/signout-button.tsx` – dùng `logout()`
- [x] **[MODIFY]** `src/app/login/page.tsx` – hiển thị login buttons, xử lý OAuth callback token
- [x] **[DELETE]** `src/app/api/auth/` – next-auth route handlers
- [x] **[DELETE]** `src/lib/auth.ts`
- [x] **[DELETE]** `src/lib/admin-auth.ts`

### Phase 3 – Catalog Module (M2)
- [x] **[NEW]** `src/domain/catalog.ts`
- [x] **[NEW]** `src/adapters/api/catalog.api.ts`
  - [x] `getActiveProducts(options?)` → `GET /api/catalog/products`
  - [x] `getProduct(id)` → `GET /api/catalog/products/:id`
  - [x] `searchProducts(q, opts)` → `GET /api/catalog/search`
  - [x] `getCategories()` → `GET /api/catalog/categories`
  - [x] `getPublicSettings()` → `GET /api/catalog/settings`
  - [x] `getAnnouncement()` → `GET /api/catalog/announcement`
- [x] **[NEW]** `src/application/hooks/useCatalog.ts`, `useProduct.ts`, `useSearch.ts`
- [x] **[MODIFY]** `src/app/page.tsx` – `'use client'` + `useCatalog()`
- [x] **[MODIFY]** `src/app/search/page.tsx` – `'use client'` + `useSearch()`
- [x] **[MODIFY]** `src/app/buy/[id]/page.tsx` – `'use client'` + `useProduct()`
- [x] **[MODIFY]** `src/components/home-content.tsx`
- [x] **[MODIFY]** `src/components/search-content.tsx`

### Phase 4 – Checkout Module (M3)
- [x] **[NEW]** `src/domain/checkout.ts`
- [x] **[NEW]** `src/adapters/api/checkout.api.ts`
  - [x] `createOrder(input)` → `POST /api/checkout/orders`
  - [x] `getRetryPaymentParams(orderId)` → `GET /api/checkout/orders/:id/payment-params`
- [x] **[NEW]** `src/application/hooks/useCheckout.ts`
- [x] **[MODIFY]** `src/components/buy-content.tsx`
- [x] **[MODIFY]** `src/components/buy-button.tsx`
- [x] **[MODIFY]** `src/components/payment-link-content.tsx`
- [x] **[MODIFY]** `src/app/paying/page.tsx` – `'use client'`
- [x] **[MODIFY]** `src/app/callback/[id]/page.tsx` – `'use client'`
- [x] **[DELETE]** `src/actions/checkout.ts`
- [x] **[DELETE]** `src/actions/buy.ts`
- [x] **[DELETE]** `src/actions/payment.ts`

### Phase 5 – Orders Module (M4)
- [x] **[NEW]** `src/domain/orders.ts`
- [x] **[NEW]** `src/adapters/api/orders.api.ts`
  - [x] `getMyOrders(page?)` → `GET /api/orders`
  - [x] `getOrder(id)` → `GET /api/orders/:id`
  - [x] `checkOrderStatus(id)` → `GET /api/orders/:id/status`
  - [x] `cancelPendingOrder(id)` → `POST /api/orders/:id/cancel`
  - [x] `submitRefundRequest(id, reason)` → `POST /api/orders/:id/refund-request`
- [x] **[NEW]** `src/application/hooks/useOrders.ts`, `useOrder.ts`
- [x] **[MODIFY]** `src/components/order-content.tsx`
- [x] **[MODIFY]** `src/components/orders-content.tsx`
- [x] **[MODIFY]** `src/app/orders/page.tsx` – `'use client'`
- [x] **[MODIFY]** `src/app/order/[id]/page.tsx` – `'use client'`
- [x] **[DELETE]** `src/actions/order.ts`
- [x] **[DELETE]** `src/actions/refund.ts`
- [x] **[DELETE]** `src/actions/refund-requests.ts`

### Phase 6 – Profile / Points Module (M5)
- [x] **[NEW]** `src/domain/profile.ts`
- [x] **[NEW]** `src/adapters/api/profile.api.ts`
  - [x] `getProfile()` → `GET /api/profile`
  - [x] `updateProfileEmail(email)` → `PATCH /api/profile/email`
  - [x] `updateDesktopNotifications(enabled)` → `PATCH /api/profile/notifications`
  - [x] `getUserPoints()` → `GET /api/profile/points`
  - [x] `checkIn()` → `POST /api/profile/checkin`
  - [x] `getCheckinStatus()` → `GET /api/profile/checkin/status`
- [x] **[NEW]** `src/application/hooks/useProfile.ts`, `usePoints.ts`, `useCheckin.ts`
- [x] **[MODIFY]** `src/components/profile-content.tsx`
- [x] **[MODIFY]** `src/components/checkin-button.tsx`
- [x] **[MODIFY]** `src/app/profile/page.tsx` – `'use client'`
- [x] **[DELETE]** `src/actions/profile.ts`
- [x] **[DELETE]** `src/actions/points.ts`

### Phase 7 – Wishlist / Reviews Module (M6)
- [x] **[NEW]** `src/domain/wishlist.ts`
- [x] **[NEW]** `src/adapters/api/wishlist.api.ts`
  - [x] `getWishlistItems(limit?)` → `GET /api/wishlist`
  - [x] `submitWishlistItem(title, desc?)` → `POST /api/wishlist`
  - [x] `toggleWishlistVote(id)` → `POST /api/wishlist/:id/vote`
  - [x] `deleteWishlistItem(id)` → `DELETE /api/wishlist/:id`
  - [x] `getProductReviews(productId)` → `GET /api/products/:id/reviews`
  - [x] `submitReview(productId, input)` → `POST /api/products/:id/reviews`
- [x] **[NEW]** `src/application/hooks/useWishlist.ts`, `useReviews.ts`
- [x] **[MODIFY]** `src/components/wishlist-section.tsx`
- [x] **[MODIFY]** `src/components/review-form.tsx`
- [x] **[MODIFY]** `src/components/review-list.tsx`
- [x] **[MODIFY]** `src/app/wishlist/page.tsx` – `'use client'`
- [x] **[DELETE]** `src/actions/wishlist.ts`
- [x] **[DELETE]** `src/actions/reviews.ts`

### Phase 8 – Notifications Module (M7)
- [x] **[NEW]** `src/domain/notifications.ts`
- [x] **[NEW]** `src/adapters/api/notifications.api.ts`
  - [x] `getMyNotifications()` → `GET /api/notifications`
  - [x] `getUnreadCount()` → `GET /api/notifications/unread-count`
  - [x] `markNotificationRead(id)` → `POST /api/notifications/:id/read`
  - [x] `markAllNotificationsRead()` → `POST /api/notifications/read-all`
  - [x] `clearMyNotifications()` → `POST /api/notifications/clear`
- [x] **[NEW]** `src/application/hooks/useNotifications.ts`
- [x] **[MODIFY]** `src/components/header-client-parts.tsx` – unread badge
- [x] **[MODIFY]** `src/components/profile-content.tsx` – notifications tab
- [x] **[DELETE]** `src/actions/user-notifications.ts`
- [x] **[DELETE]** `src/actions/user-messages.ts`

### Phase 9 – Admin Module (M8)
- [x] **[NEW]** `src/domain/admin.ts`
- [x] **[NEW]** `src/adapters/api/admin.api.ts`
  - [x] Products CRUD functions
  - [x] Cards management functions
  - [x] Orders management functions
  - [x] Refunds management functions
  - [x] Users management functions
  - [x] Settings read/write functions
  - [x] Messages functions
  - [x] Categories CRUD
  - [x] Stats, data import/repair
- [x] **[NEW]** `src/application/hooks/useAdmin.ts` (hoặc per-feature hooks)
- [x] **[MODIFY]** `src/app/admin/**` – chuyển tất cả sang `'use client'`
  - [x] `admin/products/`
  - [x] `admin/cards/`
  - [x] `admin/orders/`
  - [x] `admin/refunds/`
  - [x] `admin/users/`
  - [x] `admin/settings/`
  - [x] `admin/messages/`
  - [x] `admin/reviews/`
  - [x] `admin/categories/`
  - [x] `admin/data/`
- [x] **[DELETE]** `src/actions/admin.ts`
- [x] **[DELETE]** `src/actions/admin-orders.ts`
- [x] **[DELETE]** `src/actions/admin-users.ts`
- [x] **[DELETE]** `src/actions/admin-messages.ts`
- [x] **[DELETE]** `src/actions/settings.ts`
- [x] **[DELETE]** `src/actions/data.ts`
- [x] **[DELETE]** `src/actions/registry.ts`
- [x] **[DELETE]** `src/actions/update-check.ts`

### Phase 10 – Final Cleanup
- [x] **[DELETE]** `src/lib/db/` (toàn bộ folder)
- [x] **[DELETE]** `src/lib/email.ts`
- [x] **[DELETE]** `src/lib/notifications.ts`
- [x] **[DELETE]** `src/lib/order-processing.ts`
- [x] **[DELETE]** `src/lib/epay.ts`
- [x] **[DELETE]** `src/lib/card-api.ts`
- [x] **[DELETE]** `src/lib/crypto.ts`
- [x] **[DELETE]** `drizzle.config.ts`
- [x] **[MODIFY]** `package.json` – remove backend deps
- [x] **[MODIFY]** `next.config.ts` – remove server-only configs

---

## Deliverable 3: New Components

### Foundation Components
- [x] `src/components/api-error-boundary.tsx` – Error boundary + retry
- [x] `src/components/loading-skeleton.tsx` – Skeleton variants (card, list-item, full-page)
- [x] `src/components/empty-state.tsx` – Icon + message + optional CTA
- [x] `src/components/toast-provider.tsx` – Global toast system

### Auth Components
- [x] `src/components/auth-guard.tsx` – HOC/wrapper requiring auth
- [x] `src/components/user-avatar.tsx` – Avatar image + username
- [x] `src/components/login-modal.tsx` – Login prompt popup

### Catalog Components
- [x] `src/components/product-card.tsx` – Standalone product card (extract từ home-content)
- [x] `src/components/product-grid.tsx` – Responsive grid
- [x] `src/components/category-filter.tsx` – Horizontal scroll category pills
- [x] `src/components/search-bar.tsx` – Debounced search
- [x] `src/components/stock-badge.tsx` – In Stock / Low / OOS badge
- [x] `src/components/price-display.tsx` – Price + compareAtPrice

### Checkout Components
- [x] `src/components/quantity-selector.tsx` – +/- với validation
- [x] `src/components/points-toggle.tsx` – Toggle + balance display
- [x] `src/components/payment-status-poller.tsx` – Auto-poll với countdown UI

### Order Components
- [x] `src/components/order-status-badge.tsx` – Color-coded badge
- [x] `src/components/order-card.tsx` – Order list item
- [x] `src/components/card-key-display.tsx` – Masked + reveal + copy
- [x] `src/components/refund-request-form.tsx` – Refund form modal

### Profile Components
- [x] `src/components/checkin-streak.tsx` – Streak visual
- [x] `src/components/notification-item.tsx` – Render i18n notification

### Admin Components
- [x] `src/components/admin/data-table.tsx` – Reusable table với sort/filter/pagination
- [x] `src/components/admin/stats-card.tsx` – Revenue/orders card
- [x] `src/components/admin/confirm-dialog.tsx` – Confirm modal
- [x] `src/components/admin/order-row.tsx` – Expandable order row

---

## Final Verification
- [x] `grep -rn "use server" src/` → 0 kết quả
- [x] `grep -rn "from.*@/lib/db" src/` → 0 kết quả
- [x] `grep -rn "from.*drizzle-orm" src/` → 0 kết quả
- [x] `grep -rn "from.*next-auth" src/` → 0 kết quả
- [x] `npm run lint` → pass
- [x] `npm run build` → pass (build static client bundle)
- [ ] Smoke test tất cả user flows
