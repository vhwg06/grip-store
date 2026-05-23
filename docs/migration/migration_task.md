# Task Breakdown – 3 Deliverables

## Deliverable 1: Backend API Spec Document
- [ ] Tạo `docs/api-spec.md` – full REST API spec cho backend team
  - [ ] Auth endpoints (OAuth flow, JWT tokens, refresh, me)
  - [ ] Catalog endpoints (products, categories, settings, search)
  - [ ] Checkout endpoints (create order, retry params, status, notify webhook)
  - [ ] Orders endpoints (list, detail, cancel, refund request)
  - [ ] Profile endpoints (email, notifications, points, check-in)
  - [ ] Wishlist + Reviews endpoints
  - [ ] Notifications endpoints (direct + broadcast)
  - [ ] Admin endpoints (products, cards, orders, refunds, users, settings, messages)
- [ ] Tạo `docs/domain-rules.md` – business rules documentation
  - [ ] Stock logic (RESERVATION_TTL, INFINITE_STOCK, shared product)
  - [ ] Points logic (1:1 currency, zero-price flow, refund)
  - [ ] Order status flow diagram
  - [ ] Visibility level rules
  - [ ] Purchase limit check logic
  - [ ] Auth user ID conventions (LinuxDO numeric, GitHub `github:{id}` prefix)
- [ ] Tạo `docs/db-schema.md` – extracted DB schema với column descriptions

---

## Deliverable 2: Frontend Refactor

### Phase 0 – Cleanup Setup
- [ ] Xóa packages không dùng:
  ```bash
  npm uninstall drizzle-orm drizzle-kit better-sqlite3 next-auth @auth/core
  ```
- [ ] Thêm packages mới:
  ```bash
  npm install swr js-cookie
  npm install -D @types/js-cookie
  ```
- [ ] Tạo `.env.example` với `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Phase 1 – Base Infrastructure
- [ ] **[NEW]** `src/adapters/api/token-store.ts`
  - [ ] `getAccessToken()`, `setTokens()`, `clearTokens()`, `getRefreshToken()`
  - [ ] Storage: memory primary, cookie fallback cho SSR hydration
- [ ] **[NEW]** `src/adapters/api/http-client.ts`
  - [ ] Base `apiFetch<T>(path, init)` với `NEXT_PUBLIC_API_URL` prefix
  - [ ] Attach `Authorization: Bearer {token}` nếu có
  - [ ] 401 → `POST /api/auth/refresh` → retry once
  - [ ] Refresh fail → `clearTokens()` + redirect `/login`
  - [ ] Error normalize: `{ success: false, error: string }`
- [ ] **[MODIFY]** `src/app/layout.tsx`
  - [ ] Xóa `SessionProvider` (next-auth)
  - [ ] Thêm `AuthProvider` từ `src/application/context/AuthContext.tsx`
- [ ] **[NEW]** `src/application/context/AuthContext.tsx`
  - [ ] React context: `{ user, isAdmin, loading, login, logout, refresh }`
  - [ ] `useEffect` → `GET /api/auth/me` on mount để hydrate state

### Phase 2 – Auth Module (M1)
- [ ] **[NEW]** `src/domain/auth.ts` – User, AuthTokens, AuthSession types
- [ ] **[NEW]** `src/adapters/api/auth.api.ts`
  - [ ] `loginWithLinuxDO()` – redirect to backend OAuth
  - [ ] `loginWithGitHub()` – redirect to backend OAuth
  - [ ] `logout()` – `POST /api/auth/logout` + clearTokens
  - [ ] `refreshToken()` – `POST /api/auth/refresh`
  - [ ] `getMe()` – `GET /api/auth/me`
- [ ] **[NEW]** `src/application/hooks/useAuth.ts`
- [ ] **[MODIFY]** `src/components/signin-button.tsx` – dùng `loginWithLinuxDO()`
- [ ] **[MODIFY]** `src/components/signout-button.tsx` – dùng `logout()`
- [ ] **[MODIFY]** `src/app/login/page.tsx` – hiển thị login buttons, xử lý OAuth callback token
- [ ] **[DELETE]** `src/app/api/auth/` – next-auth route handlers
- [ ] **[DELETE]** `src/lib/auth.ts`
- [ ] **[DELETE]** `src/lib/admin-auth.ts`

### Phase 3 – Catalog Module (M2)
- [ ] **[NEW]** `src/domain/catalog.ts`
- [ ] **[NEW]** `src/adapters/api/catalog.api.ts`
  - [ ] `getActiveProducts(options?)` → `GET /api/catalog/products`
  - [ ] `getProduct(id)` → `GET /api/catalog/products/:id`
  - [ ] `searchProducts(q, opts)` → `GET /api/catalog/search`
  - [ ] `getCategories()` → `GET /api/catalog/categories`
  - [ ] `getPublicSettings()` → `GET /api/catalog/settings`
  - [ ] `getAnnouncement()` → `GET /api/catalog/announcement`
- [ ] **[NEW]** `src/application/hooks/useCatalog.ts`, `useProduct.ts`, `useSearch.ts`
- [ ] **[MODIFY]** `src/app/page.tsx` – `'use client'` + `useCatalog()`
- [ ] **[MODIFY]** `src/app/search/page.tsx` – `'use client'` + `useSearch()`
- [ ] **[MODIFY]** `src/app/buy/[id]/page.tsx` – `'use client'` + `useProduct()`
- [ ] **[MODIFY]** `src/components/home-content.tsx`
- [ ] **[MODIFY]** `src/components/search-content.tsx`

### Phase 4 – Checkout Module (M3)
- [ ] **[NEW]** `src/domain/checkout.ts`
- [ ] **[NEW]** `src/adapters/api/checkout.api.ts`
  - [ ] `createOrder(input)` → `POST /api/checkout/orders`
  - [ ] `getRetryPaymentParams(orderId)` → `GET /api/checkout/orders/:id/payment-params`
- [ ] **[NEW]** `src/application/hooks/useCheckout.ts`
- [ ] **[MODIFY]** `src/components/buy-content.tsx`
- [ ] **[MODIFY]** `src/components/buy-button.tsx`
- [ ] **[MODIFY]** `src/components/payment-link-content.tsx`
- [ ] **[MODIFY]** `src/app/paying/page.tsx` – `'use client'`
- [ ] **[MODIFY]** `src/app/callback/[id]/page.tsx` – `'use client'`
- [ ] **[DELETE]** `src/actions/checkout.ts`
- [ ] **[DELETE]** `src/actions/buy.ts`
- [ ] **[DELETE]** `src/actions/payment.ts`

### Phase 5 – Orders Module (M4)
- [ ] **[NEW]** `src/domain/orders.ts`
- [ ] **[NEW]** `src/adapters/api/orders.api.ts`
  - [ ] `getMyOrders(page?)` → `GET /api/orders`
  - [ ] `getOrder(id)` → `GET /api/orders/:id`
  - [ ] `checkOrderStatus(id)` → `GET /api/orders/:id/status`
  - [ ] `cancelPendingOrder(id)` → `POST /api/orders/:id/cancel`
  - [ ] `submitRefundRequest(id, reason)` → `POST /api/orders/:id/refund-request`
- [ ] **[NEW]** `src/application/hooks/useOrders.ts`, `useOrder.ts`
- [ ] **[MODIFY]** `src/components/order-content.tsx`
- [ ] **[MODIFY]** `src/components/orders-content.tsx`
- [ ] **[MODIFY]** `src/app/orders/page.tsx` – `'use client'`
- [ ] **[MODIFY]** `src/app/order/[id]/page.tsx` – `'use client'`
- [ ] **[DELETE]** `src/actions/order.ts`
- [ ] **[DELETE]** `src/actions/refund.ts`
- [ ] **[DELETE]** `src/actions/refund-requests.ts`

### Phase 6 – Profile / Points Module (M5)
- [ ] **[NEW]** `src/domain/profile.ts`
- [ ] **[NEW]** `src/adapters/api/profile.api.ts`
  - [ ] `getProfile()` → `GET /api/profile`
  - [ ] `updateProfileEmail(email)` → `PATCH /api/profile/email`
  - [ ] `updateDesktopNotifications(enabled)` → `PATCH /api/profile/notifications`
  - [ ] `getUserPoints()` → `GET /api/profile/points`
  - [ ] `checkIn()` → `POST /api/profile/checkin`
  - [ ] `getCheckinStatus()` → `GET /api/profile/checkin/status`
- [ ] **[NEW]** `src/application/hooks/useProfile.ts`, `usePoints.ts`, `useCheckin.ts`
- [ ] **[MODIFY]** `src/components/profile-content.tsx`
- [ ] **[MODIFY]** `src/components/checkin-button.tsx`
- [ ] **[MODIFY]** `src/app/profile/page.tsx` – `'use client'`
- [ ] **[DELETE]** `src/actions/profile.ts`
- [ ] **[DELETE]** `src/actions/points.ts`

### Phase 7 – Wishlist / Reviews Module (M6)
- [ ] **[NEW]** `src/domain/wishlist.ts`
- [ ] **[NEW]** `src/adapters/api/wishlist.api.ts`
  - [ ] `getWishlistItems(limit?)` → `GET /api/wishlist`
  - [ ] `submitWishlistItem(title, desc?)` → `POST /api/wishlist`
  - [ ] `toggleWishlistVote(id)` → `POST /api/wishlist/:id/vote`
  - [ ] `deleteWishlistItem(id)` → `DELETE /api/wishlist/:id`
  - [ ] `getProductReviews(productId)` → `GET /api/products/:id/reviews`
  - [ ] `submitReview(productId, input)` → `POST /api/products/:id/reviews`
- [ ] **[NEW]** `src/application/hooks/useWishlist.ts`, `useReviews.ts`
- [ ] **[MODIFY]** `src/components/wishlist-section.tsx`
- [ ] **[MODIFY]** `src/components/review-form.tsx`
- [ ] **[MODIFY]** `src/components/review-list.tsx`
- [ ] **[MODIFY]** `src/app/wishlist/page.tsx` – `'use client'`
- [ ] **[DELETE]** `src/actions/wishlist.ts`
- [ ] **[DELETE]** `src/actions/reviews.ts`

### Phase 8 – Notifications Module (M7)
- [ ] **[NEW]** `src/domain/notifications.ts`
- [ ] **[NEW]** `src/adapters/api/notifications.api.ts`
  - [ ] `getMyNotifications()` → `GET /api/notifications`
  - [ ] `getUnreadCount()` → `GET /api/notifications/unread-count`
  - [ ] `markNotificationRead(id)` → `POST /api/notifications/:id/read`
  - [ ] `markAllNotificationsRead()` → `POST /api/notifications/read-all`
  - [ ] `clearMyNotifications()` → `POST /api/notifications/clear`
- [ ] **[NEW]** `src/application/hooks/useNotifications.ts`
- [ ] **[MODIFY]** `src/components/header-client-parts.tsx` – unread badge
- [ ] **[MODIFY]** `src/components/profile-content.tsx` – notifications tab
- [ ] **[DELETE]** `src/actions/user-notifications.ts`
- [ ] **[DELETE]** `src/actions/user-messages.ts`

### Phase 9 – Admin Module (M8)
- [ ] **[NEW]** `src/domain/admin.ts`
- [ ] **[NEW]** `src/adapters/api/admin.api.ts`
  - [ ] Products CRUD functions
  - [ ] Cards management functions
  - [ ] Orders management functions
  - [ ] Refunds management functions
  - [ ] Users management functions
  - [ ] Settings read/write functions
  - [ ] Messages functions
  - [ ] Categories CRUD
  - [ ] Stats, data import/repair
- [ ] **[NEW]** `src/application/hooks/useAdmin.ts` (hoặc per-feature hooks)
- [ ] **[MODIFY]** `src/app/admin/**` – chuyển tất cả sang `'use client'`
  - [ ] `admin/products/`
  - [ ] `admin/cards/`
  - [ ] `admin/orders/`
  - [ ] `admin/refunds/`
  - [ ] `admin/users/`
  - [ ] `admin/settings/`
  - [ ] `admin/messages/`
  - [ ] `admin/reviews/`
  - [ ] `admin/categories/`
  - [ ] `admin/data/`
- [ ] **[DELETE]** `src/actions/admin.ts`
- [ ] **[DELETE]** `src/actions/admin-orders.ts`
- [ ] **[DELETE]** `src/actions/admin-users.ts`
- [ ] **[DELETE]** `src/actions/admin-messages.ts`
- [ ] **[DELETE]** `src/actions/settings.ts`
- [ ] **[DELETE]** `src/actions/data.ts`
- [ ] **[DELETE]** `src/actions/registry.ts`
- [ ] **[DELETE]** `src/actions/update-check.ts`

### Phase 10 – Final Cleanup
- [ ] **[DELETE]** `src/lib/db/` (toàn bộ folder)
- [ ] **[DELETE]** `src/lib/email.ts`
- [ ] **[DELETE]** `src/lib/notifications.ts`
- [ ] **[DELETE]** `src/lib/order-processing.ts`
- [ ] **[DELETE]** `src/lib/epay.ts`
- [ ] **[DELETE]** `src/lib/card-api.ts`
- [ ] **[DELETE]** `src/lib/crypto.ts`
- [ ] **[DELETE]** `drizzle.config.ts`
- [ ] **[MODIFY]** `package.json` – remove backend deps
- [ ] **[MODIFY]** `next.config.ts` – remove server-only configs

---

## Deliverable 3: New Components

### Foundation Components
- [ ] `src/components/api-error-boundary.tsx` – Error boundary + retry
- [ ] `src/components/loading-skeleton.tsx` – Skeleton variants (card, list-item, full-page)
- [ ] `src/components/empty-state.tsx` – Icon + message + optional CTA
- [ ] `src/components/toast-provider.tsx` – Global toast system

### Auth Components
- [ ] `src/components/auth-guard.tsx` – HOC/wrapper requiring auth
- [ ] `src/components/user-avatar.tsx` – Avatar image + username
- [ ] `src/components/login-modal.tsx` – Login prompt popup

### Catalog Components
- [ ] `src/components/product-card.tsx` – Standalone product card (extract từ home-content)
- [ ] `src/components/product-grid.tsx` – Responsive grid
- [ ] `src/components/category-filter.tsx` – Horizontal scroll category pills
- [ ] `src/components/search-bar.tsx` – Debounced search
- [ ] `src/components/stock-badge.tsx` – In Stock / Low / OOS badge
- [ ] `src/components/price-display.tsx` – Price + compareAtPrice

### Checkout Components
- [ ] `src/components/quantity-selector.tsx` – +/- với validation
- [ ] `src/components/points-toggle.tsx` – Toggle + balance display
- [ ] `src/components/payment-status-poller.tsx` – Auto-poll với countdown UI

### Order Components
- [ ] `src/components/order-status-badge.tsx` – Color-coded badge
- [ ] `src/components/order-card.tsx` – Order list item
- [ ] `src/components/card-key-display.tsx` – Masked + reveal + copy
- [ ] `src/components/refund-request-form.tsx` – Refund form modal

### Profile Components
- [ ] `src/components/checkin-streak.tsx` – Streak visual
- [ ] `src/components/notification-item.tsx` – Render i18n notification

### Admin Components
- [ ] `src/components/admin/data-table.tsx` – Reusable table với sort/filter/pagination
- [ ] `src/components/admin/stats-card.tsx` – Revenue/orders card
- [ ] `src/components/admin/confirm-dialog.tsx` – Confirm modal
- [ ] `src/components/admin/order-row.tsx` – Expandable order row

---

## Final Verification
- [ ] `grep -rn "use server" src/` → 0 kết quả
- [ ] `grep -rn "from.*@/lib/db" src/` → 0 kết quả
- [ ] `grep -rn "from.*drizzle-orm" src/` → 0 kết quả
- [ ] `grep -rn "from.*next-auth" src/` → 0 kết quả
- [ ] `npm run lint` → pass
- [ ] `npm run build` → pass (build static client bundle)
- [ ] Smoke test tất cả user flows
