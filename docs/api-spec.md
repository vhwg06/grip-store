# Backend API Specification (Dumb Frontend & Decoupled Architecture)

Tài liệu này đặc tả chi tiết toàn bộ **39 REST API endpoints** của hệ thống Grip Store. Tất cả các API được thiết kế theo nguyên tắc **Dumb Frontend**: Frontend chỉ nhận dữ liệu tĩnh để hiển thị (bao gồm nhãn trạng thái hiển thị, màu sắc CSS, cờ phân quyền ẩn/hiện) và không chứa bất kỳ logic tính toán nghiệp vụ hay quy tắc nghiệp vụ phức tạp nào.

---

## 📦 2. Catalog & Products Module (Module 2)

### 2.1 `GET /api/catalog/products`
- **Vì sao cần API này (Business Requirement):** Hiển thị danh sách sản phẩm trang chủ. Phân quyền hiển thị theo Trust Level để chống mua đầu cơ hoặc spam.
- **Logic xử lý (Backend):**
  1. Lấy danh sách sản phẩm hoạt động (`isActive = 1`).
  2. **Bộ lọc Trust Level (Visibility Rules):** 
     Nếu user chưa đăng nhập, mặc định `trustLevel = -1`.
     Áp dụng điều kiện lọc SQL: `visibilityLevel <= user.trustLevel`.
  3. **Đọc dữ liệu Tồn kho đệm (Aggregate Stock Cache):**
     Không đếm live từ bảng `cards`. Bắt buộc đọc từ 3 trường aggregate cache (`stockCount`, `lockedCount`, `soldCount`) của bảng `products` để tránh sập cơ sở dữ liệu.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  [
    {
      "id": "item-giftcard-100",
      "name": "Thẻ quà tặng 100k",
      "price": "90000.00",
      "compareAtPrice": "100000.00",
      "image": "https://...",
      "stockCount": 42,
      "lockedCount": 1,
      "soldCount": 54,
      "rating": 4.7
    }
  ]
  ```

### 2.2 `GET /api/catalog/products/search`
- **Vì sao cần API này (Business Requirement):** Tìm kiếm và sắp xếp nâng cao kèm phân trang. Backend tự động chia trang để frontend chỉ việc vẽ giao diện.
- **Logic xử lý (Backend):**
  1. Áp dụng quy tắc lọc Visibility Level tương tự API 2.1.
  2. Lọc theo từ khóa `q` bằng cách so khớp `LOWER(name) LIKE %q%` hoặc `LOWER(description) LIKE %q%`.
  3. Áp dụng sắp xếp `sort`:
     - `hot`: Sản phẩm `isHot = 1` lên đầu, sau đó sắp xếp theo `sortOrder ASC`, `createdAt DESC`.
     - `priceAsc`: Sắp xếp theo đơn giá tăng dần.
     - `stockDesc`: Sắp xếp theo `(stockCount + lockedCount) DESC`.
  4. Trả về tổng số lượng và số trang khả dụng.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "items": [...],
    "totalItems": 48,
    "totalPages": 4,
    "currentPage": 1
  }
  ```

### 2.3 `GET /api/catalog/products/:id`
- **Vì sao cần API này (Business Requirement):** Xem trang chi tiết sản phẩm. Cung cấp trực tiếp số lượng giới hạn mua tối đa của user này để frontend khóa giới hạn của ô nhập số lượng mua (+/-).
- **Logic xử lý (Backend):**
  1. Lấy thông tin sản phẩm và kiểm tra quyền hiển thị (Visibility Level).
  2. **Thuật toán kiểm tra Purchase Limit:**
     Query tổng số lượng (`quantity`) đã mua của user hiện tại (đối chiếu theo `userId` hoặc `email` nhận hàng) của sản phẩm này trong bảng `orders` mà trạng thái khác `cancelled`, `refunded`, `failed`. Gọi tổng này là `userBoughtCount`.
     Tính toán số lượng tối đa được mua thêm:
     ```typescript
     const maxStock = product.isShared ? INFINITE_STOCK : (product.stockCount - product.lockedCount);
     const maxPurchaseable = Math.min(maxStock, (product.purchaseLimit - userBoughtCount));
     ```
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "product": { ... },
    "maxPurchaseableQuantity": 3
  }
  ```

### 2.4 `GET /api/catalog/categories`
- **Vì sao cần API này (Business Requirement):** Hiển thị thanh lọc phân loại sản phẩm trên trang chủ.
- **Logic xử lý (Backend):**
  - Truy vấn toàn bộ danh mục hoạt động từ bảng `categories`, sắp xếp theo `sortOrder ASC`.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  [
    { "id": 1, "name": "Thẻ quà tặng", "icon": "gift-icon", "sortOrder": 1 }
  ]
  ```

### 2.5 `GET /api/catalog/settings`
- **Vì sao cần API này (Business Requirement):** Lấy các thông số hiển thị giao diện động của cửa hàng (theme màu, tên shop, banner quảng cáo).
- **Logic xử lý (Backend):**
  - Đọc các cấu hình hệ thống dạng Key-Value từ bảng `settings` phù hợp với hiển thị công khai.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "shop_name": "Grip Store",
    "theme_color": "#4f46e5",
    "announcement_banner": "Chào mừng bạn đến với cửa hàng thẻ ảo!"
  }
  ```

---

## 🛒 3. Checkout & Payment Module (Module 3)

### 3.1 `GET /api/checkout/preview`
- **Vì sao cần API này (Business Requirement):** Tính toán đơn giá thực tế trực tiếp tại server khi thay đổi số lượng hoặc sử dụng điểm tích lũy. Không cho frontend tự nhân nhân đơn giá để tránh sai lệch khuyến mãi hoặc thuế phí.
- **Logic xử lý (Backend):**
  1. `numericalPrice = quantity * product.price`.
  2. **Áp dụng điểm tích lũy:**
     Nếu tích chọn dùng điểm (`usePoints = true`) và user có số dư điểm:
     ```typescript
     const pointsToUse = Math.min(user.points, Math.ceil(numericalPrice));
     const finalPrice = Math.max(0, numericalPrice - pointsToUse);
     ```
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "numericalPrice": 90000.00,
    "pointsToUse": 20,
    "finalPrice": 89980.00
  }
  ```

### 3.2 `POST /api/checkout/orders`
- **Vì sao cần API này (Business Requirement):** Đặt hàng, thực hiện khóa giữ thẻ trong kho và trả về link nạp tiền gateway.
- **Logic xử lý (Backend):**
  1. Kiểm tra tồn kho khả dụng và giới hạn mua (`purchaseLimit`).
  2. **Khóa kho giữ hàng (Atomic Stock Reservation):**
     Thực hiện một câu lệnh SQLite UPDATE RETURNING đơn lẻ nguyên tử:
     ```sql
     UPDATE cards
     SET reserved_order_id = ?, reserved_at = ?
     WHERE id = (
         SELECT id FROM cards
         WHERE product_id = ?
           AND (is_used = 0 OR is_used IS NULL)
           AND reserved_at IS NULL
           AND (expires_at IS NULL OR expires_at > ?)
         LIMIT 1
     )
     RETURNING id, card_key
     ```
  3. **Shared Product Logic:** Nếu `product.isShared = 1`, bỏ qua bước lock ở trên, lấy ngẫu nhiên 1 thẻ dùng chung để gán key mà không đặt `isUsed = 1`.
  4. **Luồng đơn hàng 0 đồng (Zero-Price Flow):**
     Nếu `finalPrice <= 0`, backend tự động đổi trạng thái đơn hàng sang `delivered`, trừ điểm vĩnh viễn, đánh dấu thẻ đã bán (`isUsed = 1`, `usedAt = now()`) và giao code ngay.
  5. **Tạo thông số chữ ký Epay (MD5 Sign):**
     Nếu đơn hàng > 0 đồng, sinh chữ ký số MD5 dựa trên các tham số cấu hình được sắp xếp alphabet loại bỏ trường rỗng:
     ```typescript
     // Trích từ src/lib/crypto.ts
     const sortedParams = "amount=90000.00&notify_url=...&out_trade_no=ORD123456&pid=1001";
     const sign = md5(sortedParams + merchant_key);
     ```
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "success": true,
    "instantDeliver": false,
    "redirectUrl": "https://connect.linux.do/epay/pay/submit.php",
    "formParams": {
      "pid": "1001",
      "out_trade_no": "ORD123456",
      "money": "90000.00",
      "sign": "a98f12d2ef43eab832ad14ef2",
      "sign_type": "MD5"
    }
  }
  ```

### 3.3 `POST /api/payment/notify`
- **Vì sao cần API này (Business Requirement):** Nhận webhook thông báo thanh toán thành công tự động từ Epay gateway để hoàn tất đơn hàng và giao thẻ cho khách.
- **Logic xử lý (Backend):**
  1. Xác minh chữ ký MD5 của request từ Epay gửi sang để chống giả mạo.
  2. Đối chiếu mã đơn hàng `out_trade_no`, lấy thông tin đơn hàng hiện tại.
  3. Nếu thanh toán thành công (`trade_status = TRADE_SUCCESS`):
     - Cập nhật đơn hàng thành `paid` rồi `delivered`.
     - Giải phóng cờ giữ thẻ và cập nhật `isUsed = 1`, `usedAt = now()`.
     - Gửi email thông báo nạp thẻ và bắn desktop notification.
- **Cấu trúc trả về (Dumb Frontend):** Chuỗi chữ `"success"` (định dạng Epay quy định).

---

## 📋 4. Orders Module (Module 4)

### 4.1 `GET /api/orders`
- **Vì sao cần API này (Business Requirement):** Lấy danh sách đơn hàng đã mua của user để hiển thị lịch sử giao dịch.
- **Logic xử lý (Backend):**
  1. Lấy danh sách đơn hàng từ bảng `orders` lọc theo `userId` hoặc trùng `email` nhận hàng.
  2. **Bản dịch trạng thái giao diện trực tiếp:** Backend ánh xạ mã trạng thái thô trong DB thành nhãn UI (`statusText`) và màu CSS hiển thị (`statusColor` như `green`, `orange`, `red`).
  3. **Ẩn khóa thẻ bảo mật:** Bắt buộc xóa bỏ hoặc đặt trường `cardKey` bằng `null` nếu đơn hàng có trạng thái khác `delivered`.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  [
    {
      "orderId": "ORD123456",
      "productName": "Thẻ quà tặng 100k",
      "amount": "90000.00",
      "statusText": "Đã giao hàng",
      "statusColor": "green",
      "cardKey": "GIFT-KEY-XYZ-123",
      "createdAt": 1716450000000
    }
  ]
  ```

### 4.2 `GET /api/orders/:id`
- **Vì sao cần API này (Business Requirement):** Hiển thị trang chi tiết một đơn hàng, giao diện nhận code thẻ ảo.
- **Logic xử lý (Backend):**
  1. Truy vấn đơn hàng theo ID và xác thực quyền truy cập của User.
  2. Áp dụng quy tắc dịch trạng thái và bảo mật khóa thẻ tương tự API 4.1.
- **Cấu trúc trả về (Dumb Frontend):** JSON chứa thông tin chi tiết một hóa đơn và key (nếu đã delivered).

### 4.3 `GET /api/orders/:id/status`
- **Vì sao cần API này (Business Requirement):** Client tự động gọi liên tục (polling) khi user đang ở trang chờ thanh toán để chuyển hướng ngay khi backend nhận webhook từ cổng nạp tiền.
- **Logic xử lý (Backend):**
  - Truy vấn trạng thái hiện tại của đơn hàng. Trả về trạng thái thô kèm theo nhãn UI.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "orderId": "ORD123456",
    "status": "delivered",
    "statusText": "Đã giao hàng",
    "statusColor": "green"
  }
  ```

### 4.4 `POST /api/orders/:id/cancel`
- **Vì sao cần API này (Business Requirement):** User từ chối thanh toán, muốn hủy đơn để nhả lại thẻ kho ngay lập tức.
- **Logic xử lý (Backend):**
  1. Xác minh đơn hàng ở trạng thái `pending`.
  2. Đổi trạng thái đơn hàng sang `cancelled`.
  3. Giải phóng các thẻ đang bị khóa bởi đơn hàng: đặt `reservedOrderId = null` và `reservedAt = null` trên bảng `cards`.
  4. Nếu có sử dụng điểm, hoàn lại số điểm tích lũy cho user.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 4.5 `POST /api/orders/:id/refund-request`
- **Vì sao cần API này (Business Requirement):** Khách hàng gửi yêu cầu hoàn tiền nếu thẻ/key gặp lỗi.
- **Logic xử lý (Backend):**
  1. Xác minh đơn hàng ở trạng thái `delivered` và thuộc về user.
  2. Tạo yêu cầu hoàn tiền mới trong bảng `refund_requests` ở trạng thái `pending`.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

---

## 👤 5. Profile & Điểm danh (Module 5)

### 5.1 `GET /api/profile`
- **Vì sao cần API này (Business Requirement):** Đổ dữ liệu Dashboard hồ sơ cá nhân.
- **Logic xử lý (Backend):**
  - Đồng bộ lấy số dư points, email, thông số điểm danh liên tục, và đếm tổng số lượng đơn hàng phân theo từng trạng thái.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "pointsBalance": 120,
    "hasCheckedInToday": true,
    "consecutiveCheckinDays": 3,
    "orderStats": { "total": 5, "pending": 0, "delivered": 5 }
  }
  ```

### 5.2 `PATCH /api/profile/email`
- **Vì sao cần API này (Business Requirement):** User cập nhật email để nhận mã thẻ key tự động qua email.
- **Logic xử lý (Backend):**
  1. Validate định dạng email gửi lên.
  2. Cập nhật trường `email` của user trong bảng `login_users`.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 5.3 `PATCH /api/profile/notifications`
- **Vì sao cần API này (Business Requirement):** Bật/tắt tùy chọn nhận thông báo đẩy trên desktop.
- **Logic xử lý (Backend):**
  - Cập nhật trường `desktopNotificationsEnabled` (1 hoặc 0) của user hiện hành.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 5.4 `POST /api/profile/checkin`
- **Vì sao cần API này (Business Requirement):** Điểm danh hàng ngày để tích lũy điểm thưởng mua sắm.
- **Logic xử lý (Backend):**
  1. Xác định mốc thời gian ngày hôm nay (`todayStartUtcMs`) và hôm qua (`yesterdayStartUtcMs`) theo múi giờ hệ thống (GMT+7).
  2. Thực hiện câu lệnh cập nhật an toàn tránh spam điểm danh (Atomic Streak Guard):
     ```sql
     UPDATE login_users
     SET points = points + ?,
         last_checkin_at = ?,
         consecutive_days = CASE 
             WHEN last_checkin_at IS NOT NULL 
                 AND last_checkin_at >= ? 
                 AND last_checkin_at < ?
             THEN COALESCE(consecutive_days, 0) + 1
             ELSE 1
         END
     WHERE user_id = ? 
       AND (last_checkin_at IS NULL OR last_checkin_at < ?)
     ```
  3. Ghi chép lịch sử điểm danh mới vào bảng `daily_checkins_v2`.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "success": true,
    "pointsEarned": 10,
    "consecutiveDays": 4
  }
  ```

---

## 🌟 6. Wishlist & Reviews Module (Module 6)

### 6.1 `GET /api/wishlist`
- **Vì sao cần API này (Business Requirement):** Hiển thị các sản phẩm do cộng đồng đề xuất nạp thêm kèm số lượt vote.
- **Logic xử lý (Backend):**
  1. Database thực hiện SQL JOIN giữa `wishlist_items` và `wishlist_votes`.
  2. Tính tổng vote: `totalVotes = COUNT(votes)`.
  3. Xác định cờ boolean `hasVoted` dựa vào việc userId hiện tại đã có bản ghi vote trong bảng `wishlist_votes` chưa.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  [
    {
      "id": 1,
      "title": "Thẻ Steam 5$",
      "totalVotes": 15,
      "hasVoted": true
    }
  ]
  ```

### 6.2 `POST /api/wishlist`
- **Vì sao cần API này (Business Requirement):** Đề xuất sản phẩm mới muốn mua.
- **Logic xử lý (Backend):**
  - Validate tiêu đề (`title`) và tạo bản ghi wishlist mới.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 6.3 `POST /api/wishlist/:id/vote`
- **Vì sao cần API này (Business Requirement):** Bấm vote/unvote sản phẩm đề xuất để backend tự động cộng/trừ lượt vote.
- **Logic xử lý (Backend):**
  - Kiểm tra xem đã vote chưa:
    - Nếu đã vote: Xóa bản ghi vote khỏi bảng `wishlist_votes` (downvote).
    - Nếu chưa vote: Tạo bản ghi vote mới (upvote).
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true, "hasVoted": false }`

### 6.4 `DELETE /api/wishlist/:id`
- **Vì sao cần API này (Business Requirement):** Gỡ bỏ sản phẩm wishlist (do chính chủ hoặc Admin thực hiện).
- **Logic xử lý (Backend):**
  - Xác thực quyền Admin hoặc quyền chính chủ sở hữu item, xóa item khỏi `wishlist_items`.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 6.5 `GET /api/products/:id/reviews`
- **Vì sao cần API này (Business Requirement):** Đọc danh sách rating và bình luận đánh giá ở trang chi tiết sản phẩm.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  [
    { "id": 1, "username": "gh_octo", "rating": 5, "comment": "Rất uy tín!", "createdAt": 1716450000000 }
  ]
  ```

### 6.6 `POST /api/products/:id/reviews`
- **Vì sao cần API này (Business Requirement):** Đánh giá sản phẩm đã mua.
- **Logic xử lý (Backend):**
  1. **Ràng buộc đánh giá:** Backend xác thực nghiêm ngặt user đã có đơn hàng `delivered` sản phẩm này và chưa đánh giá đơn hàng đó bao giờ.
  2. Tạo bản ghi review mới.
  3. Aggregate tính toán lại điểm đánh giá trung bình `rating` và tổng số `reviewCount` trực tiếp trên bảng `products`.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

---

## 🔔 7. Notifications Module (Module 7)

### 7.1 `GET /api/notifications`
- **Vì sao cần API này (Business Requirement):** Hiển thị hòm thư thông báo tổng hợp kèm số lượng chưa đọc của biểu tượng cái chuông trên Header.
- **Logic xử lý (Backend):**
  1. Gộp các thông báo riêng tư (`user_notifications`) và phát sóng hệ thống (`broadcast_messages`).
  2. Tính tổng số thông báo chưa đọc `unreadCount` bao gồm cả tin nhắn broadcast chưa có trạng thái đọc trong bảng `broadcast_reads`.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "items": [...],
    "unreadCount": 2
  }
  ```

### 7.2 `POST /api/notifications/:id/read`
- **Vì sao cần API này (Business Requirement):** Đánh dấu đã đọc một tin nhắn để tắt chấm đỏ thông báo.
- **Logic xử lý (Backend):**
  - Cập nhật `isRead = 1` của bản ghi thông báo trong DB.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 7.3 `POST /api/notifications/read-all`
- **Vì sao cần API này (Business Requirement):** Tiện ích "Đánh dấu tất cả đã đọc" của user.
- **Logic xử lý (Backend):**
  - Cập nhật toàn bộ thông báo riêng của user thành `isRead = 1`, đồng thời tạo log đọc cho tất cả thông báo broadcast hiện hành.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 7.4 `POST /api/notifications/clear`
- **Vì sao cần API này (Business Requirement):** Người dùng muốn dọn dẹp làm trống hòm thư.
- **Logic xử lý (Backend):**
  - Xóa toàn bộ bản ghi thông báo riêng của user khỏi bảng `user_notifications`.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

---

## 👑 8. Admin Module (Module 8)

### 8.1 `GET /api/admin/dashboard/stats`
- **Vì sao cần API này (Business Requirement):** Tổng hợp số liệu kinh doanh trên trang Dashboard quản trị.
- **Logic xử lý (Backend):**
  1. Chặn quyền truy cập nếu username không có trong `ADMIN_USERNAMES`.
  2. SQL aggregate doanh thu hôm nay (`SUM(amount)` đơn hàng thành công), số thẻ kho hết hạn và số hóa đơn pending.
- **Cấu trúc trả về (Dumb Frontend):**
  ```json
  {
    "totalRevenueToday": 1500000.00,
    "totalOrdersPending": 3,
    "totalCardsExpired": 0
  }
  ```

### 8.2 `GET/POST/PUT/DELETE /api/admin/products`
- **Vì sao cần API này (Business Requirement):** CRUD danh sách sản phẩm đăng bán.
- **Cấu trúc trả về (Dumb Frontend):** Trả về kết quả CRUD sản phẩm dạng JSON chuẩn.

### 8.3 `GET/POST/PUT/DELETE /api/admin/cards`
- **Vì sao cần API này (Business Requirement):** Nạp code key thẻ mới vào kho hàng hoặc xem thẻ kho.
- **Cấu trúc trả về (Dumb Frontend):** Trả về kết quả CRUD thẻ kho chi tiết dạng JSON chuẩn.

### 8.4 `GET/PUT /api/admin/orders`
- **Vì sao cần API này (Business Requirement):** Giám sát, quản lý và xử lý cập nhật trạng thái đơn hàng toàn sàn.
- **Cấu trúc trả về (Dumb Frontend):** Danh sách hóa đơn của tất cả khách hàng.

### 8.5 `GET/POST /api/admin/refunds`
- **Vì sao cần API này (Business Requirement):** Admin duyệt hoàn tiền hoặc bác bỏ yêu cầu của user.
- **Logic xử lý (Backend):**
  - Khi duyệt (`approved`): hoàn trả điểm tích lũy của đơn hàng đó vào tài khoản user, nhả thẻ kho đang giữ về trạng thái trống.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 8.6 `GET/PUT /api/admin/users`
- **Vì sao cần API này (Business Requirement):** Quản lý trạng thái khóa/mở tài khoản người dùng, sửa đổi điểm tích lũy thủ công.
- **Cấu trúc trả về (Dumb Frontend):** Danh sách người dùng kèm phân trang.

### 8.7 `GET/PUT /api/admin/settings`
- **Vì sao cần API này (Business Requirement):** Đọc ghi cấu hình hệ thống chuyên sâu (Key Epay, bảo trì shop).
- **Cấu trúc trả về (Dumb Frontend):** JSON cấu hình key-value đầy đủ.

### 8.8 `POST /api/admin/messages`
- **Vì sao cần API này (Business Requirement):** Gửi thông báo phát sóng (broadcast) cho tất cả user.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true }`

### 8.9 `POST /api/admin/cleanup`
- **Vì sao cần API này (Business Requirement):** Cron task chạy tự động để dọn kho giải phóng thẻ bị khóa thanh toán quá 5 phút.
- **Logic xử lý (Backend):**
  1. Quét bảng `cards` tìm các thẻ có `reservedAt` cũ hơn 5 phút.
  2. Hủy đơn hàng pending tương ứng, nhả thẻ kho về tự do, hoàn điểm nếu có.
- **Cấu trúc trả về (Dumb Frontend):** `{ "success": true, "cleanedCount": 3 }`
