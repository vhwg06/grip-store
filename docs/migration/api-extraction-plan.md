# Kế Hoạch Bóc Tách Business Logic & Xây Dựng API Spec (Deliverable 1)

Mục tiêu của bản kế hoạch này là "chẻ nhỏ" (break down) công việc bóc tách logic cho từng module. Với mỗi module, mình sẽ định vị chính xác những file gốc cần đọc (extract từ đâu) để đảm bảo không bỏ sót bất kỳ tính toán ngầm nào của FE. Đồng thời quy định rõ chuẩn Input và Output cuối cùng (Dumb Frontend).

---

## Task Breakdown chi tiết theo Module

### Task 1: Bóc tách Module 1 (Auth & User Identity)
* **Extract từ đâu:**
  - `src/lib/auth.ts` (NextAuth configs, luồng JWT, callbacks).
  - `src/app/api/auth/[...nextauth]/route.ts` (API routes).
  - `src/components/signin-button.tsx`, `src/components/header-client-parts.tsx`.
* **Input cần nhận diện:**
  - Authorization code từ OAuth Providers (LinuxDO, GitHub).
  - Cookie JWT từ Client.
* **Output (API Spec):**
  - **API Merge Account:** Xác định thuật toán khi 1 user login bằng GitHub nhưng email/username bị trùng với LinuxDO. Trả về Token.
  - **API Get Profile (`/me`):** Thay vì để FE check session lỏng lẻo, API phải trả về toàn bộ flags: `{ id, username, email, trustLevel, isAdmin, canReview, avatar }`.

### Task 2: Bóc tách Module 2 (Catalog & Products)
* **Extract từ đâu:**
  - `src/lib/db/queries.ts` (Hàm `getActiveProducts`, `searchActiveProducts`, `getProductVisibility`).
  - `src/components/home-content.tsx`, `src/components/search-content.tsx`.
* **Input cần nhận diện:**
  - Lọc (category, query string, sort_by).
  - Trạng thái User (Guest hay Logged in, trustLevel bao nhiêu).
* **Output (API Spec):**
  - **Logic Ẩn Sản Phẩm:** Công thức so sánh `visibilityLevel` với `trustLevel` của user. Khách vãng lai = `-1`.
  - **Logic Tồn Kho Ảo:** Trả về `{ stockCount, lockedCount, soldCount }` từ cột aggregate thay vì JOIN. FE không được trừ số lượng.
  - **Phân trang Search:** Tính luôn tổng số trang `totalPages` trả về kèm data.

### Task 3: Bóc tách Module 3 (Checkout & Payment - Rất quan trọng)
* **Extract từ đâu:**
  - `src/actions/checkout.ts`, `src/lib/epay.ts`.
  - `src/components/buy-button.tsx`, `src/components/buy-content.tsx`.
  - `src/app/buy/[id]/page.tsx`.
* **Input cần nhận diện:**
  - `productId`, `quantity`, `usePoints` (boolean), `userEmail`.
* **Output (API Spec):**
  - **API Tính Tiền (Preview):** FE gửi Input lên, BE tính toán và trả về chính xác: `{ numericalPrice, pointsToUse, finalPrice }`. Không để FE tự tính bằng Javascript.
  - **Giới hạn số lượng mua:** Trả về con số `maxPurchaseableQuantity` (đã trừ đi số thẻ user đã mua trước đó). FE chỉ việc binding vào max của thẻ Input.
  - **Giữ chỗ thẻ (Lock):** Khi Submit, BE phải xử lý Reserve Card.
  - **Thanh toán bằng Điểm (Zero-price flow):** Logic hoàn thành đơn hàng tự động mà không qua Epay. Trả về URL dẫn thẳng tới kho thẻ.

### Task 4: Bóc tách Module 4 (Orders)
* **Extract từ đâu:**
  - `src/actions/order.ts`, `src/actions/refund-requests.ts`.
  - `src/components/order-content.tsx`, `src/components/orders-content.tsx`.
* **Input cần nhận diện:**
  - `orderId`, `userId`, `reason` (cho việc xin hoàn tiền).
* **Output (API Spec):**
  - **Bảo vệ Card Key:** API chi tiết Order chỉ trả về trường `cardKey` (mã thẻ) NẾU VÀ CHỈ NẾU `status === 'delivered'`.
  - **Dumb Status UI:** API trả về mảng `{ id, amount, statusText: "Chờ thanh toán", statusColor: "orange" }` để FE hiển thị mà không cần map if/else.
  - **Hủy Đơn (Cancel):** Backend update Order thành `cancelled` và phải xử lý logic nhả cờ `reserved` trên bảng Cards.

### Task 5: Bóc tách Module 5 (Profile & Điểm danh)
* **Extract từ đâu:**
  - `src/actions/points.ts`, `src/actions/profile.ts`.
  - `src/components/profile-content.tsx`, `src/components/checkin-button.tsx`.
  - `src/app/profile/page.tsx`.
* **Input cần nhận diện:**
  - Hành động Check-in, Submit cập nhật Email.
* **Output (API Spec):**
  - **API Dashboard Tổng Hợp:** Gộp thông tin cá nhân, tổng điểm, chuỗi check-in, số lượng đơn hàng (pending/delivered) thành 1 payload JSON duy nhất để FE render không cần Fetch nhiều lần.
  - **Logic Điểm Danh:** BE trả về `{ hasCheckedInToday: true/false, consecutiveDays: N }` thay vì FE tự kiểm tra ngày lưu cục bộ. Trả số điểm thưởng cụ thể khi thao tác thành công.

### Task 6: Bóc tách Module 6 (Wishlist & Reviews)
* **Extract từ đâu:**
  - `src/actions/wishlist.ts`, `src/actions/reviews.ts`.
  - `src/components/wishlist-section.tsx`, `src/components/review-form.tsx`.
* **Input cần nhận diện:**
  - `productId`, `title`, `description`, `rating`.
* **Output (API Spec):**
  - **Logic Wishlist Vote:** BE join bảng votes, trả về `{ totalVotes: N, hasVoted: boolean }`. FE không cần làm vòng lặp để đếm xem user đang đăng nhập có trong mảng vote hay không.
  - **Điều kiện Đánh giá:** Validate backend bắt buộc user phải có đơn hàng status `delivered` thuộc productId này mới cho ghi Review. Cập nhật thẳng `averageRating` vào bảng Product.

### Task 7: Bóc tách Module 7 (Notifications)
* **Extract từ đâu:**
  - `src/actions/user-notifications.ts`, `src/actions/admin-messages.ts`.
  - `src/components/profile-content.tsx` (phần hòm thư).
* **Input cần nhận diện:**
  - Request lấy thông báo, Đánh dấu đã đọc.
* **Output (API Spec):**
  - **Merge Thông báo chung/riêng:** Thuật toán gộp mảng tin cá nhân và tin Broadcast.
  - **Đếm số chưa đọc:** Trả về biến `unreadCount: N` thẳng từ API danh sách thông báo để FE vẽ cái "chấm đỏ" trên thanh header, thay vì bắt FE `filter(n => !n.isRead).length`.

### Task 8: Bóc tách Module 8 (Admin Dashboard)
* **Extract từ đâu:**
  - `src/actions/admin.ts`, `src/actions/admin-orders.ts`, `src/actions/admin-users.ts`.
  - Các components trong `src/app/admin/`.
* **Input cần nhận diện:**
  - Payload tạo/sửa Product, duyệt Order, config Settings.
* **Output (API Spec):**
  - **Stats Aggregation:** API `/admin/dashboard` phải tính toán sẵn `{ totalRevenue, expiredCards, newOrders }` thông qua SQL sum/count. Ngăn chặn tuyệt đối việc FE gọi API "Lấy tất cả Orders" về rồi tự Reduce để đếm tổng doanh thu (gây sập trình duyệt).
