# Admin Coverage Map

## Coverage Status Legend

- `Active`: có route hoặc adapter/domain rõ trong codebase
- `Spec-derived`: có source docs cũ đủ để tái cấu trúc
- `Partial`: chỉ có inventory hoặc hook/API, chưa có package spec hoàn chỉnh
- `Parked`: có dấu vết nhưng không thuộc active taxonomy của phase này

## Entity Mapping

| New entity | Legacy evidence | Code inventory | Status | Notes |
|---|---|---|---|---|
| `store-setting` | `005-admin-store-settings` | `src/app/admin/settings/page.tsx`, `getAdminDashboard()` | `Active + Spec-derived` | simplified owner của brand/contact, homepage, footer, support |
| `product` | `008-admin-catalog-ops`, product-related parts của `004/007` | products/categories/cards admin routes, `AdminProduct*`, `AdminCategory*` | `Active + Spec-derived` | review không thuộc product core |
| `order` | `009-admin-order-ops` | orders routes, `getAdminOrders()`, `getAdminOrder()`, order action mutations | `Active + Spec-derived` | purchase history by `customerId` thuộc entity này |
| `customer` | users inventory từ `010`, order/review/refund customer references | `/admin/users`, `getAdminUsers()` | `Partial` | cần root riêng cho customer info và commerce linkage |
| `refund` | refund part của `009` | `/admin/refunds`, `getAdminRefunds()`, approve/reject refund mutations | `Active + Spec-derived` | tách riêng khỏi order |
| `review` | `006-admin-reviews` | `/admin/reviews`, `getAdminReviews()`, moderation mutations | `Active + Spec-derived` | moderation + public projection control |
| `user` | parked users/messages scope từ `010` | `/admin/users`, user point/block mutations | `Partial` | tách khỏi customer |
| `content` | `004` và `007` historical evidence + active editorial/admin flows | `/admin/banners`, `/admin/articles`, `/admin/faqs`, shared media internals, article-owned `/about` projection | `Active + Spec-derived` | owns banner enablement and article-driven About behavior; removed standalone routes are stale evidence only |
| `noty` | notification fragment của `010` | `/admin/notifications`, `getAdminNotificationSettings()` | `Partial` | remap sang outbound website push only |
| `payment` | checkout/payment data types, order detail fields | `src/domain/checkout.ts`, `AdminOrderDetails.paymentMethod` | `Partial` | admin info only, chưa phải gateway domain |
| `admin-profile` | active self-profile surface | `/admin/profile`, `useProfile()` | `Active` | self-account behavior khác với admin quản lý user khác |
| `payment-collection` | active collect surface | `/admin/collect`, `getAdminCollect()`, `saveAdminCollect()` | `Active` | receive-money configuration khác với payment interpretation |

## Parked Capabilities

| Capability | Where seen | Reason parked |
|---|---|---|
| admin messages | `getAdminMessages()`, old `010` inventory | không thuộc target taxonomy |
| buyer inbox notifications | old `010` notification use cases | `noty` mới không cover inbox |
| leads | `AdminLead` | chưa được chọn làm entity phase này |

## Cross-Domain Links

- `customer` -> `order`: customer profile hiển thị purchase history nhưng không sở hữu order state machine
- `refund` -> `order` -> `payment`: refund decision cần payment evidence nhưng payment vẫn là info domain
- `review` -> `product` + `customer` + `order`: moderation context phải link đủ ba domain
- `store-setting` -> `content`: settings no longer owns banner/about presence; content owns those editorial storefront projections
- `product` -> `content`: product core quyết định commercial state; content quyết định media/editorial richness
- `user` -> `admin-profile`: user là quản trị người khác; admin-profile là self-management
- `payment` -> `payment-collection`: payment đọc operational facts; payment-collection cấu hình cách doanh nghiệp nhận tiền
