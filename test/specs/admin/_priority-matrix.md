# Admin Priority Matrix

## P1 Core

| Entity | Why core now | Covered surface |
|---|---|---|
| `store-setting` | storefront configuration đã có spec và contract rõ nhất | `/admin/settings`, `/api/admin/store-settings` |
| `product` | catalog ops là admin execution core | `/admin/products`, `/admin/product/new`, `/admin/product/edit/[id]`, `/admin/categories` |
| `order` | order operations là dòng vận hành chính | `/admin/orders`, `/admin/orders/[id]`, order admin endpoints |
| `customer` | cần root riêng để gom customer info và liên kết commerce surfaces | `/admin/users`, customer-linked order/review/refund references |

## P2 Near-Core

| Entity | Why near-core | Covered surface |
|---|---|---|
| `refund` | surface có thật nhưng đang bị gộp trong order | `/admin/refunds`, refund decision endpoints |
| `review` | moderation đã có spec tốt nhưng chưa là core operational package | `/admin/reviews`, review moderation endpoints |
| `user` | route/hook/API có thật nhưng chưa có package spec active | `/admin/users`, user account admin actions |
| `content` | có nhiều editorial surface liên kết nhưng đã được giản lược về ownership | `/admin/banners`, `/admin/articles`, `/admin/faqs`, shared media internals, public `/about` projection từ article ownership |

## P3 Extend

| Entity | Why extend | Covered surface |
|---|---|---|
| `noty` | chỉ cần outbound push notification ở phase này | `/admin/notifications`, `/api/admin/notifications` |
| `payment` | phase này chỉ cần payment info linkage | order detail + checkout payment types |
| `admin-profile` | self-management là domain riêng nhưng không phải storefront core | `/admin/profile` |
| `payment-collection` | receive-money setup có surface thật nhưng hẹp hơn order/payment core | `/admin/collect` |

## P4 Parked / Deferred

| Capability | Reason |
|---|---|
| admin messages / inbox | bị loại khỏi active scope |
| buyer notification inbox | không thuộc `noty` taxonomy mới |
| leads / announcement / data utilities | chưa nằm trong target entity list |
| full payment gateway lifecycle | vượt quá `payment info` scope hiện tại |
