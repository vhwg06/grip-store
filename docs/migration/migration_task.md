# Task Breakdown – 3 Deliverables

## Deliverable 1: Backend API Spec Document
> **Yêu cầu cốt lõi:** Phải extract được toàn bộ business logic, clear requirement (validation, constraints, logic xử lý) từ source code cũ. Tài liệu phải đủ chi tiết để backend team có thể implement sang service/framework khác một cách chính xác mà không cần đọc lại code cũ.

- [x] Tạo `docs/api-spec.md` – Đặc tả hệ thống REST API theo nguyên tắc **Dumb Frontend**
- [x] Tạo `docs/domain-rules.md` – Đặc tả các quy tắc nghiệp vụ cốt lõi (Business Rules)
- [x] Tạo `docs/db-schema.md` – Tài liệu cấu trúc Database và mô tả ý nghĩa nghiệp vụ của từng trường

### 📌 CHI TIẾT CÁC BƯỚC BÓC TÁCH NGHIỆP VỤ THEO TỪNG MODULE (EXTRACT TASKS)

#### 🔑 Module 1: Auth & User Identity (Xác thực & Định danh)
- [ ] **Extract Task 1.1: Trích xuất logic định cấu hình & chuyển hướng đăng nhập OAuth**
  - *Nguồn trích xuất:* `src/components/signin-button.tsx`, `src/app/api/auth/[...nextauth]/route.ts`.
  - *Input:* Thao tác click login từ User, Provider ID (`linuxdo` hoặc `github`).
  - *Output:* Redirect URL chứa client_id, scopes, state bảo mật chống CSRF gửi tới OAuth Provider.
- [ ] **Extract Task 1.2: Trích xuất luồng xử lý Callback & Ghép nối tài khoản (Merge Account)**
  - *Nguồn trích xuất:* `src/lib/auth.ts`, `src/lib/db/queries.ts` (hàm `recordLoginUser`).
  - *Input:* Authorization code từ Provider.
  - *Logic xử lý:* 
    - Lấy thông tin user profile từ provider. Định danh LinuxDO được lưu dạng chuỗi số gốc. Định danh GitHub được lưu dạng tiền tố `github:{id}`. GitHub username tự động chuẩn hóa bằng cách bỏ prefix `github:` và thêm prefix `gh_` (ví dụ: `gh_octocat`).
    - Nếu đăng nhập qua GitHub, kiểm tra xem `username` hoặc `email` đã tồn tại trên database dưới dạng tài khoản LinuxDO hay chưa. Nếu có, tiến hành liên kết hai ID này dưới cùng một bản ghi để không mất lịch sử giao dịch.
  - *Output:* JWT Access Token (15 phút) và Refresh Token Cookie (7 ngày).
- [ ] **Extract Task 1.3: Trích xuất API phiên làm việc `/me` & Cờ kiểm soát tính năng (Feature Flags)**
  - *Nguồn trích xuất:* `src/lib/auth.ts`, `src/lib/db/queries.ts` (hàm `canUserReview`).
  - *Input:* Access Token của User hiện hành.
  - *Logic xử lý:* Query số dư points hiện tại. Kiểm tra quyền Admin bằng cách so khớp username có nằm trong chuỗi danh sách của biến môi trường `ADMIN_USERNAMES` hay không. Kiểm tra cờ `canReview` bằng cách query xem user có đơn hàng nào trạng thái `delivered` mà chưa review không.
  - *Output:* Trả về JSON chứa `{ id, username, email, points, trustLevel, isAdmin, canReview }`.

#### 📦 Module 2: Catalog & Products (Danh mục & Sản phẩm)
- [ ] **Extract Task 2.1: Trích xuất bộ lọc phân quyền hiển thị (Visibility Level & Trust Level)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `getActiveProducts`, `getProduct`, `searchActiveProducts`).
  - *Input:* Bộ lọc danh mục, `trustLevel` của User (khách vãng lai mặc định là `-1`).
  - *Logic xử lý:* Chỉ lấy các sản phẩm có `isActive = 1`. Lọc bắt buộc điều kiện: `visibilityLevel <= user.trustLevel` (với -1=public, 0=chỉ login, >0 là trust level tối thiểu).
  - *Output:* Mảng danh sách các sản phẩm thỏa mãn điều kiện hiển thị an toàn.
- [ ] **Extract Task 2.2: Trích xuất cơ chế đọc tồn kho an toàn (Aggregate Stock vs Real-time Cards)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `recalcProductAggregates`, `getLiveCardStats`).
  - *Logic xử lý:* Ngăn cấm frontend/backend truy vấn live trực tiếp count bảng `cards` gây chậm database. Toàn bộ logic hiển thị tồn kho phải được đọc trực tiếp từ các trường aggregate cache (`stockCount`, `lockedCount`, `soldCount`) trên bảng `products`. Khi có thao tác mua/nạp thẻ, backend chạy ngầm recalculate lại 3 trường này.
  - *Output:* Số lượng tồn kho và số lượng đang bị giữ (locked) chính xác của sản phẩm.
- [ ] **Extract Task 2.3: Trích xuất logic Tìm kiếm, Phân trang và Sắp xếp**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `searchActiveProducts`), `src/components/search-content.tsx`.
  - *Input:* Tham số `q` (từ khóa), `category`, `page` (phân trang), và `sort` (hot, priceAsc, priceDesc, stockDesc).
  - *Logic xử lý:* Tìm kiếm text dùng `LIKE` trên cả `name` và `description`. Sắp xếp `hot`: ưu tiên sản phẩm nổi bật `isHot = 1` lên đầu, sau đó theo thứ tự `sortOrder ASC` và `createdAt DESC`. Trả về metadata phân trang đầy đủ thay vì để FE tính.
  - *Output:* Payload JSON chứa danh sách sản phẩm phân trang `{ items, totalItems, totalPages, currentPage }`.
- [ ] **Extract Task 2.4: Trích xuất logic giới hạn mua tối đa ở trang chi tiết (Purchase Limit)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `getProduct`), `src/components/buy-content.tsx`.
  - *Input:* Product ID, User ID/Email hiện tại.
  - *Logic xử lý:* Lấy cấu hình giới hạn `purchaseLimit`. Thực hiện đếm tổng số lượng (`quantity`) các đơn hàng thành công hoặc đang chờ thanh toán (không tính `cancelled`, `refunded`, `failed`) của user này trong lịch sử. Tính toán số lượng tối đa FE được hiển thị trên input: `maxPurchaseable = min(stock thực có sẵn, purchaseLimit - userBoughtCount)`.
  - *Output:* Trả về chi tiết sản phẩm kèm thuộc tính `maxPurchaseableQuantity`.

#### 🛒 Module 3: Checkout & Payment (Thanh toán & Đơn hàng mới)
- [ ] **Extract Task 3.1: Trích xuất API tính toán giá tiền (Price Preview)**
  - *Nguồn trích xuất:* `src/actions/checkout.ts`, `src/components/buy-button.tsx`.
  - *Input:* Product ID, số lượng mua (`quantity`), cờ `usePoints` (có dùng điểm tích lũy không), User ID.
  - *Logic xử lý:*
    - Tính giá gốc: `numericalPrice = quantity * product.price`.
    - Tính điểm thưởng sử dụng: `pointsToUse = if (usePoints) min(user.points, ceil(numericalPrice)) else 0`.
    - Tính giá cuối: `finalPrice = max(0, numericalPrice - pointsToUse)`.
  - *Output:* JSON chứa `{ numericalPrice, pointsToUse, finalPrice }` để hiển thị tức thời trên UI.
- [ ] **Extract Task 3.2: Trích xuất quy trình giữ thẻ nguyên tử (Atomic Stock Reservation)**
  - *Nguồn trích xuất:* `src/actions/checkout.ts` (hàm `createOrder`).
  - *Input:* Yêu cầu mua của User (sản phẩm, số lượng, email).
  - *Logic xử lý:* Thực hiện cập nhật giữ thẻ an toàn bằng câu lệnh UPDATE RETURNING đơn lẻ (atomic) trên SQLite: Tìm `quantity` thẻ thỏa mãn `productId`, chưa sử dụng (`isUsed = 0`), chưa bị khóa (`reservedAt` IS NULL hoặc đã quá 5 phút), tiến hành cập nhật `reservedOrderId = orderId` và `reservedAt = Date.now()`.
  - *Output:* Khóa tạm thời thành công các thẻ trong kho để chuẩn bị thanh toán.
- [ ] **Extract Task 3.3: Trích xuất quy trình xử lý sản phẩm dùng chung (Shared Product Logic)**
  - *Nguồn trích xuất:* `src/actions/checkout.ts`.
  - *Logic xử lý:* Nếu sản phẩm có thuộc tính `isShared = 1`, hệ thống bỏ qua toàn bộ logic đặt khóa reserve thẻ. Chỉ cần kiểm tra có ít nhất 1 thẻ trống tồn tại trong kho là coi như stock vô hạn. Khi giao dịch hoàn tất, lấy ngẫu nhiên 1 thẻ và copy key giao cho khách hàng mà không cập nhật `isUsed = 1` của thẻ này.
- [ ] **Extract Task 3.4: Trích xuất luồng thanh toán đơn hàng 0 đồng (Zero-Price Flow)**
  - *Nguồn trích xuất:* `src/actions/checkout.ts`, `src/actions/payment.ts`.
  - *Logic xử lý:* Nếu `finalPrice == 0` (do dùng điểm 100% hoặc giá sản phẩm bằng 0), hệ thống bỏ qua việc tạo link thanh toán gateway. Đơn hàng lập tức chuyển trạng thái sang `delivered`, trừ điểm vĩnh viễn trong số dư của user, ghi nhận thẻ đã sử dụng (`isUsed = 1`, `usedAt = now()`), và giao key tức thì.
  - *Output:* Redirect user thẳng tới trang nhận key thành công.
- [ ] **Extract Task 3.5: Trích xuất logic tích hợp Payment Gateway Epay**
  - *Nguồn trích xuất:* `src/lib/epay.ts`, `src/actions/checkout.ts`.
  - *Input:* Chi tiết hóa đơn mới được tạo ở trạng thái `pending`.
  - *Logic xử lý:* Thu thập cấu hình cổng thanh toán, sinh chữ ký số MD5 bảo mật dựa trên chuỗi tham số `{ epayId, amount, orderId, notifyUrl, signKey }`.
  - *Output:* Trả về JSON chứa `redirectUrl` và bộ mã `formParams` để Client tự động chuyển tiếp tới cổng thanh toán.

#### 📋 Module 4: Orders (Lịch sử & Quản lý đơn hàng)
- [ ] **Extract Task 4.1: Trích xuất bộ phân dịch trạng thái hiển thị (UI Status & Color Mapper)**
  - *Nguồn trích xuất:* `src/components/order-content.tsx`, `src/components/orders-content.tsx`.
  - *Input:* Mã trạng thái thô trong DB (`pending`, `paid`, `delivered`, `cancelled`, `refunded`, `failed`).
  - *Logic xử lý:* Backend tự động map và trả về các chuỗi hiển thị tương ứng (ví dụ: `Đã giao hàng`, `Chờ thanh toán`) và mã màu CSS tương ứng (như `green`, `orange`, `red`) để Client chỉ việc render trực tiếp mà không cần chứa mã xử lý.
  - *Output:* JSON đã được map sẵn thuộc tính `statusText` và `statusColor`.
- [ ] **Extract Task 4.2: Trích xuất logic bảo mật khóa thẻ (Card Key Masking)**
  - *Nguồn trích xuất:* `src/actions/order.ts`, `src/components/order-content.tsx`.
  - *Logic xử lý:* Khi user truy cập lịch sử đơn hàng, backend kiểm tra nghiêm ngặt: trường `cardKey` và danh sách mã thẻ chi tiết chỉ được phép gửi về client nếu trạng thái đơn hàng đã chuyển thành `delivered`. Các trạng thái khác bắt buộc giấu hoàn toàn dữ liệu này để tránh lộ code.
- [ ] **Extract Task 4.3: Trích xuất logic hủy đơn hàng chủ động & hoàn kho**
  - *Nguồn trích xuất:* `src/actions/order.ts` (hàm `cancelPendingOrder`).
  - *Input:* Order ID của đơn hàng đang ở trạng thái `pending`.
  - *Logic xử lý:* Chuyển đổi trạng thái đơn hàng thành `cancelled`. Tìm tất cả thẻ liên quan trong bảng `cards` đang bị lock bởi đơn hàng này và reset `reservedOrderId = null`, `reservedAt = null` để giải phóng tồn kho. Tiến hành hoàn trả lại đầy đủ số điểm thưởng đã áp dụng cho đơn hàng này vào tài khoản của User.
  - *Output:* Hủy đơn hàng và phục hồi tồn kho thành công.

#### 👤 Module 5: Profile & Điểm danh (Tài khoản & Điểm thưởng)
- [ ] **Extract Task 5.1: Trích xuất logic xác thực và cộng điểm khi điểm danh (Daily Check-in)**
  - *Nguồn trích xuất:* `src/actions/points.ts` (hàm `checkIn`), `src/lib/db/queries.ts`.
  - *Input:* Thao tác click điểm danh, User ID.
  - *Logic xử lý:* 
    - Kiểm tra xem hôm nay user đã điểm danh chưa bằng cách quét log trong bảng `daily_checkins_v2`.
    - Tính toán streak liên tục: Nếu khoảng cách thời gian từ lần điểm danh trước là đúng 1 ngày (múi giờ hệ thống), `consecutiveDays = consecutiveDays + 1`, nếu quá 1 ngày thì reset chuỗi về bằng 1.
    - Cộng điểm thưởng: Tính tổng điểm (`basePoints + streakBonus`) cộng vào trường `points` của user và lưu log mới vào bảng điểm danh.
  - *Output:* Trả về kết quả điểm danh thành công kèm số điểm được cộng và chuỗi ngày streak mới.
- [ ] **Extract Task 5.2: Trích xuất API tổng hợp dữ liệu Profile Dashboard**
  - *Nguồn trích xuất:* `src/actions/profile.ts`, `src/components/profile-content.tsx`.
  - *Input:* User ID hiện tại.
  - *Logic xử lý:* Thực hiện gộp các truy vấn để lấy ra số dư điểm, trạng thái điểm danh hôm nay (`hasCheckedInToday`), chuỗi streak liên tục (`consecutiveDays`), và đếm tổng số lượng đơn hàng phân loại theo từng trạng thái để hiển thị biểu đồ thống kê.
  - *Output:* Payload JSON gộp `{ pointsBalance, hasCheckedInToday, consecutiveCheckinDays, orderStats: { total, pending, delivered } }`.

#### 🌟 Module 6: Wishlist & Reviews (Sản phẩm mong ước & Đánh giá)
- [ ] **Extract Task 6.1: Trích xuất logic truy vấn & tương tác Wishlist**
  - *Nguồn trích xuất:* `src/actions/wishlist.ts`, `src/lib/db/queries.ts` (hàm `getWishlistItems`).
  - *Input:* Thao tác upvote/downvote từ User.
  - *Logic xử lý:* 
    - Thực hiện SQL JOIN giữa `wishlist_items` và `wishlist_votes` để tính tổng số lượt bình chọn (`totalVotes`).
    - Tính cờ `hasVoted` bằng cách kiểm tra sự tồn tại của bản ghi chứa `{ itemId, userId }` trong bảng `wishlist_votes`.
  - *Output:* Mảng JSON wishlist được tổng hợp sẵn thông tin lượt vote và trạng thái đã vote của user hiện hành.
- [ ] **Extract Task 6.2: Trích xuất logic ràng buộc viết đánh giá sản phẩm (Review Constraints)**
  - *Nguồn trích xuất:* `src/actions/reviews.ts` (hàm `submitReview`), `src/lib/db/queries.ts` (hàm `canUserReview`).
  - *Input:* Product ID, Order ID, Số sao đánh giá (1-5), nội dung bình luận từ User.
  - *Logic xử lý:* Ràng buộc backend nghiêm ngặt: Chỉ cho phép lưu đánh giá khi user đã mua sản phẩm này, đơn hàng tương ứng ở trạng thái `delivered` và đơn hàng đó chưa từng được tạo review trước đây.
  - *Output:* Tạo review thành công và ghi log vào database.
- [ ] **Extract Task 6.3: Trích xuất luồng tự động tính toán lại đánh giá sản phẩm (Rating Aggregation)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `getProductRating`, `createReview`).
  - *Logic xử lý:* Khi có review mới được ghi nhận thành công, backend tự động chạy câu lệnh SQL để tính toán trung bình cộng số sao và tổng số review của sản phẩm đó, sau đó cập nhật trực tiếp vào hai trường `rating` và `reviewCount` trên bảng `products`.

#### 🔔 Module 7: Notifications (Hộp thư & Thông báo)
- [ ] **Extract Task 7.1: Trích xuất logic đồng bộ hộp thư tổng hợp (Unified Inbox)**
  - *Nguồn trích xuất:* `src/actions/user-notifications.ts`, `src/components/profile-content.tsx`.
  - *Input:* User ID.
  - *Logic xử lý:* Gộp chung và sắp xếp theo thời gian hai nguồn thông báo: thông báo riêng tư cho từng cá nhân (`user_notifications`) và các thông báo hệ thống chung (`broadcast_messages`).
  - *Output:* Danh sách thông báo đồng nhất gửi về Client.
- [ ] **Extract Task 7.2: Trích xuất logic tính toán số thông báo chưa đọc (Unread Count)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `getUserUnreadNotificationCount`), `src/components/header-client-parts.tsx`.
  - *Logic xử lý:* Tính tổng số thông báo chưa đọc bao gồm: thông báo riêng có `isRead = 0` cộng với các thông báo hệ thống `broadcast_messages` mà chưa có bản ghi ghi nhận đã đọc của user đó trong bảng `broadcast_reads`.
  - *Output:* Trả về thuộc tính `unreadCount` trực tiếp về client để hiển thị chấm đỏ trên Header.

#### 👑 Module 8: Admin Dashboard (Trang quản trị)
- [ ] **Extract Task 8.1: Trích xuất logic xác thực phân quyền quản trị (Admin Protection)**
  - *Nguồn trích xuất:* `src/lib/admin-auth.ts`, `src/actions/admin.ts`.
  - *Input:* Username của người gửi request.
  - *Logic xử lý:* Kiểm tra nghiêm ngặt xem username có nằm trong danh sách phân tách bằng dấu phẩy của biến môi trường `ADMIN_USERNAMES` hay không. Nếu không thỏa mãn, chặn ngay từ middleware/API level và trả về lỗi 403 Forbidden.
- [ ] **Extract Task 8.2: Trích xuất các câu lệnh tổng hợp số liệu kinh doanh (Admin Metrics)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `getDashboardStats`).
  - *Logic xử lý:* Chạy lệnh SQL aggregate tính toán tổng doanh thu trong ngày (`SUM(amount)` của đơn hàng `paid` và `delivered`), đếm số lượng thẻ kho bị hết hạn, và số lượng đơn hàng đang chờ xử lý.
  - *Output:* Payload JSON chứa `{ totalRevenueToday, totalOrdersPending, totalCardsExpired }` để hiển thị trên dashboard admin.
- [ ] **Extract Task 8.3: Trích xuất tiến trình tự động dọn dẹp kho thẻ hết hạn (Background Reservation Cleanup)**
  - *Nguồn trích xuất:* `src/lib/db/queries.ts` (hàm `cleanupExpiredCardsIfNeeded`, `cancelExpiredOrders`).
  - *Logic xử lý:* Định kỳ quét bảng `cards` tìm các bản ghi có `reservedAt` quá 5 phút so với hiện tại. Tìm đơn hàng `pending` liên quan để hủy bỏ đơn hàng, hoàn điểm cho user, và chuyển các thẻ này về trạng thái tự do (`reservedOrderId = null`, `reservedAt = null`) để nạp lại vào kho khả dụng.
  - *Output:* Giải phóng thành công kho thẻ bị treo thanh toán.

---

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
