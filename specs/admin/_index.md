# Admin Specs Index

Đây là source of truth cho admin specs theo entity/domain.

## Reading Order

1. `_priority-matrix.md`
2. `_coverage-map.md`
3. entity package tương ứng

## Entity Packages

| Entity | Priority | Intent |
|---|---|---|
| `store-setting` | `P1` | cấu hình storefront, banner/about linkage, visibility, registry |
| `product` | `P1` | product list/detail/editor, categories, cards, catalog integrity |
| `order` | `P1` | order list/detail/manage, customer-linked purchase history |
| `customer` | `P1` | customer info root, commerce profile, cross-order/review/refund linkage |
| `refund` | `P2` | refund queue, evidence, decision history, order/payment linkage |
| `review` | `P2` | moderation queue, featured/public projection controls |
| `user` | `P2` | website/admin account management, user profile/manage surface |
| `content` | `P2` | media, banners, articles, FAQs, about content, product-linked editorial content |
| `noty` | `P3` | outbound push notification send/list/history for website display |
| `payment` | `P3` | admin payment info surface gắn với order/refund |
| `admin-profile` | `P3` | current admin identity, security posture, recent access trust |
| `payment-collection` | `P3` | payee identity, QR/bank collection setup, receive-money readiness |

## Global Ownership Rule

- Backend owns validation, normalization, ordering, state transitions, derived labels, permission, persistence, integrity.
- Frontend owns render, collect input, submit intent, show loading/success/error, navigation.
- Nếu FE phải tính business state để spec có thể chạy, entity đó chưa được khóa contract.

## Package File Contract

Mỗi entity phải có:

- `overview.md`
- `use-cases.md`
- `scenarios.md`
- `domain-model.md`
- `ownership.md`
- `coverage.md`
