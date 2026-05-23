# Extract Backend API Spec, Keep Frontend Contract Stable

## Summary
- Giữ contract hiện tại phía frontend càng nguyên càng tốt: component props, page data shape, i18n error keys, navigation/payment behavior không đổi.
- Thay implementation phía dưới `src/actions/*` và server DB queries bằng REST adapter, nhưng tên function/input/output ở frontend-facing layer vẫn giữ tương thích.
- Extract API spec từ logic hiện tại để backend implement theo module, không bắt frontend phải redesign workflow ngay.

## Key Changes
- Tạo lớp compatibility cho frontend:
  - Giữ các function kiểu `createOrder(productId, quantity, email, usePoints)`, `getUserPoints()`, `saveProduct(formData)`, `markOrderPaid(orderId)` như contract mà UI đang dùng.
  - Di chuyển chúng khỏi “server action thật” sang application facade/client adapter, nội bộ gọi REST.
  - Response vẫn dùng shape hiện tại như `{ success, error, params, url, isZeroPrice }` để UI ít đổi nhất.
- Extract API spec theo module backend:
  - `auth`: login, logout, refresh, current user, admin/session capability.
  - `catalog`: products, product detail, search, categories, live stock stats, announcement, settings public.
  - `checkout/payment`: create order, retry payment params, payment order, payment callback/status.
  - `orders`: my orders, order detail, cancel pending, check status, refund request.
  - `profile/points`: profile email, desktop notification setting, points, check-in.
  - `wishlist/reviews`: wishlist CRUD/vote, product reviews, submit review.
  - `notifications/messages`: user notifications, admin/user messages, unread counts.
  - `admin`: products, cards, orders, users, settings, refunds, reviews, data import/repair, registry.
- Define REST DTOs from current frontend needs, not raw DB tables. DB-specific fields stay backend-private unless UI already depends on them.
- Auth uses API-owned Bearer JWT flow:
  - API issues access token and refresh token.
  - Frontend REST client attaches access token.
  - On `401`, client calls refresh endpoint once, retries request, then falls back to logged-out state.

## API Spec Extraction Rules
- For each existing `src/actions/*` export, document:
  - Current function signature.
  - REST method/path.
  - Request body/query params.
  - Success response matching current frontend-facing return shape.
  - Error codes preserving current i18n keys such as `buy.outOfStock`, `buy.invalidQuantity`, `buy.limitExceeded`.
- For each server page currently importing `@/lib/db/queries`, document the page data endpoint it needs.
- Preserve existing frontend behavior for:
  - Payment form params returned to `/paying`.
  - Zero-price/points order redirect.
  - Admin forms currently using `FormData`.
  - Pagination/filter query behavior on home/search/admin orders/users.
  - Cache/revalidation side effects as backend responsibilities or frontend refetch triggers.

## Implementation Shape
- Frontend folders:
  - `src/domain`: shared entity/value types and pure helpers.
  - `src/application`: frontend-facing use cases/facades with current-compatible signatures.
  - `src/application/ports`: interfaces the frontend needs from backend.
  - `src/adapters/api`: REST client and module clients implementing ports.
  - `src/app` and `src/components`: minimal changes, mostly import path swaps.
- Backend spec output:
  - Add a human-readable API spec document grouped by module.
  - Optionally later convert it to OpenAPI, but first pass should be accurate to current code behavior.
- Remove frontend direct dependency on backend internals after migration:
  - No direct imports from `@/lib/db`, Drizzle, SQLite, `next-auth`, or backend-only notification/email/payment processing modules.

## Test Plan
- Contract audit: every current `src/actions/*` export has a mapped REST endpoint or an explicit frontend-only replacement.
- Static checks: `npm run lint`, `npm run build`.
- Import guard: verify frontend no longer imports `@/lib/db`, `drizzle-orm`, `better-sqlite3`, or backend-only modules.
- Flow smoke tests:
  - Catalog/search/product detail.
  - Login/session refresh/logout.
  - Buy/payment/zero-price/points/out-of-stock.
  - Orders/refunds/reviews/profile/check-in.
  - Admin products/cards/orders/users/settings/messages/refunds/data import.

## Assumptions
- “Giữ contract frontend” means UI-facing function signatures and response shapes stay stable, while their internal implementation changes from server action/DB to REST.
- Backend implementation will be driven by the extracted module API spec.
- Big bang still applies for final state: no direct backend logic remains in the web frontend.
