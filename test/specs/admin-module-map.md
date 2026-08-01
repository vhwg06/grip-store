# Admin Entity Map

Tài liệu này là entrypoint chuẩn cho admin specs sau khi refactor khỏi cấu trúc module `005..010`.

Source of truth mới nằm tại:

- `specs/admin/_index.md`
- `specs/admin/_priority-matrix.md`
- `specs/admin/_coverage-map.md`

## Canonical Entity Tree

1. `store-setting`
2. `product`
3. `order`
4. `customer`
5. `refund`
6. `review`
7. `user`
8. `noty`
9. `payment`

## Boundary Rules

- `customer` là commerce-facing profile root.
- `user` là website/account/admin-user management domain.
- `order` sở hữu purchase history semantics, kể cả khi entrypoint bắt đầu từ `customerId`.
- `refund` là domain riêng, reference `orderId` và `customerId`.
- `review` là domain moderation riêng, reference `productId`, `orderId`, `customerId`.
- `noty` trong package admin chỉ là outbound push notification hiển thị trên website.
- `payment` trong phase này chỉ là admin-facing payment info gắn với order/refund.

## Priority Model

- `P1`: core execution surface đã có docs/code coverage rõ và cần ưu tiên lock spec
- `P2`: near-core domain đã có surface thật nhưng boundary/spec còn thiếu
- `P3`: extend option có inventory hoặc partial contract nhưng chưa là execution core
- `P4`: parked hoặc deferred capability, chỉ giữ coverage note

## Migration Rule

- Các thư mục `005-admin-store-settings` tới `010-admin-user-engagement-ops` không còn là source of truth.
- Coverage từ các module cũ đã được hấp thụ vào cây `specs/admin/<entity>`.
- Các docs không khớp taxonomy mới được phân loại lại thành `cross-domain evidence` hoặc `parked capability`.
