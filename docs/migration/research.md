# MIGRATION_CONTEXT
# Format: Machine-readable context for Codex CLI execution
# Project: grip-store
# Migration: Full-stack Next.js monolith → Pure Client App + Separate REST Backend
# Generated: 2026-05-23
# Source files researched: src/actions/* (20 files), src/lib/db/schema.ts, src/lib/db/queries.ts (2378 lines), src/lib/auth.ts, src/lib/constants.ts, src/lib/notifications.ts, src/lib/order-processing.ts, src/lib/epay.ts, src/lib/card-api.ts, src/lib/email.ts, src/actions/settings.ts, src/actions/registry.ts, src/actions/update-check.ts

---

## ::META

```yaml
migration_id: grip-store-rest-migration-v1
migration_type: frontend_client_only
status: planned
deliverables:
  - id: D1
    name: backend_api_spec
    description: REST API specification document extracted from current domain logic
  - id: D2
    name: frontend_refactor
    description: Remove all server actions, replace with REST adapter layer
  - D3:
    name: new_components
    description: Add 25+ new UI components
```

---

## ::ARCHITECTURE_CHANGE

### FROM (current state)
```yaml
type: nextjs_fullstack_monolith
render_mode: server_components + server_actions
data_layer: drizzle_orm + better_sqlite3 / cloudflare_d1
auth: next-auth (OAuth LinuxDO + GitHub)
db_access: direct from frontend via @/lib/db
backend_libs_in_frontend:
  - drizzle-orm
  - better-sqlite3
  - next-auth
  - @/lib/db (queries.ts 90766 bytes, schema.ts 10173 bytes)
  - @/lib/notifications.ts (12361 bytes)
  - @/lib/order-processing.ts (15346 bytes)
  - @/lib/email.ts (9546 bytes)
  - @/lib/epay.ts (2374 bytes)
  - @/lib/card-api.ts (4848 bytes)
  - @/lib/crypto.ts (716 bytes)
```

### TO (target state)
```yaml
type: nextjs_pure_client_app
render_mode: client_components_only
data_layer: REST API via fetch + swr
auth: JWT Bearer (issued by backend, stored in memory+cookie)
db_access: none (backend handles all DB)
new_frontend_packages:
  - swr
  - js-cookie
removed_packages:
  - drizzle-orm
  - drizzle-kit
  - better-sqlite3
  - next-auth
  - "@auth/core"
```

---

## ::FOLDER_STRUCTURE_NEW

```
src/
├── domain/                          # Pure TS types, no runtime deps
│   ├── auth.ts
│   ├── catalog.ts
│   ├── checkout.ts
│   ├── orders.ts
│   ├── profile.ts
│   ├── wishlist.ts
│   ├── notifications.ts
│   └── admin.ts
├── application/
│   ├── context/
│   │   └── AuthContext.tsx          # React context: user, isAdmin, loading
│   ├── ports/                       # TypeScript interfaces (contracts)
│   │   ├── IAuthPort.ts
│   │   ├── ICatalogPort.ts
│   │   ├── ICheckoutPort.ts
│   │   ├── IOrdersPort.ts
│   │   ├── IProfilePort.ts
│   │   ├── IWishlistPort.ts
│   │   ├── INotificationsPort.ts
│   │   └── IAdminPort.ts
│   └── hooks/                       # React hooks wrapping adapters
│       ├── useAuth.ts
│       ├── useCatalog.ts
│       ├── useProduct.ts
│       ├── useSearch.ts
│       ├── useCheckout.ts
│       ├── useOrders.ts
│       ├── useOrder.ts
│       ├── useProfile.ts
│       ├── usePoints.ts
│       ├── useCheckin.ts
│       ├── useWishlist.ts
│       ├── useReviews.ts
│       ├── useNotifications.ts
│       └── useAdmin.ts
└── adapters/
    └── api/
        ├── http-client.ts           # Base fetch, Bearer, 401 refresh retry
        ├── token-store.ts           # Token storage (memory + cookie)
        ├── auth.api.ts
        ├── catalog.api.ts
        ├── checkout.api.ts
        ├── orders.api.ts
        ├── profile.api.ts
        ├── wishlist.api.ts
        ├── notifications.api.ts
        └── admin.api.ts
```

---

## ::FILES_TO_DELETE

```yaml
# Server Actions - entire folder
delete:
  - src/actions/admin.ts             # 25416 bytes, 790 lines
  - src/actions/admin-messages.ts    # 6230 bytes, 192 lines
  - src/actions/admin-orders.ts      # 8747 bytes, 275 lines
  - src/actions/admin-users.ts       # 646 bytes, 20 lines
  - src/actions/buy.ts               # 2683 bytes
  - src/actions/checkout.ts          # 23443 bytes, 569 lines
  - src/actions/data.ts              # 7686 bytes, 201 lines
  - src/actions/order.ts             # 4264 bytes, 118 lines
  - src/actions/payment.ts           # 2742 bytes
  - src/actions/points.ts            # 3857 bytes, 114 lines
  - src/actions/profile.ts           # 1128 bytes, 39 lines
  - src/actions/refund.ts            # 4681 bytes, 143 lines
  - src/actions/refund-requests.ts   # 6219 bytes, 204 lines
  - src/actions/registry.ts          # 4718 bytes, 153 lines
  - src/actions/reviews.ts           # 3206 bytes, 102 lines
  - src/actions/settings.ts          # 2703 bytes, 84 lines
  - src/actions/update-check.ts      # 3521 bytes, 109 lines
  - src/actions/user-messages.ts     # 3318 bytes, 108 lines
  - src/actions/user-notifications.ts # 8849 bytes, 249 lines
  - src/actions/wishlist.ts          # 5702 bytes, 179 lines

# DB Layer
  - src/lib/db/index.ts
  - src/lib/db/queries.ts            # 90766 bytes, 2378 lines - entire domain logic
  - src/lib/db/schema.ts             # 10173 bytes, 202 lines - entity definitions
  - src/lib/db/migrations/           # entire directory

# Backend-only libs
  - src/lib/auth.ts                  # 18649 bytes, 432 lines - next-auth config
  - src/lib/admin-auth.ts            # 386 bytes
  - src/lib/email.ts                 # 9546 bytes
  - src/lib/notifications.ts         # 12361 bytes
  - src/lib/order-processing.ts      # 15346 bytes
  - src/lib/epay.ts                  # 2374 bytes
  - src/lib/card-api.ts              # 4848 bytes
  - src/lib/crypto.ts                # 716 bytes

# Next-auth route handlers
  - src/app/api/auth/                # entire directory

# Root config files
  - drizzle.config.ts
```

---

## ::FILES_TO_MODIFY

```yaml
modify:
  - path: src/app/layout.tsx
    changes:
      - remove: import SessionProvider from next-auth/react
      - remove: <SessionProvider> wrapper
      - add: import AuthProvider from src/application/context/AuthContext
      - add: <AuthProvider> wrapper
      - remove: next/cache imports

  - path: src/app/page.tsx
    changes:
      - add: 'use client' directive
      - remove: direct imports from @/lib/db/queries
      - remove: async server component data fetching
      - add: import { useCatalog } from src/application/hooks/useCatalog

  - path: src/app/search/page.tsx
    changes:
      - add: 'use client'
      - add: import { useSearch } from src/application/hooks/useSearch

  - path: src/app/buy/[id]/page.tsx
    changes:
      - add: 'use client'
      - add: import { useProduct } from src/application/hooks/useProduct

  - path: src/app/order/[id]/page.tsx
    changes:
      - add: 'use client'
      - add: import { useOrder } from src/application/hooks/useOrder

  - path: src/app/orders/page.tsx
    changes:
      - add: 'use client'
      - add: import { useOrders } from src/application/hooks/useOrders

  - path: src/app/profile/page.tsx
    changes:
      - add: 'use client'
      - add: import { useProfile } from src/application/hooks/useProfile

  - path: src/app/wishlist/page.tsx
    changes:
      - add: 'use client'
      - add: import { useWishlist } from src/application/hooks/useWishlist

  - path: src/app/login/page.tsx
    changes:
      - rewrite: show OAuth login buttons, handle token from URL params on callback
      - add: loginWithLinuxDO(), loginWithGitHub() from auth.api.ts
      - add: read access_token from URL query param after backend OAuth callback

  - path: src/app/paying/page.tsx
    changes:
      - add: 'use client'
      - remove: server-side payment logic

  - path: src/app/callback/[id]/page.tsx
    changes:
      - add: 'use client'

  - path: src/app/admin/layout.tsx
    changes:
      - add: 'use client'
      - add: auth guard check via useAuth().isAdmin

  - path: src/components/signin-button.tsx
    changes:
      - remove: import { signIn } from next-auth/react
      - add: import { loginWithLinuxDO } from src/adapters/api/auth.api

  - path: src/components/signout-button.tsx
    changes:
      - remove: import { signOut } from next-auth/react
      - add: import { logout } from src/adapters/api/auth.api

  - path: src/components/buy-content.tsx
    changes:
      - remove: import createOrder from @/actions/checkout
      - add: import { createOrder } from src/adapters/api/checkout.api
      - remove: useSession() from next-auth
      - add: useAuth() from src/application/hooks/useAuth

  - path: src/components/buy-button.tsx
    changes:
      - swap: action imports → checkout.api

  - path: src/components/checkin-button.tsx
    changes:
      - remove: import { checkIn, getCheckinStatus } from @/actions/points
      - add: import { checkIn, getCheckinStatus } from src/adapters/api/profile.api

  - path: src/components/header-client-parts.tsx
    changes:
      - remove: server action unread count
      - add: useNotifications() hook with polling

  - path: src/components/profile-content.tsx
    changes:
      - swap: all action imports → profile.api + notifications.api

  - path: src/components/order-content.tsx
    changes:
      - swap: action imports → orders.api

  - path: src/components/orders-content.tsx
    changes:
      - swap: action imports → orders.api

  - path: src/components/wishlist-section.tsx
    changes:
      - swap: action imports → wishlist.api

  - path: src/components/review-form.tsx
    changes:
      - swap: action imports → wishlist.api

  - path: src/components/review-list.tsx
    changes:
      - swap: queries imports → catalog.api

  - path: src/components/home-content.tsx
    changes:
      - swap: queries imports → catalog.api

  - path: src/components/search-content.tsx
    changes:
      - swap: queries imports → catalog.api

  - path: src/components/payment-link-content.tsx
    changes:
      - swap: action imports → checkout.api

  - path: package.json
    changes:
      - remove: drizzle-orm, drizzle-kit, better-sqlite3, next-auth, "@auth/core"
      - add: swr, js-cookie, "@types/js-cookie" (devDependency)

  - path: next.config.ts
    changes:
      - remove: serverExternalPackages (better-sqlite3)
      - remove: any server-only config
      - add: NEXT_PUBLIC_API_URL env exposure

  - path: .env.example
    changes:
      - add: NEXT_PUBLIC_API_URL=http://localhost:4000
      - remove: DATABASE_URL, NEXTAUTH_SECRET, etc. (backend concerns)
```

---

## ::FILES_TO_CREATE

```yaml
create:
  # Infrastructure
  - path: src/adapters/api/token-store.ts
    purpose: JWT token storage, in-memory primary, cookie fallback
    exports:
      - getAccessToken(): string | null
      - getRefreshToken(): string | null
      - setTokens(access, refresh, expiresIn): void
      - clearTokens(): void

  - path: src/adapters/api/http-client.ts
    purpose: Base fetch wrapper with Bearer auth + 401 refresh retry
    exports:
      - apiFetch<T>(path, init?): Promise<T>
    behavior:
      - prefix: process.env.NEXT_PUBLIC_API_URL
      - attach: Authorization Bearer header if token exists
      - on_401: POST /api/auth/refresh → retry request once → clearTokens + redirect /login

  - path: src/application/context/AuthContext.tsx
    purpose: Global React context for auth state
    exports:
      - AuthProvider: React.FC
      - useAuthContext(): { user, isAdmin, loading, login, logout, refresh }
    behavior:
      - on_mount: GET /api/auth/me to hydrate user state
      - on_oauth_callback: read token from URL, call setTokens

  # Domain Types
  - path: src/domain/auth.ts
    types:
      User:
        id: string
        username: string
        email: string | null
        avatarUrl: string | null
        trustLevel: number
        isAdmin: boolean
        points: number
        desktopNotificationsEnabled: boolean
      AuthTokens:
        accessToken: string
        refreshToken: string
        expiresAt: number
      AuthSession:
        user: User
        tokens: AuthTokens

  - path: src/domain/catalog.ts
    types:
      Product:
        id: string
        name: string
        description: string | null
        price: string
        compareAtPrice: string | null
        image: string | null
        category: string | null
        isHot: boolean
        isShared: boolean
        purchaseLimit: number | null
        purchaseWarning: string | null
        visibilityLevel: number
        stock: number          # -1 = INFINITE (999999)
        sold: number
        rating: number
        reviewCount: number
      Category:
        id: number
        name: string
        icon: string | null
        sortOrder: number
      PublicSettings:
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
      Announcement:
        content: string
        startAt: string | null
        endAt: string | null

  - path: src/domain/checkout.ts
    types:
      CreateOrderInput:
        productId: string
        quantity: number
        email?: string
        usePoints?: boolean
      CheckoutResultSuccess:
        success: true
        url: string
        params?: Record<string, any>
        isZeroPrice?: boolean
      CheckoutResultError:
        success: false
        error: "'buy.outOfStock' | 'buy.invalidQuantity' | 'buy.limitExceeded' | 'buy.userBlocked' | 'buy.productNotFound' | 'buy.stockLocked' | 'buy.quantityTooLarge'"

  - path: src/domain/orders.ts
    types:
      OrderStatus: "'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded' | 'failed'"
      Order:
        orderId: string
        productId: string
        productName: string
        amount: string
        email: string | null
        status: OrderStatus
        cardKey: string | null
        quantity: number
        pointsUsed: number
        paidAt: number | null
        deliveredAt: number | null
        createdAt: number
        canRefund: boolean
        canCancel: boolean
        refundRequest: "{ status: string, reason: string | null } | null"

  - path: src/domain/profile.ts
    types:
      UserProfile:
        id: string
        username: string
        email: string | null
        points: number
        desktopNotificationsEnabled: boolean
        lastCheckinAt: number | null
        consecutiveDays: number
      CheckinStatus:
        checkedIn: boolean
        disabled?: boolean
      CheckinResult:
        success: boolean
        points?: number
        consecutiveDays?: number
        error?: string

  - path: src/domain/wishlist.ts
    types:
      WishlistItem:
        id: number
        title: string
        description: string | null
        username: string | null
        createdAt: number
        votes: number
        voted: boolean
      Review:
        id: number
        productId: string
        orderId: string
        userId: string
        username: string
        rating: number
        comment: string | null
        createdAt: number
      SubmitReviewInput:
        orderId: string
        rating: number
        comment?: string

  - path: src/domain/notifications.ts
    types:
      NotificationType: "'order_delivered' | 'refund_approved' | 'refund_rejected' | 'admin_message' | 'broadcast'"
      Notification:
        id: number
        type: NotificationType
        titleKey: string
        contentKey: string
        data: string | null
        isRead: boolean
        createdAt: number
      NotificationData:
        params?: Record<string, string>
        href?: string
        title?: string
        body?: string

  - path: src/domain/admin.ts
    types:
      AdminProduct: "Product & { isActive: boolean; sortOrder: number }"
      AdminOrder: "Order & { tradeNo: string | null; userId: string | null; username: string | null; payee: string | null; cardIds: string | null }"
      AdminUser:
        userId: string
        username: string | null
        email: string | null
        points: number
        isBlocked: boolean
        createdAt: number
        lastLoginAt: number
      RefundRequest:
        id: number
        orderId: string
        userId: string | null
        username: string | null
        reason: string | null
        status: "'pending' | 'approved' | 'rejected' | 'processed'"
        adminNote: string | null
        createdAt: number
      AdminMessage:
        id: number
        targetType: "'all' | 'username' | 'userId'"
        targetValue: string | null
        title: string
        body: string
        sender: string | null
        createdAt: number
      DashboardStats:
        today: "{ count: number, revenue: number }"
        week: "{ count: number, revenue: number }"
        month: "{ count: number, revenue: number }"
        total: "{ count: number, revenue: number }"
      CardApiConfig:
        enabled: boolean
        url: string
        token: string

  # API Adapters
  - path: src/adapters/api/auth.api.ts
    functions:
      loginWithLinuxDO: "() => void (window.location redirect to NEXT_PUBLIC_API_URL/api/auth/oauth/linuxdo)"
      loginWithGitHub: "() => void (window.location redirect)"
      logout: "() => Promise<void> (POST /api/auth/logout + clearTokens)"
      refreshToken: "() => Promise<AuthTokens | null>"
      getMe: "() => Promise<User | null>"

  - path: src/adapters/api/catalog.api.ts
    functions:
      getActiveProducts: "(options?: {category?, page?, limit?}) => Promise<Product[]>"
      getProduct: "(id: string) => Promise<Product | null>"
      searchProducts: "(q: string, opts?: {category?, page?}) => Promise<Product[]>"
      getCategories: "() => Promise<Category[]>"
      getPublicSettings: "() => Promise<PublicSettings>"
      getAnnouncement: "() => Promise<string | null>"

  - path: src/adapters/api/checkout.api.ts
    functions:
      createOrder: "(input: CreateOrderInput) => Promise<CheckoutResultSuccess | CheckoutResultError>"
      getRetryPaymentParams: "(orderId: string) => Promise<CheckoutResultSuccess | CheckoutResultError>"
      checkOrderStatus: "(orderId: string) => Promise<{success: boolean, status?: string}>"

  - path: src/adapters/api/orders.api.ts
    functions:
      getMyOrders: "(page?: number) => Promise<Order[]>"
      getOrder: "(id: string) => Promise<Order | null>"
      checkOrderStatus: "(id: string) => Promise<{success: boolean, status?: string}>"
      cancelPendingOrder: "(id: string) => Promise<{success: boolean, error?: string}>"
      submitRefundRequest: "(id: string, reason: string) => Promise<{ok: boolean}>"

  - path: src/adapters/api/profile.api.ts
    functions:
      getProfile: "() => Promise<UserProfile>"
      updateProfileEmail: "(email: string) => Promise<{success: boolean, error?: string}>"
      updateDesktopNotifications: "(enabled: boolean) => Promise<{success: boolean, error?: string}>"
      getUserPoints: "() => Promise<number>"
      checkIn: "() => Promise<CheckinResult>"
      getCheckinStatus: "() => Promise<CheckinStatus>"

  - path: src/adapters/api/wishlist.api.ts
    functions:
      getWishlistItems: "(limit?: number) => Promise<WishlistItem[]>"
      submitWishlistItem: "(title: string, description?: string) => Promise<{success: boolean, item?: WishlistItem, error?: string}>"
      toggleWishlistVote: "(itemId: number) => Promise<{success: boolean, voted?: boolean, count?: number, error?: string}>"
      deleteWishlistItem: "(id: number) => Promise<{success: boolean}>"
      getProductReviews: "(productId: string, page?: number) => Promise<Review[]>"
      submitReview: "(productId: string, input: SubmitReviewInput) => Promise<{success: boolean, error?: string}>"

  - path: src/adapters/api/notifications.api.ts
    functions:
      getMyNotifications: "(limit?: number) => Promise<{success: boolean, items?: Notification[]}>"
      getUnreadCount: "() => Promise<{success: boolean, count?: number}>"
      markNotificationRead: "(id: number) => Promise<{success: boolean}>"
      markAllNotificationsRead: "() => Promise<{success: boolean}>"
      clearMyNotifications: "() => Promise<{success: boolean}>"
      sendUserMessage: "(title: string, body: string) => Promise<{success: boolean, error?: string}>"

  - path: src/adapters/api/admin.api.ts
    functions:
      # Products
      getAdminProducts: "(opts?: {page?, search?}) => Promise<AdminProduct[]>"
      saveProduct: "(data: ProductSaveInput) => Promise<{success: boolean}>"
      deleteProduct: "(id: string) => Promise<void>"
      toggleProductStatus: "(id: string, isActive: boolean) => Promise<void>"
      reorderProduct: "(id: string, newOrder: number) => Promise<void>"
      # Cards
      getProductCards: "(productId: string, page?: number) => Promise<Card[]>"
      addCards: "(productId: string, cards: string[], expiryMs?: number) => Promise<{success: boolean}>"
      deleteCard: "(cardId: number) => Promise<void>"
      deleteCards: "(cardIds: number[]) => Promise<void>"
      getCardApiConfig: "(productId: string) => Promise<CardApiConfig>"
      saveCardApiConfig: "(productId: string, config: CardApiConfig) => Promise<{success: boolean, autoPulled?: boolean}>"
      pullCardFromApi: "(productId: string) => Promise<{success: boolean, cardKey?: string}>"
      # Orders
      getAdminOrders: "(opts?: {page?, status?, search?}) => Promise<AdminOrder[]>"
      markOrderPaid: "(orderId: string) => Promise<void>"
      markOrderDelivered: "(orderId: string) => Promise<void>"
      cancelOrder: "(orderId: string) => Promise<void>"
      deleteOrder: "(orderId: string) => Promise<void>"
      deleteOrders: "(orderIds: string[]) => Promise<void>"
      updateOrderEmail: "(orderId: string, email: string | null) => Promise<void>"
      markOrderRefunded: "(orderId: string) => Promise<{success: boolean}>"
      proxyRefund: "(orderId: string) => Promise<{ok: boolean, processed: boolean, message: string}>"
      verifyOrderRefundStatus: "(orderId: string) => Promise<{success: boolean, status?: number}>"
      # Refunds
      getRefundRequests: "(page?: number) => Promise<RefundRequest[]>"
      adminApproveRefund: "(requestId: number, adminNote?: string) => Promise<{ok: boolean}>"
      adminRejectRefund: "(requestId: number, adminNote?: string) => Promise<void>"
      getPendingRefundRequestCount: "() => Promise<{success: boolean, count: number}>"
      # Users
      getAdminUsers: "(opts?: {page?, search?}) => Promise<AdminUser[]>"
      toggleUserBlock: "(userId: string, isBlocked: boolean) => Promise<void>"
      saveUserPoints: "(userId: string, points: number) => Promise<void>"
      # Settings
      getAdminSettings: "() => Promise<Record<string, string>>"
      saveSettings: "(settings: Record<string, string>) => Promise<void>"
      testTelegramNotification: "() => Promise<{success: boolean}>"
      testBarkNotification: "() => Promise<{success: boolean}>"
      testEmailNotification: "(to: string) => Promise<{success: boolean}>"
      # Messages
      getAdminMessages: "(page?: number) => Promise<AdminMessage[]>"
      sendAdminMessage: "(params: {targetType, targetValue?, title, body}) => Promise<{success: boolean, count?: number}>"
      deleteAdminMessage: "(id: number) => Promise<{success: boolean}>"
      clearAdminMessages: "() => Promise<{success: boolean}>"
      getUnreadUserMessageCount: "() => Promise<{success: boolean, count: number}>"
      # Reviews
      getAdminReviews: "(page?: number) => Promise<Review[]>"
      deleteReview: "(reviewId: number) => Promise<void>"
      # Categories
      getCategories: "() => Promise<Category[]>"
      saveCategory: "(data: {id?, name, icon?, sortOrder?}) => Promise<void>"
      deleteCategory: "(id: number) => Promise<void>"
      # Stats & Data
      getDashboardStats: "() => Promise<DashboardStats>"
      importData: "(file: File) => Promise<{success: boolean, count?: number, errors?: number}>"
      repairData: "() => Promise<{success: boolean}>"
      checkForUpdates: "() => Promise<UpdateCheckResult>"
      # Announcement
      saveAnnouncement: "(config: AnnouncementConfig) => Promise<{success: boolean}>"
      getAnnouncementConfig: "() => Promise<AnnouncementConfig | null>"
      # Registry
      joinRegistry: "(origin: string) => Promise<{ok: boolean}>"
      leaveRegistry: "() => Promise<{ok: boolean}>"
      getRegistryStatus: "() => Promise<{optIn: boolean, origin: string | null, lastSubmitAt: number | null}>"

  # React Hooks
  - path: src/application/hooks/useAuth.ts
    signature: "() => { user: User | null, isAdmin: boolean, loading: boolean, logout(): void }"

  - path: src/application/hooks/useCatalog.ts
    signature: "(opts?: {category?, page?}) => { products: Product[], loading: boolean, error: any }"

  - path: src/application/hooks/useProduct.ts
    signature: "(id: string) => { product: Product | null, loading: boolean, error: any }"

  - path: src/application/hooks/useSearch.ts
    signature: "(q: string, opts?) => { results: Product[], loading: boolean }"

  - path: src/application/hooks/useCheckout.ts
    signature: "() => { createOrder(input): Promise<CheckoutResult>, loading: boolean }"

  - path: src/application/hooks/useOrders.ts
    signature: "(page?) => { orders: Order[], loading: boolean, error: any }"

  - path: src/application/hooks/useOrder.ts
    signature: "(id: string) => { order: Order | null, loading: boolean, checkStatus(): Promise<void>, cancel(): Promise<void> }"

  - path: src/application/hooks/useProfile.ts
    signature: "() => { profile: UserProfile | null, loading: boolean, updateEmail(email): Promise<void>, updateNotifications(enabled): Promise<void> }"

  - path: src/application/hooks/usePoints.ts
    signature: "() => { points: number, loading: boolean }"

  - path: src/application/hooks/useCheckin.ts
    signature: "() => { status: CheckinStatus, checkIn(): Promise<CheckinResult>, loading: boolean }"

  - path: src/application/hooks/useWishlist.ts
    signature: "() => { items: WishlistItem[], submit(title, desc?): Promise<void>, vote(id): Promise<void>, loading: boolean }"

  - path: src/application/hooks/useReviews.ts
    signature: "(productId: string) => { reviews: Review[], submit(input): Promise<void>, loading: boolean }"

  - path: src/application/hooks/useNotifications.ts
    signature: "() => { items: Notification[], unreadCount: number, markRead(id): void, markAllRead(): void, loading: boolean }"

  # New UI Components
  - path: src/components/api-error-boundary.tsx
  - path: src/components/loading-skeleton.tsx
  - path: src/components/empty-state.tsx
  - path: src/components/toast-provider.tsx
  - path: src/components/auth-guard.tsx
  - path: src/components/user-avatar.tsx
  - path: src/components/login-modal.tsx
  - path: src/components/product-card.tsx
  - path: src/components/product-grid.tsx
  - path: src/components/category-filter.tsx
  - path: src/components/search-bar.tsx
  - path: src/components/stock-badge.tsx
  - path: src/components/price-display.tsx
  - path: src/components/quantity-selector.tsx
  - path: src/components/points-toggle.tsx
  - path: src/components/payment-status-poller.tsx
  - path: src/components/order-status-badge.tsx
  - path: src/components/order-card.tsx
  - path: src/components/card-key-display.tsx
  - path: src/components/refund-request-form.tsx
  - path: src/components/checkin-streak.tsx
  - path: src/components/notification-item.tsx
  - path: src/components/admin/data-table.tsx
  - path: src/components/admin/stats-card.tsx
  - path: src/components/admin/confirm-dialog.tsx
  - path: src/components/admin/order-row.tsx
  - path: src/components/infinite-scroll.tsx
```

---

## ::DATABASE_SCHEMA

```yaml
# Extracted from src/lib/db/schema.ts
# All timestamps are INTEGER milliseconds (unix * 1000)

tables:
  products:
    primary_key: id TEXT
    columns:
      name: TEXT NOT NULL
      description: TEXT
      price: TEXT NOT NULL          # string decimal e.g. "12.50"
      compare_at_price: TEXT
      category: TEXT
      image: TEXT
      is_hot: INTEGER DEFAULT 0     # boolean
      is_active: INTEGER DEFAULT 1  # boolean
      is_shared: INTEGER DEFAULT 0  # boolean: one card key shared among buyers
      sort_order: INTEGER DEFAULT 0
      purchase_limit: INTEGER       # nullable, per-user max
      purchase_warning: TEXT        # nullable warning message
      visibility_level: INTEGER DEFAULT -1  # -1=public, 0=logged-in, 1-3=trust_level
      stock_count: INTEGER DEFAULT 0  # denormalized: available cards
      locked_count: INTEGER DEFAULT 0 # denormalized: reserved cards
      sold_count: INTEGER DEFAULT 0   # denormalized: paid+delivered
      rating: REAL DEFAULT 0          # avg rating 0.0-5.0
      review_count: INTEGER DEFAULT 0
      created_at: INTEGER             # ms timestamp

  cards:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      product_id: TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE
      card_key: TEXT NOT NULL         # the actual code/key to deliver
      is_used: INTEGER DEFAULT 0      # boolean
      reserved_order_id: TEXT         # nullable: currently reserved by which order
      reserved_at: INTEGER            # nullable: ms timestamp of reservation
      expires_at: INTEGER             # nullable: card expiry
      used_at: INTEGER                # nullable
      created_at: INTEGER

  orders:
    primary_key: order_id TEXT
    columns:
      product_id: TEXT NOT NULL
      product_name: TEXT NOT NULL
      amount: TEXT NOT NULL           # final amount after points deduction
      email: TEXT                     # delivery email
      payee: TEXT                     # payer username from gateway
      status: TEXT DEFAULT 'pending'  # enum: pending|paid|delivered|cancelled|refunded|failed
      trade_no: TEXT                  # payment gateway trade number
      card_key: TEXT                  # delivered card keys (newline-separated if multiple)
      card_ids: TEXT                  # comma-separated card IDs
      paid_at: INTEGER
      delivered_at: INTEGER
      user_id: TEXT                   # nullable: logged-in user
      username: TEXT
      points_used: INTEGER DEFAULT 0
      quantity: INTEGER DEFAULT 1
      current_payment_id: TEXT        # latest payment ID (for retry with different trade_no)
      created_at: INTEGER

  login_users:
    primary_key: user_id TEXT
    note: "user_id format: LinuxDO=numeric string, GitHub=github:{github_numeric_id}"
    columns:
      username: TEXT
      email: TEXT                     # delivery email preference
      points: INTEGER DEFAULT 0
      is_blocked: INTEGER DEFAULT 0
      desktop_notifications_enabled: INTEGER DEFAULT 0
      created_at: INTEGER
      last_login_at: INTEGER
      last_checkin_at: INTEGER        # nullable
      consecutive_days: INTEGER DEFAULT 0

  daily_checkins_v2:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      user_id: TEXT NOT NULL REFERENCES login_users(user_id)
      created_at: INTEGER

  settings:
    primary_key: key TEXT
    columns:
      value: TEXT
      updated_at: INTEGER
    known_keys:
      - shop_name
      - shop_description
      - shop_logo
      - shop_logo_updated_at
      - shop_footer
      - theme_color
      - noindex_enabled
      - wishlist_enabled
      - checkin_enabled
      - checkin_reward
      - low_stock_threshold
      - refund_reclaim_cards
      - announcement              # JSON: {content, startAt, endAt}
      - telegram_bot_token
      - telegram_chat_id
      - telegram_language
      - telegram_enabled
      - bark_enabled
      - bark_server_url
      - bark_device_key
      - resend_api_key
      - resend_from_email
      - resend_from_name
      - resend_enabled
      - email_language
      - registry_opt_in
      - registry_origin
      - registry_hide_nav
      - registry_prompted
      - registry_challenge_token
      - registry_last_submit_at
      - schema_version
      - product_aggregates_backfilled_v2
      - broadcast_cleared_at:{userId}   # per-user key

  categories:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      name: TEXT NOT NULL UNIQUE
      icon: TEXT
      sort_order: INTEGER DEFAULT 0
      created_at: INTEGER
      updated_at: INTEGER

  reviews:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      product_id: TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE
      order_id: TEXT NOT NULL
      user_id: TEXT NOT NULL
      username: TEXT NOT NULL
      rating: INTEGER NOT NULL      # 1-5
      comment: TEXT
      created_at: INTEGER

  refund_requests:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      order_id: TEXT NOT NULL
      user_id: TEXT
      username: TEXT
      reason: TEXT
      status: TEXT DEFAULT 'pending' # pending|approved|rejected|processed
      admin_username: TEXT
      admin_note: TEXT
      created_at: INTEGER
      updated_at: INTEGER
      processed_at: INTEGER

  user_notifications:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      user_id: TEXT NOT NULL REFERENCES login_users(user_id) ON DELETE CASCADE
      type: TEXT NOT NULL           # order_delivered|refund_approved|refund_rejected|admin_message
      title_key: TEXT NOT NULL      # i18n key e.g. profile.notifications.orderDeliveredTitle
      content_key: TEXT NOT NULL    # i18n key
      data: TEXT                    # JSON: {params: {orderId, productName}, href: "/order/xxx"}
      is_read: INTEGER DEFAULT 0
      created_at: INTEGER

  admin_messages:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      target_type: TEXT NOT NULL    # all|username|userId
      target_value: TEXT            # username or userId when not 'all'
      title: TEXT NOT NULL
      body: TEXT NOT NULL
      sender: TEXT
      created_at: INTEGER

  user_messages:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      user_id: TEXT NOT NULL REFERENCES login_users(user_id)
      username: TEXT
      title: TEXT NOT NULL          # max 120 chars
      body: TEXT NOT NULL           # max 2000 chars
      is_read: INTEGER DEFAULT 0
      created_at: INTEGER

  broadcast_messages:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      title: TEXT NOT NULL
      body: TEXT NOT NULL
      sender: TEXT
      created_at: INTEGER
    note: "broadcast_reads tracks which users have read each broadcast"

  broadcast_reads:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      message_id: INTEGER NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE
      user_id: TEXT NOT NULL REFERENCES login_users(user_id)
      created_at: INTEGER
    unique: "(message_id, user_id)"

  wishlist_items:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      title: TEXT NOT NULL          # max 80 chars
      description: TEXT             # max 300 chars
      user_id: TEXT
      username: TEXT
      created_at: INTEGER

  wishlist_votes:
    primary_key: id INTEGER AUTOINCREMENT
    columns:
      item_id: INTEGER NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE
      user_id: TEXT NOT NULL REFERENCES login_users(user_id)
      created_at: INTEGER
    unique: "(item_id, user_id)"
```

---

## ::BUSINESS_RULES

```yaml
constants:
  INFINITE_STOCK: 999999            # src/lib/constants.ts:1
  RESERVATION_TTL_MS: 300000        # 5 minutes, src/lib/constants.ts:2
  MAX_ORDER_QUANTITY: 10000         # src/actions/checkout.ts:17

stock_logic:
  normal_product:
    available_count: "cards WHERE is_used=0 AND (expires_at IS NULL OR expires_at > now) AND (reserved_at IS NULL OR reserved_at < now - RESERVATION_TTL_MS)"
    locked_count: "cards WHERE is_used=0 AND reserved_at >= now - RESERVATION_TTL_MS"
  shared_product:
    description: "Multiple buyers get the same card key. No card locking."
    stock: "IF unusedCardExists THEN INFINITE_STOCK ELSE 0"
    card_selection: "random unused card, not marked as used after delivery"

points_logic:
  ratio: "1 point = 1 currency unit"
  deduction_formula: "pointsToUse = min(userPoints, ceil(productPrice * quantity))"
  zero_price_flow: "If finalAmount <= 0: create order with status='delivered' immediately, skip payment gateway"
  refund: "On refund, restore pointsUsed back to user account"
  atomicity: "Deduct points first, if order insert fails → restore points (best-effort)"

order_status_machine:
  states: [pending, paid, delivered, cancelled, refunded, failed]
  transitions:
    pending:
      - → cancelled: user cancel or admin cancel (releases reserved cards, restores points)
      - → paid: payment gateway notify callback
    paid:
      - → delivered: admin marks delivered (triggers card key delivery)
      - → refunded: admin refund
    delivered:
      - → refunded: admin refund (may reclaim cards if refund_reclaim_cards=true)
    any: → failed

card_reservation:
  on_create_order: "Atomic UPDATE...RETURNING to reserve card for orderId"
  on_fallback: "Steal expired reservation if reserved_at < now - TTL"
  on_stolen_card_check: "Query payment gateway to verify stolen card's order is unpaid before stealing"
  on_cancel: "Release: SET reserved_order_id=NULL, reserved_at=NULL"
  on_paid: "Mark card as is_used=1 if not shared product"

purchase_limit:
  check: "SUM(quantity) of orders WHERE status IN ('paid','delivered') AND (user_id=? OR email=?)"
  per_product: "purchaseLimit column on products table"

visibility_levels:
  -1: public (not logged in)
  0: logged in users
  1: trust_level >= 1
  2: trust_level >= 2
  3: trust_level >= 3
  resolution: "visibilityCondition = COALESCE(visibility_level, -1) <= userTrustLevel"

auth_providers:
  linuxdo:
    authorize_url: "https://connect.linux.do/oauth2/authorize"
    token_url: "https://connect.linux.do/oauth2/token"
    userinfo_url: "https://connect.linux.do/api/user"
    user_id_format: "numeric string from profile.id"
    username_field: "profile.username"
    trust_level_field: "profile.trust_level"
  github:
    user_id_format: "github:{providerAccountId}"
    username_format: "gh_{login.toLowerCase()}"

admin_auth:
  check: "session.user.username exists in ADMIN_USERNAMES env var (comma-separated)"
  source: src/lib/admin-auth.ts

announcement_format:
  storage: "settings table, key='announcement', value=JSON"
  schema: "{ content: string, startAt: string|null, endAt: string|null }"
  active_check: "now >= startAt AND now <= endAt (if set)"

registry:
  description: "Optional shop listing registry. Admin can opt-in/out."
  challenge_flow: "POST /challenge → get token → store in settings → POST /submit"
  verification_endpoint: "backend serves /.well-known/ldc-registry-verify returning the token"

card_api:
  description: "External API to auto-replenish card stock"
  config_storage: "settings table, key=card_api:{productId}"
  config_schema: "{ enabled: boolean, url: string, token: string }"
  auto_trigger: "After order delivered or admin mark-delivered"
  request: "GET {url} with Authorization: Bearer {token}"
  response: "{ key: string } or { error: string }"

refund_reclaim_cards:
  setting: "settings.refund_reclaim_cards (default: true)"
  behavior: "On refund: if true and not shared product, restore card to unused state"
  exception: "Shared products: never reclaim (key is still valid for others)"

notifications:
  telegram:
    enabled_setting: telegram_enabled
    events: [payment_success, refund_request, user_message]
  bark:
    enabled_setting: bark_enabled
    server_url_setting: bark_server_url (default: https://api.day.app)
  email_resend:
    enabled_setting: resend_enabled
    events: [order_delivered (sends card key to buyer email)]
  user_notifications_inbox:
    types: [order_delivered, refund_approved, refund_rejected, admin_message]
    data_format: "JSON: { params: {orderId, productName, adminNote?}, href: string }"
  broadcast:
    admin_sends: "broadcast_messages table"
    user_reads: "broadcast_reads tracks read state per user"
    combined_display: "merge direct notifications + broadcasts, sort by createdAt"

import_data:
  format: "SQL dump with INSERT OR IGNORE INTO statements"
  column_mapping: "camelCase → snake_case transformation applied before execution"
  table_mapping: "daily_checkins → daily_checkins_v2"
  post_import: "run repairTimestamps() + recalcProductAggregates()"

product_aggregates:
  description: "Denormalized counts stored on products table for performance"
  fields: [stock_count, locked_count, sold_count, rating, review_count]
  triggers: "recalcProductAggregates(productId) called after: order create, card add/delete, review submit, refund"
```

---

## ::API_ENDPOINTS

```yaml
# Full REST API specification
# Base URL: NEXT_PUBLIC_API_URL (e.g. http://localhost:4000)
# Auth: Authorization: Bearer {access_token}

auth:
  - method: GET
    path: /api/auth/oauth/linuxdo
    auth: public
    description: Redirect to LinuxDO OAuth authorization
  - method: GET
    path: /api/auth/oauth/github
    auth: public
    description: Redirect to GitHub OAuth authorization
  - method: GET
    path: /api/auth/callback/linuxdo
    auth: public
    description: OAuth callback, issues JWT tokens
    response: "redirect to /login?access_token=...&refresh_token=...&expires_in=..."
  - method: GET
    path: /api/auth/callback/github
    auth: public
    description: OAuth callback, issues JWT tokens
  - method: POST
    path: /api/auth/refresh
    auth: refresh_token (cookie or body)
    description: Rotate access token
    response: "{ access_token, refresh_token, expires_in }"
  - method: POST
    path: /api/auth/logout
    auth: bearer
    description: Invalidate refresh token server-side
  - method: GET
    path: /api/auth/me
    auth: bearer
    response: "{ id, username, email, avatarUrl, trustLevel, isAdmin, points, desktopNotificationsEnabled }"

catalog:
  - method: GET
    path: /api/catalog/products
    auth: optional
    params: "category?, page=1, limit=20"
    response: "Product[]"
    note: "Respects visibilityLevel based on user trustLevel from token"
  - method: GET
    path: /api/catalog/products/:id
    auth: optional
    response: "Product | 404"
  - method: GET
    path: /api/catalog/search
    auth: optional
    params: "q, category?, page=1, limit=20"
    response: "Product[]"
  - method: GET
    path: /api/catalog/categories
    auth: public
    response: "Category[]"
  - method: GET
    path: /api/catalog/settings
    auth: public
    response: "PublicSettings"
  - method: GET
    path: /api/catalog/announcement
    auth: public
    response: "{ content: string } | null"

checkout:
  - method: POST
    path: /api/checkout/orders
    auth: optional
    body: "{ productId, quantity, email?, usePoints? }"
    response: "{ success: true, url, params } | { success: true, url, isZeroPrice: true } | { success: false, error }"
    error_codes: [buy.outOfStock, buy.invalidQuantity, buy.limitExceeded, buy.userBlocked, buy.productNotFound, buy.stockLocked, buy.quantityTooLarge]
    side_effects:
      - "Sets ldc_pending_order cookie on non-zero-price orders"
      - "Calls payment gateway to get payment params"
      - "Zero-price: creates delivered order, sends email if email provided"
  - method: GET
    path: /api/checkout/orders/:id/payment-params
    auth: bearer
    description: Get new payment params for retry
    response: "{ success: true, url, params } | { success: false, error }"
  - method: GET
    path: /api/checkout/orders/:id/status
    auth: bearer_or_cookie
    description: Check payment status by querying payment gateway
    response: "{ success: true, status: 'paid'|'pending' } | { success: false, error }"
  - method: POST
    path: /api/checkout/notify
    auth: payment_gateway_signature
    description: Webhook from epay on successful payment
    side_effects: [mark_order_paid, deliver_card_key, send_notification, send_email, notify_admin]
  - method: GET
    path: /api/checkout/callback/:id
    auth: public
    description: User redirect after payment, check and display result

orders:
  - method: GET
    path: /api/orders
    auth: bearer
    params: "page=1, limit=20"
    response: "Order[]"
  - method: GET
    path: /api/orders/:id
    auth: bearer_or_cookie
    response: "Order | 404"
    note: "cardKey only included for delivered status"
  - method: GET
    path: /api/orders/:id/status
    auth: bearer_or_cookie
    response: "{ success, status }"
  - method: POST
    path: /api/orders/:id/cancel
    auth: bearer
    response: "{ success, error? }"
    error_codes: [order.notFound, order.cannotCancel, common.error]
  - method: POST
    path: /api/orders/:id/refund-request
    auth: bearer
    body: "{ reason: string }"
    response: "{ ok: true }"
    side_effects: [notifyAdminRefundRequest]

profile:
  - method: GET
    path: /api/profile
    auth: bearer
    response: "UserProfile"
  - method: PATCH
    path: /api/profile/email
    auth: bearer
    body: "{ email: string }"
    response: "{ success, error? }"
    error_codes: [profile.emailInvalid]
  - method: PATCH
    path: /api/profile/notifications
    auth: bearer
    body: "{ enabled: boolean }"
    response: "{ success, error? }"
  - method: GET
    path: /api/profile/points
    auth: bearer
    response: "{ points: number }"
  - method: POST
    path: /api/profile/checkin
    auth: bearer
    response: "{ success, points?, consecutiveDays?, error? }"
  - method: GET
    path: /api/profile/checkin/status
    auth: bearer
    response: "{ checkedIn: boolean, disabled?: boolean }"

profile_messages:
  - method: POST
    path: /api/messages
    auth: bearer
    body: "{ title: string, body: string }"
    response: "{ success, error? }"
    constraints: "title max 120 chars, body max 2000 chars"

wishlist:
  - method: GET
    path: /api/wishlist
    auth: optional
    params: "limit=10"
    response: "WishlistItem[]"
  - method: POST
    path: /api/wishlist
    auth: bearer
    body: "{ title: string, description?: string }"
    response: "{ success, item?, error? }"
    constraints: "title max 80 chars, description max 300 chars"
    error_codes: [wishlist.disabled, wishlist.blocked, wishlist.titleRequired, wishlist.titleTooLong, wishlist.descTooLong]
  - method: POST
    path: /api/wishlist/:id/vote
    auth: bearer
    response: "{ success, voted?, count?, error? }"
  - method: DELETE
    path: /api/wishlist/:id
    auth: admin_bearer
    response: "{ success }"

reviews:
  - method: GET
    path: /api/products/:id/reviews
    auth: public
    params: "page=1"
    response: "Review[]"
  - method: POST
    path: /api/products/:id/reviews
    auth: bearer
    body: "{ orderId, rating, comment? }"
    response: "{ success, error? }"
    error_codes: [review.authRequired, review.invalidRating, review.orderNotFound, review.invalidOrder, review.notOwner, review.orderNotDelivered, review.alreadyReviewed]

notifications:
  - method: GET
    path: /api/notifications
    auth: bearer
    params: "limit=20"
    response: "{ success, items: Notification[] }"
    note: "Merges direct notifications + broadcast messages, sorted by createdAt DESC"
  - method: GET
    path: /api/notifications/unread-count
    auth: bearer
    response: "{ success, count: number }"
    note: "Sum of unread direct + unread broadcast"
  - method: POST
    path: /api/notifications/:id/read
    auth: bearer
    response: "{ success }"
  - method: POST
    path: /api/notifications/read-all
    auth: bearer
    response: "{ success }"
    side_effects: "Also marks all broadcast messages as read for this user"
  - method: POST
    path: /api/notifications/clear
    auth: bearer
    response: "{ success }"
    side_effects: "Deletes direct notifications, sets broadcast_cleared_at"
  - method: GET
    path: /api/admin/user-messages
    auth: admin_bearer
    response: "UserMessage[]"
  - method: POST
    path: /api/admin/user-messages/:id/read
    auth: admin_bearer
    response: "{ success }"
  - method: DELETE
    path: /api/admin/user-messages/:id
    auth: admin_bearer
    response: "{ success }"
  - method: POST
    path: /api/admin/user-messages/clear
    auth: admin_bearer
    response: "{ success }"
  - method: GET
    path: /api/admin/user-messages/unread-count
    auth: admin_bearer
    response: "{ success, count }"

admin_products:
  - { method: GET, path: "/api/admin/products", params: "page, search" }
  - { method: POST, path: "/api/admin/products", body: "ProductSaveInput" }
  - { method: DELETE, path: "/api/admin/products/:id" }
  - { method: PATCH, path: "/api/admin/products/:id/status", body: "{ isActive: boolean }" }
  - { method: PATCH, path: "/api/admin/products/:id/order", body: "{ sortOrder: number }" }
  - { method: GET, path: "/api/admin/products/:id/cards", params: "page" }
  - { method: POST, path: "/api/admin/products/:id/cards", body: "{ cards: string[], expiresHours?, expiresMinutes? }" }
  - { method: GET, path: "/api/admin/products/:id/card-api" }
  - { method: PUT, path: "/api/admin/products/:id/card-api", body: "{ enabled, url, token }" }
  - { method: POST, path: "/api/admin/products/:id/card-api/pull" }
  - { method: DELETE, path: "/api/admin/cards/:id" }
  - { method: POST, path: "/api/admin/cards/bulk-delete", body: "{ cardIds: number[] }" }

admin_orders:
  - { method: GET, path: "/api/admin/orders", params: "page, status, search" }
  - { method: GET, path: "/api/admin/orders/:id" }
  - { method: POST, path: "/api/admin/orders/:id/mark-paid" }
  - { method: POST, path: "/api/admin/orders/:id/deliver" }
  - { method: POST, path: "/api/admin/orders/:id/cancel" }
  - { method: DELETE, path: "/api/admin/orders/:id" }
  - { method: POST, path: "/api/admin/orders/bulk-delete", body: "{ orderIds: string[] }" }
  - { method: PATCH, path: "/api/admin/orders/:id/email", body: "{ email: string | null }" }
  - { method: POST, path: "/api/admin/orders/:id/refund" }
  - { method: POST, path: "/api/admin/orders/:id/proxy-refund" }
  - { method: GET, path: "/api/admin/orders/:id/verify-refund" }
  - { method: GET, path: "/api/admin/refunds", params: "page" }
  - { method: POST, path: "/api/admin/refunds/:id/approve", body: "{ adminNote? }" }
  - { method: POST, path: "/api/admin/refunds/:id/reject", body: "{ adminNote? }" }
  - { method: GET, path: "/api/admin/refunds/pending-count" }

admin_users:
  - { method: GET, path: "/api/admin/users", params: "page, search" }
  - { method: PATCH, path: "/api/admin/users/:id/block", body: "{ isBlocked: boolean }" }
  - { method: PATCH, path: "/api/admin/users/:id/points", body: "{ points: number }" }

admin_settings:
  - { method: GET, path: "/api/admin/settings" }
  - { method: PUT, path: "/api/admin/settings", body: "Record<string, string>" }
  - { method: POST, path: "/api/admin/settings/test-notification", body: "{ channel: 'telegram'|'bark' }" }
  - { method: POST, path: "/api/admin/settings/test-email", body: "{ to: string }" }

admin_messages:
  - { method: GET, path: "/api/admin/messages", params: "page" }
  - { method: POST, path: "/api/admin/messages", body: "{ targetType, targetValue?, title, body }" }
  - { method: DELETE, path: "/api/admin/messages/:id" }
  - { method: POST, path: "/api/admin/messages/clear" }

admin_reviews:
  - { method: GET, path: "/api/admin/reviews", params: "page" }
  - { method: DELETE, path: "/api/admin/reviews/:id" }

admin_categories:
  - { method: GET, path: "/api/admin/categories" }
  - { method: POST, path: "/api/admin/categories", body: "{ id?, name, icon?, sortOrder? }" }
  - { method: DELETE, path: "/api/admin/categories/:id" }

admin_misc:
  - { method: GET, path: "/api/admin/stats" }
  - { method: POST, path: "/api/admin/data/import", body: "multipart/form-data: file" }
  - { method: POST, path: "/api/admin/data/repair" }
  - { method: GET, path: "/api/admin/update-check" }
  - { method: POST, path: "/api/admin/announcement", body: "{ content, startAt?, endAt? }" }
  - { method: GET, path: "/api/admin/announcement" }
  - { method: POST, path: "/api/admin/registry/join", body: "{ origin: string }" }
  - { method: POST, path: "/api/admin/registry/leave" }
  - { method: GET, path: "/api/admin/registry/status" }

# Well-known endpoints (keep in Next.js frontend)
frontend_keeps:
  - { method: GET, path: "/.well-known/ldc-registry-verify", description: "Returns registry challenge token" }
```

---

## ::ENV_VARIABLES

```yaml
# Variables to KEEP in frontend
frontend_env:
  NEXT_PUBLIC_API_URL:
    required: true
    description: "Base URL of the REST API backend"
    example: "http://localhost:4000"
  NEXT_PUBLIC_APP_URL:
    required: false
    description: "Frontend app URL, used for OAuth redirect construction if needed"

# Variables to REMOVE from frontend (move to backend)
remove_from_frontend:
  - DATABASE_URL
  - NEXTAUTH_SECRET
  - AUTH_SECRET
  - OAUTH_CLIENT_ID
  - OAUTH_CLIENT_SECRET
  - AUTH_GITHUB_ID
  - AUTH_GITHUB_SECRET
  - GITHUB_ID
  - GITHUB_SECRET
  - MERCHANT_ID
  - MERCHANT_KEY
  - PAY_URL
  - TELEGRAM_BOT_TOKEN
  - TELEGRAM_CHAT_ID
  - BARK_SERVER_URL
  - BARK_DEVICE_KEY
  - RESEND_API_KEY
  - ADMIN_USERNAMES
  - DEV_ADMIN_BYPASS
  - DEV_ADMIN_USERNAME
```

---

## ::VERIFICATION_COMMANDS

```bash
# Run after each phase to validate no forbidden imports remain

# Phase completion checks
grep -rn "\"use server\"" src/ --include="*.ts" --include="*.tsx"
grep -rn "from.*@/lib/db" src/ --include="*.ts" --include="*.tsx"
grep -rn "from.*drizzle-orm" src/ --include="*.ts" --include="*.tsx"
grep -rn "from.*better-sqlite3" src/ --include="*.ts" --include="*.tsx"
grep -rn "from.*next-auth" src/ --include="*.ts" --include="*.tsx"
grep -rn "from.*@/actions/" src/components/ src/app/ --include="*.ts" --include="*.tsx"

# Build validation
npm run lint
npm run build

# Type check
npx tsc --noEmit
```

---

## ::EXECUTION_ORDER

```yaml
phases:
  - phase: 0
    name: cleanup_setup
    tasks:
      - "npm uninstall drizzle-orm drizzle-kit better-sqlite3 next-auth @auth/core"
      - "npm install swr js-cookie"
      - "npm install -D @types/js-cookie"
      - "Create .env.example with NEXT_PUBLIC_API_URL"

  - phase: 1
    name: base_infrastructure
    blocking: true
    tasks:
      - "Create src/adapters/api/token-store.ts"
      - "Create src/adapters/api/http-client.ts"
      - "Create src/application/context/AuthContext.tsx"
      - "Modify src/app/layout.tsx: replace SessionProvider with AuthProvider"

  - phase: 2
    name: auth_module
    depends_on: [1]
    tasks:
      - "Create src/domain/auth.ts"
      - "Create src/adapters/api/auth.api.ts"
      - "Create src/application/hooks/useAuth.ts"
      - "Modify src/components/signin-button.tsx"
      - "Modify src/components/signout-button.tsx"
      - "Modify src/app/login/page.tsx"
      - "Delete src/app/api/auth/"
      - "Delete src/lib/auth.ts"
      - "Delete src/lib/admin-auth.ts"

  - phase: 3
    name: catalog_module
    depends_on: [2]
    tasks:
      - "Create src/domain/catalog.ts"
      - "Create src/adapters/api/catalog.api.ts"
      - "Create src/application/hooks/useCatalog.ts useProduct.ts useSearch.ts"
      - "Modify src/app/page.tsx → 'use client'"
      - "Modify src/app/search/page.tsx → 'use client'"
      - "Modify src/app/buy/[id]/page.tsx → 'use client'"
      - "Modify src/components/home-content.tsx"
      - "Modify src/components/search-content.tsx"

  - phase: 4
    name: checkout_module
    depends_on: [2]
    tasks:
      - "Create src/domain/checkout.ts"
      - "Create src/adapters/api/checkout.api.ts"
      - "Create src/application/hooks/useCheckout.ts"
      - "Modify src/components/buy-content.tsx buy-button.tsx payment-link-content.tsx"
      - "Modify src/app/paying/page.tsx src/app/callback/[id]/page.tsx"
      - "Delete src/actions/checkout.ts src/actions/buy.ts src/actions/payment.ts"

  - phase: 5
    name: orders_module
    depends_on: [4]
    tasks:
      - "Create src/domain/orders.ts"
      - "Create src/adapters/api/orders.api.ts"
      - "Create src/application/hooks/useOrders.ts useOrder.ts"
      - "Modify order pages and components"
      - "Delete src/actions/order.ts src/actions/refund.ts src/actions/refund-requests.ts"

  - phase: 6
    name: profile_points_module
    depends_on: [2]
    tasks:
      - "Create src/domain/profile.ts"
      - "Create src/adapters/api/profile.api.ts"
      - "Create hooks: useProfile, usePoints, useCheckin"
      - "Modify profile-content.tsx checkin-button.tsx"
      - "Delete src/actions/profile.ts src/actions/points.ts"

  - phase: 7
    name: wishlist_reviews_module
    depends_on: [2]
    tasks:
      - "Create src/domain/wishlist.ts"
      - "Create src/adapters/api/wishlist.api.ts"
      - "Create hooks: useWishlist, useReviews"
      - "Modify wishlist-section.tsx review-form.tsx review-list.tsx"
      - "Delete src/actions/wishlist.ts src/actions/reviews.ts"

  - phase: 8
    name: notifications_module
    depends_on: [2]
    tasks:
      - "Create src/domain/notifications.ts"
      - "Create src/adapters/api/notifications.api.ts"
      - "Create hooks: useNotifications"
      - "Modify header-client-parts.tsx profile-content.tsx"
      - "Delete src/actions/user-notifications.ts src/actions/user-messages.ts"

  - phase: 9
    name: admin_module
    depends_on: [2]
    tasks:
      - "Create src/domain/admin.ts"
      - "Create src/adapters/api/admin.api.ts"
      - "Migrate all src/app/admin/** to 'use client'"
      - "Delete all admin actions"

  - phase: 10
    name: final_cleanup
    depends_on: [3, 4, 5, 6, 7, 8, 9]
    tasks:
      - "Delete src/lib/db/ (entire directory)"
      - "Delete src/lib/email.ts src/lib/notifications.ts src/lib/order-processing.ts"
      - "Delete src/lib/epay.ts src/lib/card-api.ts src/lib/crypto.ts"
      - "Delete drizzle.config.ts"
      - "Update package.json"
      - "Update next.config.ts"
      - "Run verification commands"

  - phase: 11
    name: new_components
    depends_on: [10]
    tasks:
      - "Create 25+ new UI components (see ::FILES_TO_CREATE)"
```

---

## ::NOTES_FOR_CODEX

```
1. NEVER add 'use server' directive to any file during this migration.
2. NEVER import from drizzle-orm, better-sqlite3, next-auth, or @/lib/db.
3. All data fetching must go through src/adapters/api/*.api.ts functions.
4. All pages must be Client Components ('use client').
5. Auth state must come from useAuthContext() or useAuth() hook only.
6. Token storage: use token-store.ts abstraction, never access cookies/localStorage directly.
7. Error handling: adapter functions return { success: false, error: string } on failure, never throw.
8. i18n error keys must be preserved exactly as documented in ::BUSINESS_RULES and API_ENDPOINTS.
9. The ldc_pending_order cookie set by backend checkout endpoint is read by order status checker.
10. Admin routes must check isAdmin from useAuth() and redirect to /login if false.
11. The /.well-known/ldc-registry-verify route stays in Next.js frontend (not deleted).
12. SWR is preferred for data fetching hooks: useSWR(key, fetcher) pattern.
13. Optimistic updates should be used for vote/checkin/notifications to improve UX.
```
