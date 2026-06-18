# Contract: Admin Review Moderation API

Mục tiêu của contract này là mô tả API surface mong muốn cho tính năng `Review Moderation` theo đặc tả `006-admin-reviews`.

Contract này được sử dụng để:
- Kiểm tra tính phù hợp của code hiện tại.
- Viết API test trước khi bắt đầu viết code thực tế (Test-driven development).
- Hướng dẫn thiết kế schema dữ liệu backend.

---

## API Endpoints

### 1. Lấy danh sách đánh giá phục vụ kiểm duyệt
**`GET /v1/admin/reviews`**

**Query Parameters:**
- `status`: `PENDING` | `APPROVED` | `HIDDEN` | `FEATURED` (tùy chọn)
- `q`: string (tìm kiếm theo tên sản phẩm, tên người dùng, comment - tùy chọn)
- `page`: number (mặc định: `1`)
- `pageSize`: number (mặc định: `20`)

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "id": 101,
      "productId": "daytona-cnc-grip",
      "productName": "Daytona CNC Grip",
      "orderId": "ORD-88741",
      "userId": "usr_9982",
      "username": "customer_a",
      "rating": 5,
      "comment": "Bám chắc, không mỏi tay",
      "attachments": [
        "https://cdn.grip.vn/reviews/attachments/cnc-grip-1.webp"
      ],
      "status": "PENDING",
      "isVerifiedPurchase": true,
      "flaggedReason": null,
      "createdAt": "2026-06-17T10:00:00Z"
    },
    {
      "id": 102,
      "productId": "urban-shorty",
      "productName": "Urban Shorty",
      "orderId": "ORD-88742",
      "userId": "usr_8817",
      "username": "customer_b",
      "rating": 2,
      "comment": "Duplicate content warning here...",
      "attachments": [],
      "status": "PENDING",
      "isVerifiedPurchase": true,
      "flaggedReason": "duplicate_wording",
      "createdAt": "2026-06-17T10:05:00Z"
    }
  ],
  "stats": {
    "pending": 31,
    "featured": 18,
    "hidden": 7
  },
  "total": 31,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. Phê duyệt một đánh giá hiển thị lên storefront
**`PUT /v1/admin/reviews/:id/approve`**

**Response (200 OK):**
```json
{
  "success": true,
  "id": 101,
  "status": "APPROVED"
}
```

---

### 3. Tạm ẩn một đánh giá khỏi storefront
**`PUT /v1/admin/reviews/:id/hide`**

**Response (200 OK):**
```json
{
  "success": true,
  "id": 101,
  "status": "HIDDEN"
}
```

---

### 4. Thiết lập / bỏ đánh dấu đánh giá nổi bật (Featured)
**`PUT /v1/admin/reviews/:id/feature`**

**Request Body:**
```json
{
  "isFeatured": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "id": 101,
  "status": "FEATURED"
}
```

---

### 5. Duyệt hàng loạt đánh giá (Bulk Publish)
**`POST /v1/admin/reviews/publish-selected`**

**Request Body:**
```json
{
  "ids": [101, 102, 103]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "status": "APPROVED"
}
```

---

### 6. Xoá vĩnh viễn một đánh giá
**`DELETE /v1/admin/reviews/:id`**

**Response (200 OK):**
```json
{
  "success": true,
  "id": 101
}
```

---

## Validation Rules

1. **`isFeatured` (Featured toggle)**: Bắt buộc truyền kiểu Boolean khi gọi PUT `/v1/admin/reviews/:id/feature`.
2. **`ids` (Bulk action)**: Mảng `ids` trong body của bulk publish phải là mảng không rỗng, chứa các số nguyên đại diện cho ID review hợp lệ.
3. **Phân quyền (Authorization)**: Mọi yêu cầu gọi tới `/v1/admin/reviews` và các endpoint chỉnh sửa đều yêu cầu header `Authorization: Bearer <token>` của người dùng có quyền Admin hoặc Moderator. Trả về `401 Unauthorized` nếu chưa đăng nhập, `403 Forbidden` nếu đăng nhập nhưng không có quyền admin.
