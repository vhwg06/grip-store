# Database Schema Documentation

This document describes the SQLite database schema used by the application, extracted from `src/lib/db/schema.ts`. All `createdAt`, `updatedAt`, and other timestamp fields are stored as `INTEGER` representing milliseconds since the Unix epoch.

## 1. `products` (Sản phẩm)
Lưu trữ thông tin về sản phẩm đang bán trên cửa hàng.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `TEXT` | `PRIMARY KEY` | ID của sản phẩm (thường là string slug hoặc UUID). |
| `name` | `TEXT` | `NOT NULL` | Tên sản phẩm. |
| `description` | `TEXT` | | Mô tả chi tiết sản phẩm. |
| `price` | `TEXT` | `NOT NULL` | Giá bán. Do SQLite không có kiểu Decimal, sử dụng TEXT để giữ độ chính xác. |
| `compareAtPrice`| `TEXT` | | Giá so sánh (giá gốc trước khi giảm). |
| `category` | `TEXT` | | Phân loại sản phẩm. |
| `image` | `TEXT` | | URL ảnh đại diện sản phẩm. |
| `isHot` | `INTEGER`| `DEFAULT 0` (false)| Đánh dấu sản phẩm nổi bật/hot. |
| `isActive` | `INTEGER`| `DEFAULT 1` (true) | Trạng thái hiển thị/bán của sản phẩm. |
| `isShared` | `INTEGER`| `DEFAULT 0` (false)| Đánh dấu sản phẩm dùng chung (nhiều người mua nhận chung 1 card key). |
| `sortOrder` | `INTEGER`| `DEFAULT 0` | Thứ tự sắp xếp hiển thị. |
| `purchaseLimit` | `INTEGER`| | Giới hạn số lượng mua tối đa cho mỗi user. |
| `purchaseWarning`| `TEXT` | | Cảnh báo hiển thị trước khi user mua hàng. |
| `visibilityLevel`| `INTEGER`| `DEFAULT -1` | Quyền xem: `-1`=public, `0`=logged-in, `>0`=trust_level tối thiểu. |
| `stockCount` | `INTEGER`| `DEFAULT 0` | Số lượng tồn kho hiện tại (thường là denormalized từ số lượng `cards` chưa dùng). |
| `lockedCount` | `INTEGER`| `DEFAULT 0` | Số lượng thẻ đang bị lock/reserved chờ thanh toán. |
| `soldCount` | `INTEGER`| `DEFAULT 0` | Số lượng thẻ đã bán. |
| `rating` | `REAL/INT`| `DEFAULT 0` | Điểm đánh giá trung bình. |
| `reviewCount` | `INTEGER`| `DEFAULT 0` | Tổng số lượng đánh giá. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| Timestamp (ms). |

## 2. `cards` (Thẻ hàng/Stock)
Chứa các key/code thực tế sẽ giao cho khách hàng sau khi thanh toán.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | ID tự tăng. |
| `productId` | `TEXT` | `NOT NULL`, `REFERENCES products(id) ON DELETE CASCADE` | Thuộc về sản phẩm nào. |
| `cardKey` | `TEXT` | `NOT NULL` | Nội dung thẻ/key thực tế. |
| `isUsed` | `INTEGER`| `DEFAULT 0` (false) | Đã được sử dụng/bán thành công hay chưa. |
| `reservedOrderId`| `TEXT` | | ID của đơn hàng đang giữ (reserve) thẻ này. |
| `reservedAt` | `INTEGER`| | Thời điểm bắt đầu giữ thẻ. Thẻ sẽ bị thả ra nếu quá `RESERVATION_TTL_MS`. |
| `expiresAt` | `INTEGER`| | Hạn sử dụng của thẻ. |
| `usedAt` | `INTEGER`| | Thời điểm thẻ được giao thành công cho khách. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| Timestamp (ms). |

## 3. `orders` (Đơn hàng)
Quản lý trạng thái và thông tin giao dịch mua hàng.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `orderId` | `TEXT` | `PRIMARY KEY` | ID đơn hàng. |
| `productId` | `TEXT` | `NOT NULL` | ID sản phẩm được mua. |
| `productName` | `TEXT` | `NOT NULL` | Snapshot tên sản phẩm tại thời điểm mua. |
| `amount` | `TEXT` | `NOT NULL` | Tổng tiền thanh toán (sau khi đã trừ điểm). |
| `email` | `TEXT` | | Email nhận thông tin đơn hàng. |
| `status` | `TEXT` | `DEFAULT 'pending'` | Trạng thái: `pending`, `paid`, `delivered`, `failed`, `refunded`, `cancelled`. |
| `tradeNo` | `TEXT` | | Mã giao dịch từ cổng thanh toán. |
| `cardKey` | `TEXT` | | Nội dung thẻ đã giao cho khách. |
| `cardIds` | `TEXT` | | ID của các thẻ (cards) tương ứng với đơn hàng. |
| `paidAt` | `INTEGER`| | Thời điểm thanh toán thành công. |
| `deliveredAt` | `INTEGER`| | Thời điểm giao thẻ thành công. |
| `userId` | `TEXT` | | ID user mua hàng (nếu có đăng nhập). |
| `username` | `TEXT` | | Snapshot username tại thời điểm mua. |
| `payee` | `TEXT` | | Thông tin người thanh toán (nếu có). |
| `pointsUsed` | `INTEGER`| `DEFAULT 0` | Số điểm đã dùng để giảm giá cho đơn hàng này. |
| `quantity` | `INTEGER`| `NOT NULL`, `DEFAULT 1` | Số lượng mua. |
| `currentPaymentId`| `TEXT` | | ID phiên thanh toán hiện tại trên gateway. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| Timestamp (ms). |

## 4. `login_users` (Người dùng)
Lưu thông tin user đăng nhập qua OAuth.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `userId` | `TEXT` | `PRIMARY KEY` | Format: chuỗi số (LinuxDO) hoặc `github:{id}`. |
| `username` | `TEXT` | | Tên hiển thị. |
| `email` | `TEXT` | | Email người dùng. |
| `points` | `INTEGER`| `NOT NULL`, `DEFAULT 0` | Số dư điểm thưởng hiện tại. |
| `isBlocked` | `INTEGER`| `DEFAULT 0` (false) | User có bị khóa tài khoản không. |
| `desktopNotificationsEnabled`| `INTEGER`| `DEFAULT 0` (false) | Cấu hình nhận thông báo desktop. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| Timestamp (ms). |
| `lastLoginAt` | `INTEGER`| `DEFAULT Date.now()`| Lần đăng nhập cuối. |
| `lastCheckinAt` | `INTEGER`| | Lần điểm danh (check-in) cuối. |
| `consecutiveDays`| `INTEGER`| `DEFAULT 0` | Số ngày điểm danh liên tiếp. |

## 5. `daily_checkins_v2` (Lịch sử điểm danh)
Lưu lịch sử điểm danh hàng ngày của user.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `userId` | `TEXT` | `NOT NULL`, `REFERENCES login_users(userId) ON DELETE CASCADE`| Người điểm danh. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| Thời điểm điểm danh. |

*(Business logic check in 1 lần/ngày được quản lý ở application level hoặc qua việc kiểm tra date của createdAt).*

## 6. `settings` (Cài đặt hệ thống)
Lưu cấu hình hệ thống dạng Key-Value.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `key` | `TEXT` | `PRIMARY KEY` | Tên cấu hình (vd: `shop_name`, `theme_color`). |
| `value` | `TEXT` | | Giá trị cấu hình. |
| `updatedAt` | `INTEGER`| `DEFAULT Date.now()`| Lần cập nhật cuối. |

## 7. `reviews` (Đánh giá)
Lưu các lượt đánh giá sản phẩm từ người dùng.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `productId` | `TEXT` | `NOT NULL`, `REFERENCES products(id) ON DELETE CASCADE`| |
| `orderId` | `TEXT` | `NOT NULL` | ID đơn hàng dùng để xác thực việc mua. |
| `userId` | `TEXT` | `NOT NULL` | Người đánh giá. |
| `username` | `TEXT` | `NOT NULL` | Tên người đánh giá. |
| `rating` | `INTEGER`| `NOT NULL` | Điểm đánh giá (1-5 stars). |
| `comment` | `TEXT` | | Nội dung đánh giá. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

## 8. `categories` (Danh mục)
Lưu trữ danh mục sản phẩm.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `name` | `TEXT` | `NOT NULL` | Tên danh mục. |
| `icon` | `TEXT` | | URL/Class của icon danh mục. |
| `sortOrder` | `INTEGER`| `DEFAULT 0` | Thứ tự sắp xếp. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |
| `updatedAt` | `INTEGER`| `DEFAULT Date.now()`| |

## 9. `refund_requests` (Yêu cầu hoàn tiền)
Lưu các yêu cầu hoàn tiền do user tạo hoặc hệ thống tự động sinh ra khi proxy refund thất bại.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `orderId` | `TEXT` | `NOT NULL` | ID đơn hàng cần hoàn tiền. |
| `userId` | `TEXT` | | User yêu cầu. |
| `username` | `TEXT` | | Tên user yêu cầu. |
| `reason` | `TEXT` | | Lý do hoàn tiền. |
| `status` | `TEXT` | `DEFAULT 'pending'` | `pending`, `approved`, `rejected`, `processed`. |
| `adminUsername` | `TEXT` | | Admin xử lý yêu cầu. |
| `adminNote` | `TEXT` | | Ghi chú của admin khi duyệt/từ chối. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |
| `updatedAt` | `INTEGER`| `DEFAULT Date.now()`| |
| `processedAt` | `INTEGER`| | |

## 10. `user_notifications` (Thông báo cá nhân)
Gửi thông báo trực tiếp tới một user cụ thể (vd: giao hàng, hoàn tiền).

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `userId` | `TEXT` | `NOT NULL`, `REFERENCES login_users(userId) ON DELETE CASCADE`| Người nhận. |
| `type` | `TEXT` | `NOT NULL` | Phân loại (`order_delivered`, `refund_approved`, v.v.). |
| `titleKey` | `TEXT` | `NOT NULL` | i18n key cho tiêu đề. |
| `contentKey` | `TEXT` | `NOT NULL` | i18n key cho nội dung. |
| `data` | `TEXT` | | JSON string chứa dữ liệu động (như `orderId`). |
| `isRead` | `INTEGER`| `DEFAULT 0` (false) | Trạng thái đọc. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

## 11. `admin_messages` (Tin nhắn từ Admin)
Lưu lịch sử các tin nhắn gửi đi từ Admin dashboard.

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `targetType` | `TEXT` | `NOT NULL` | Đối tượng nhận: `all`, `username`, `userId`. |
| `targetValue` | `TEXT` | | Giá trị đối tượng (tùy targetType). |
| `title` | `TEXT` | `NOT NULL` | Tiêu đề tin nhắn. |
| `body` | `TEXT` | `NOT NULL` | Nội dung tin nhắn. |
| `sender` | `TEXT` | | Username của Admin gửi. |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

## 12. `user_messages` (Inbox tin nhắn user)
*(Tương tự user_notifications nhưng thường dùng cho hệ thống thư riêng)*

| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `userId` | `TEXT` | `NOT NULL`, `REFERENCES login_users(userId) ON DELETE CASCADE`| |
| `username` | `TEXT` | | |
| `title` | `TEXT` | `NOT NULL` | |
| `body` | `TEXT` | `NOT NULL` | |
| `isRead` | `INTEGER`| `DEFAULT 0` (false) | |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

## 13. `broadcast_messages` & `broadcast_reads`
Tin nhắn thông báo chung cho toàn hệ thống và bảng track trạng thái đã đọc của từng user.

**`broadcast_messages`**
| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `title` | `TEXT` | `NOT NULL` | |
| `body` | `TEXT` | `NOT NULL` | |
| `sender` | `TEXT` | | |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

**`broadcast_reads`**
| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `messageId` | `INTEGER`| `NOT NULL`, `REFERENCES broadcast_messages(id) ON DELETE CASCADE`| |
| `userId` | `TEXT` | `NOT NULL`, `REFERENCES login_users(userId) ON DELETE CASCADE`| |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

## 14. `wishlist_items` & `wishlist_votes`
Tính năng wishlist (user gợi ý thêm sản phẩm) và vote up/down.

**`wishlist_items`**
| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `title` | `TEXT` | `NOT NULL` | Tên tính năng/sản phẩm gợi ý. |
| `description` | `TEXT` | | Mô tả chi tiết. |
| `userId` | `TEXT` | | |
| `username` | `TEXT` | | |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |

**`wishlist_votes`**
| Column | Type | Constraints / Default | Description |
|--------|------|-----------------------|-------------|
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT` | |
| `itemId` | `INTEGER`| `NOT NULL`, `REFERENCES wishlist_items(id) ON DELETE CASCADE`| |
| `userId` | `TEXT` | `NOT NULL`, `REFERENCES login_users(userId) ON DELETE CASCADE`| |
| `createdAt` | `INTEGER`| `DEFAULT Date.now()`| |
